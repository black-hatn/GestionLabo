"""
Result Service - handles exam result business logic
"""

import logging
import math
import uuid as _uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exam import Exam
from app.models.exam_request import ExamRequest, ExamRequestStatus
from app.models.invoice import Invoice as InvoiceModel
from app.models.invoice import InvoiceStatus
from app.models.patient import Patient
from app.models.result import Result
from app.models.user import User
from app.schemas.domain import ResultCreate, ResultRead
from app.utils.email_service import send_result_notification
from app.utils.numbering import next_invoice_number

logger = logging.getLogger(__name__)


def _enrich_result(db: Session, result: Result) -> dict:
    """Enrichit un résultat unique (utilisé après création/modification)."""
    base = ResultRead.model_validate(result).model_dump()

    er = db.get(ExamRequest, result.exam_request_id)
    if er:
        patient = db.get(Patient, er.patient_id)
        exam = db.get(Exam, er.exam_id)
        tester = db.get(User, result.tested_by)

        base["patient_id"] = er.patient_id
        base["patient_name"] = (
            f"{patient.first_name} {patient.last_name}" if patient else "—"
        )
        base["record_number"] = patient.record_number if patient else "—"
        base["exam_id"] = er.exam_id
        base["exam_name"] = exam.name if exam else "—"
        base["exam_unit"] = exam.unit if exam else ""
        base["tested_by_name"] = (
            f"{tester.first_name} {tester.last_name}" if tester else result.tested_by
        )
    else:
        base["patient_id"] = None
        base["patient_name"] = "—"
        base["record_number"] = "—"
        base["exam_id"] = None
        base["exam_name"] = "—"
        base["exam_unit"] = ""
        base["tested_by_name"] = result.tested_by

    return base


def _enrich_results_many(db: Session, results: list[Result]) -> list[dict]:
    """Enrichit une liste de résultats en une seule passe (sans N+1)."""
    if not results:
        return []

    er_ids = list({r.exam_request_id for r in results})
    tester_ids = list({r.tested_by for r in results if r.tested_by})

    exam_requests = {
        er.id: er
        for er in db.scalars(select(ExamRequest).where(ExamRequest.id.in_(er_ids)))
    }

    patient_ids = list({er.patient_id for er in exam_requests.values()})
    exam_ids = list({er.exam_id for er in exam_requests.values()})

    patients = (
        {
            p.id: p
            for p in db.scalars(select(Patient).where(Patient.id.in_(patient_ids)))
        }
        if patient_ids
        else {}
    )
    exams = (
        {e.id: e for e in db.scalars(select(Exam).where(Exam.id.in_(exam_ids)))}
        if exam_ids
        else {}
    )
    testers = (
        {u.id: u for u in db.scalars(select(User).where(User.id.in_(tester_ids)))}
        if tester_ids
        else {}
    )

    enriched = []
    for result in results:
        base = ResultRead.model_validate(result).model_dump()
        er = exam_requests.get(result.exam_request_id)
        if er:
            patient = patients.get(er.patient_id)
            exam = exams.get(er.exam_id)
            tester = testers.get(result.tested_by)
            base["patient_id"] = er.patient_id
            base["patient_name"] = (
                f"{patient.first_name} {patient.last_name}" if patient else "—"
            )
            base["record_number"] = patient.record_number if patient else "—"
            base["exam_id"] = er.exam_id
            base["exam_name"] = exam.name if exam else "—"
            base["exam_unit"] = exam.unit if exam else ""
            base["tested_by_name"] = (
                f"{tester.first_name} {tester.last_name}"
                if tester
                else result.tested_by
            )
        else:
            base["patient_id"] = None
            base["patient_name"] = "—"
            base["record_number"] = "—"
            base["exam_id"] = None
            base["exam_name"] = "—"
            base["exam_unit"] = ""
            base["tested_by_name"] = result.tested_by
        enriched.append(base)
    return enriched


def _auto_invoice(
    db: Session, result: Result, exam_request: ExamRequest | None
) -> None:
    """
    Auto-génère une facture BROUILLON lors de la création d'un résultat.
    Le montant correspond au prix de l'examen (champ price du modèle Exam).
    Passe à 5000 XOF par défaut si le prix n'est pas renseigné.
    Ignore la création si une facture BROUILLON existe déjà dans les 7 derniers jours.
    Toutes les erreurs sont atténuées pour ne jamais bloquer l'opération principale.
    """
    try:
        if exam_request is None:
            return
        # Récupèrer le prix de l'examen
        exam = db.get(Exam, exam_request.exam_id)
        exam_price = (
            Decimal(str(exam.price)) if exam and exam.price else Decimal("5000.00")
        )

        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        existing = (
            db.query(InvoiceModel)
            .filter(
                InvoiceModel.patient_id == exam_request.patient_id,
                InvoiceModel.created_at >= week_ago,
                InvoiceModel.status == "BROUILLON",
            )
            .first()
        )
        if not existing:
            inv_number = next_invoice_number(db)
            auto_invoice = InvoiceModel(
                id=str(_uuid.uuid4()),
                patient_id=exam_request.patient_id,
                invoice_number=inv_number,
                total_amount=exam_price,
                paid_amount=Decimal("0.00"),
                status=InvoiceStatus.BROUILLON,
                issue_date=date.today(),
                due_date=date.today() + timedelta(days=30),
            )
            db.add(auto_invoice)
            db.commit()
            db.refresh(auto_invoice)
            logger.info(
                "[AUTO-INVOICE] Créée %s pour patient %s (montant: %s XOF)",
                auto_invoice.invoice_number,
                exam_request.patient_id,
                exam_price,
            )
        else:
            logger.info(
                "[AUTO-INVOICE] Ignorée — facture BROUILLON %s existe déjà pour patient %s",
                existing.invoice_number,
                exam_request.patient_id,
            )
    except Exception as e:
        logger.error("[AUTO-INVOICE-ERROR] %s", e)


class ResultService:
    """Service for exam result operations"""

    @staticmethod
    def list_results(db: Session, page: int = 1, limit: int = 10):
        """List results with pagination and enriched data."""
        query = db.query(Result).order_by(Result.tested_at.desc())
        total = query.count()
        results = query.offset((page - 1) * limit).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": max(1, math.ceil(total / limit)),
            "items": _enrich_results_many(db, results),
        }

    @staticmethod
    def create_result(
        db: Session, result_create: ResultCreate, current_user: str = None
    ):
        """Crée un nouveau résultat."""
        db_result = Result(
            id=str(_uuid.uuid4()),
            exam_request_id=result_create.exam_request_id,
            tested_by=result_create.tested_by or current_user,
            value=result_create.value,
            reference_value=result_create.reference_value,
            status=result_create.status,
            notes=result_create.notes,
            tested_at=datetime.now(timezone.utc),
        )
        db.add(db_result)
        # Marquer la demande d'examen comme TERMINE
        er = (
            db.query(ExamRequest)
            .filter(ExamRequest.id == result_create.exam_request_id)
            .first()
        )
        if er:
            er.status = ExamRequestStatus.TERMINE
        db.commit()
        db.refresh(db_result)

        # Auto-générer la facture (l'examen est maintenant terminé)
        _auto_invoice(db, db_result, er)

        # Notification email (graceful — ne lève jamais d'exception)
        try:
            status_val = result_create.status
            if hasattr(status_val, "value"):
                status_val = status_val.value
            if er:
                email_status = "TERMINE"
                if status_val == "ANORMAL":
                    email_status = "ANORMAL"
                elif status_val == "CRITIQUE":
                    email_status = "CRITIQUE"
                patient = db.query(Patient).filter(Patient.id == er.patient_id).first()
                exam = db.query(Exam).filter(Exam.id == er.exam_id).first()
                if patient and patient.email and exam:
                    send_result_notification(
                        patient_email=patient.email,
                        patient_name=f"{patient.first_name} {patient.last_name}",
                        exam_type=exam.name,
                        status=email_status,
                        result_id=str(db_result.id),
                    )
        except Exception as exc:
            logger.warning("[EMAIL-HOOK] create_result notification ignorée: %s", exc)
        return _enrich_result(db, db_result)

    @staticmethod
    def get_result(db: Session, result_id: str):
        """Get a result by ID."""
        result = db.query(Result).filter(Result.id == result_id).first()
        if not result:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé"
            )
        return _enrich_result(db, result)

    @staticmethod
    def update_result(db: Session, result_id: str, result_update):
        """Update a result."""
        result = db.query(Result).filter(Result.id == result_id).first()
        if not result:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé"
            )

        if result_update.value is not None:
            result.value = result_update.value
        if result_update.reference_value is not None:
            result.reference_value = result_update.reference_value
        if result_update.status is not None:
            result.status = result_update.status
        if result_update.notes is not None:
            result.notes = result_update.notes

        db.commit()
        db.refresh(result)

        # Auto-générer une facture à chaque mise à jour de statut (idempotent — ignorée si une
        # facture BROUILLON existe déjà dans les 7 derniers jours).
        if result_update.status is not None:
            er_for_invoice = (
                db.query(ExamRequest)
                .filter(ExamRequest.id == result.exam_request_id)
                .first()
            )
            _auto_invoice(db, result, er_for_invoice)

        # Send email notification on status change (graceful — never raises)
        try:
            if result_update.status is not None:
                status_val = result_update.status
                if hasattr(status_val, "value"):
                    status_val = status_val.value
                er = (
                    db.query(ExamRequest)
                    .filter(ExamRequest.id == result.exam_request_id)
                    .first()
                )
                if er:
                    email_status = "TERMINE"
                    if status_val == "ANORMAL":
                        email_status = "ANORMAL"
                    elif status_val == "CRITIQUE":
                        email_status = "CRITIQUE"
                    patient = (
                        db.query(Patient).filter(Patient.id == er.patient_id).first()
                    )
                    exam = db.query(Exam).filter(Exam.id == er.exam_id).first()
                    if patient and patient.email and exam:
                        send_result_notification(
                            patient_email=patient.email,
                            patient_name=f"{patient.first_name} {patient.last_name}",
                            exam_type=exam.name,
                            status=email_status,
                            result_id=str(result.id),
                        )
        except Exception as exc:
            logger.warning("[EMAIL-HOOK] update_result notification skipped: %s", exc)
        return _enrich_result(db, result)

    @staticmethod
    def delete_result(db: Session, result_id: str):
        """Delete a result."""
        result = db.query(Result).filter(Result.id == result_id).first()
        if not result:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé"
            )
        db.delete(result)
        db.commit()
        return {"message": "Résultat supprimé"}

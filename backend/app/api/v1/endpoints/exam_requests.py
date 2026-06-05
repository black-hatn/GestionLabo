from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
import math

from app.api.deps import get_current_user, require_roles
from app.config.database import get_db
from app.models.exam_request import ExamRequest
from app.models.patient import Patient
from app.models.exam import Exam
from app.models.user import User, UserRole
from app.schemas.domain import ExamRequestCreate, ExamRequestRead, ExamRequestUpdate

router = APIRouter()

ALL_ROLES  = (UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.COLLECTOR, UserRole.LAB_TECH, UserRole.DOCTOR)
CREATE_ROLES = (UserRole.ADMIN, UserRole.RECEPTIONIST)
STATUS_ROLES = (UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.COLLECTOR, UserRole.LAB_TECH)


def _enrich(db: Session, er: ExamRequest) -> dict:
    """Enrichit un ExamRequest unique (utilisé après création/modification)."""
    base = ExamRequestRead.model_validate(er).model_dump()
    patient = db.get(Patient, er.patient_id)
    exam    = db.get(Exam, er.exam_id)
    doctor  = db.get(User, er.doctor_id)
    base["patient_name"]  = f"{patient.first_name} {patient.last_name}" if patient else "—"
    base["record_number"] = patient.record_number if patient else "—"
    base["exam_name"]     = exam.name if exam else "—"
    base["exam_unit"]     = exam.unit or "" if exam else ""
    base["doctor_name"]   = f"{doctor.first_name} {doctor.last_name}" if doctor else "—"
    return base


def _enrich_many(db: Session, items: list[ExamRequest]) -> list[dict]:
    """Enrichit une liste d'ExamRequests en une seule passe (sans N+1)."""
    if not items:
        return []

    patient_ids = list({er.patient_id for er in items})
    exam_ids    = list({er.exam_id    for er in items})
    doctor_ids  = list({er.doctor_id  for er in items})

    patients = {p.id: p for p in db.scalars(select(Patient).where(Patient.id.in_(patient_ids)))}
    exams    = {e.id: e for e in db.scalars(select(Exam).where(Exam.id.in_(exam_ids)))}
    doctors  = {u.id: u for u in db.scalars(select(User).where(User.id.in_(doctor_ids)))}

    result = []
    for er in items:
        base    = ExamRequestRead.model_validate(er).model_dump()
        patient = patients.get(er.patient_id)
        exam    = exams.get(er.exam_id)
        doctor  = doctors.get(er.doctor_id)
        base["patient_name"]  = f"{patient.first_name} {patient.last_name}" if patient else "—"
        base["record_number"] = patient.record_number if patient else "—"
        base["exam_name"]     = exam.name if exam else "—"
        base["exam_unit"]     = exam.unit or "" if exam else ""
        base["doctor_name"]   = f"{doctor.first_name} {doctor.last_name}" if doctor else "—"
        result.append(base)
    return result


@router.get("")
def list_exam_requests(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: str = Query("", min_length=0),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    from sqlalchemy import or_
    q = db.query(ExamRequest)
    if search:
        q = (
            q.join(Patient, Patient.id == ExamRequest.patient_id)
             .join(Exam, Exam.id == ExamRequest.exam_id)
             .filter(or_(
                 Patient.first_name.ilike(f"%{search}%"),
                 Patient.last_name.ilike(f"%{search}%"),
                 Exam.name.ilike(f"%{search}%"),
             ))
        )
    total = q.with_entities(func.count(ExamRequest.id)).scalar()
    items = (
        q.order_by(ExamRequest.requested_at.desc())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )
    return {
        "items": _enrich_many(db, items),
        "total": total, "page": page, "limit": limit,
        "pages": max(1, math.ceil(total / limit)),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_exam_request(
    payload: ExamRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*CREATE_ROLES)),
):
    item = ExamRequest(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return _enrich(db, item)


@router.get("/{request_id}")
def get_exam_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    item = db.get(ExamRequest, request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return _enrich(db, item)


@router.put("/{request_id}")
def update_exam_request(
    request_id: str,
    payload: ExamRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*STATUS_ROLES)),
):
    item = db.get(ExamRequest, request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Demande non trouvée")

    # Règles de transition de statut
    role = current_user.role
    new_status = payload.status

    if role == UserRole.COLLECTOR:
        # Le préleveur peut seulement passer EN_ATTENTE → EN_COURS
        if item.status.value != "EN_ATTENTE" or new_status != "EN_COURS":
            raise HTTPException(status_code=403, detail="Le préleveur peut seulement passer EN_ATTENTE → EN_COURS")

    if role == UserRole.LAB_TECH:
        # Le technicien peut seulement passer EN_COURS → TERMINE ou ANNULE
        if item.status.value != "EN_COURS" or new_status not in ("TERMINE", "ANNULE"):
            raise HTTPException(status_code=403, detail="Le technicien peut seulement passer EN_COURS → TERMINE/ANNULE")

    item.status = new_status
    db.commit()
    db.refresh(item)
    return _enrich(db, item)


@router.delete("/{request_id}")
def delete_exam_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    item = db.get(ExamRequest, request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    db.delete(item)
    db.commit()
    return {"message": "Demande supprimée"}

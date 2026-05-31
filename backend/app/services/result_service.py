"""
Result Service - handles exam result business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.result import Result
from app.models.exam_request import ExamRequest
from app.models.patient import Patient
from app.models.exam import Exam
from app.models.user import User
from app.schemas.domain import ResultCreate, ResultRead
from uuid import uuid4
from datetime import datetime
import math


def _enrich_result(db: Session, result: Result) -> dict:
    """Add patient and exam info to a result dict."""
    base = ResultRead.model_validate(result).model_dump()

    # Fetch related exam request
    er = db.query(ExamRequest).filter(ExamRequest.id == result.exam_request_id).first()
    if er:
        patient = db.query(Patient).filter(Patient.id == er.patient_id).first()
        exam    = db.query(Exam).filter(Exam.id == er.exam_id).first()
        tester  = db.query(User).filter(User.id == result.tested_by).first()

        base["patient_id"]    = er.patient_id
        base["patient_name"]  = f"{patient.first_name} {patient.last_name}" if patient else "—"
        base["record_number"] = patient.record_number if patient else "—"
        base["exam_id"]       = er.exam_id
        base["exam_name"]     = exam.name if exam else "—"
        base["exam_unit"]     = exam.unit if exam else ""
        base["tested_by_name"] = (
            f"{tester.first_name} {tester.last_name}" if tester else result.tested_by
        )
    else:
        base["patient_id"]    = None
        base["patient_name"]  = "—"
        base["record_number"] = "—"
        base["exam_id"]       = None
        base["exam_name"]     = "—"
        base["exam_unit"]     = ""
        base["tested_by_name"] = result.tested_by

    return base


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
            "items": [_enrich_result(db, r) for r in results],
        }

    @staticmethod
    def create_result(db: Session, result_create: ResultCreate, current_user: str = None):
        """Create a new result."""
        db_result = Result(
            id=str(uuid4()),
            exam_request_id=result_create.exam_request_id,
            tested_by=result_create.tested_by or current_user,
            value=result_create.value,
            reference_value=result_create.reference_value,
            status=result_create.status,
            notes=result_create.notes,
            tested_at=datetime.utcnow(),
        )
        db.add(db_result)
        # Mark exam request as TERMINE
        er = db.query(ExamRequest).filter(ExamRequest.id == result_create.exam_request_id).first()
        if er:
            from app.models.exam_request import ExamRequestStatus
            er.status = ExamRequestStatus.TERMINE
        db.commit()
        db.refresh(db_result)
        return _enrich_result(db, db_result)

    @staticmethod
    def get_result(db: Session, result_id: str):
        """Get a result by ID."""
        result = db.query(Result).filter(Result.id == result_id).first()
        if not result:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé")
        return _enrich_result(db, result)

    @staticmethod
    def update_result(db: Session, result_id: str, result_update):
        """Update a result."""
        result = db.query(Result).filter(Result.id == result_id).first()
        if not result:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé")

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
        return _enrich_result(db, result)

    @staticmethod
    def delete_result(db: Session, result_id: str):
        """Delete a result."""
        result = db.query(Result).filter(Result.id == result_id).first()
        if not result:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé")
        db.delete(result)
        db.commit()
        return {"message": "Résultat supprimé"}

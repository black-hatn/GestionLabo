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

router = APIRouter(
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH))]
)


def _enrich(db: Session, er: ExamRequest) -> dict:
    """Attach patient_name and exam_name to an ExamRequest dict."""
    base = ExamRequestRead.model_validate(er).model_dump()
    patient = db.query(Patient).filter(Patient.id == er.patient_id).first()
    exam    = db.query(Exam).filter(Exam.id == er.exam_id).first()
    doctor  = db.query(User).filter(User.id == er.doctor_id).first()
    base["patient_name"]  = f"{patient.first_name} {patient.last_name}" if patient else "—"
    base["record_number"] = patient.record_number if patient else "—"
    base["exam_name"]     = exam.name if exam else "—"
    base["exam_unit"]     = exam.unit or "" if exam else ""
    base["doctor_name"]   = f"{doctor.first_name} {doctor.last_name}" if doctor else "—"
    return base


@router.get("")
def list_exam_requests(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    total = db.query(func.count(ExamRequest.id)).scalar()
    items = (
        db.query(ExamRequest)
        .order_by(ExamRequest.requested_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return {
        "items":  [_enrich(db, er) for er in items],
        "total":  total,
        "page":   page,
        "limit":  limit,
        "pages":  max(1, math.ceil(total / limit)),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_exam_request(
    payload: ExamRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
):
    item = db.get(ExamRequest, request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    item.status = payload.status
    db.commit()
    db.refresh(item)
    return _enrich(db, item)


@router.delete("/{request_id}")
def delete_exam_request(
    request_id: str,
    db: Session = Depends(get_db),
):
    item = db.get(ExamRequest, request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    db.delete(item)
    db.commit()
    return {"message": "Demande supprimée"}

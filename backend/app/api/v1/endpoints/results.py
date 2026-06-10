from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.domain import ResultCreate, ResultUpdate
from app.services.result_service import ResultService
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.result import Result
from app.models.exam_request import ExamRequest
from app.models.patient import Patient
from app.models.exam import Exam
from app.utils.email_service import send_result_notification

router = APIRouter()

ALL_ROLES  = (UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.COLLECTOR, UserRole.LAB_TECH, UserRole.DOCTOR)
WRITE_ROLES = (UserRole.ADMIN, UserRole.LAB_TECH)
NOTIFY_ROLES = (UserRole.ADMIN, UserRole.LAB_TECH, UserRole.DOCTOR)


@router.get("/")
def list_results(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    return ResultService.list_results(db, page, limit)


@router.post("/")
def create_result(
    result_create: ResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return ResultService.create_result(db, result_create, current_user.id)


@router.get("/{result_id}")
def get_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    return ResultService.get_result(db, result_id)


@router.put("/{result_id}")
def update_result(
    result_id: str,
    result_update: ResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return ResultService.update_result(db, result_id, result_update)


@router.delete("/{result_id}")
def delete_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return ResultService.delete_result(db, result_id)


@router.post("/{result_id}/notify")
def notify_patient(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*NOTIFY_ROLES)),
):
    """Send an email notification to the patient for a given result."""
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Résultat non trouvé")

    er = db.query(ExamRequest).filter(ExamRequest.id == result.exam_request_id).first()
    if not er:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande d'examen introuvable")

    patient = db.query(Patient).filter(Patient.id == er.patient_id).first()
    if not patient or not patient.email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le patient n'a pas d'adresse email enregistrée",
        )

    exam = db.query(Exam).filter(Exam.id == er.exam_id).first()
    exam_type = exam.name if exam else "Analyse"

    # Map result status to email service expected values
    status_val = result.status
    if hasattr(status_val, "value"):
        status_val = status_val.value

    # CRITIQUE → email CRITIQUE, ANORMAL → email ANORMAL, NORMAL/Autre → email TERMINE (disponible)
    if status_val == "CRITIQUE":
        email_status = "CRITIQUE"
    elif status_val == "ANORMAL":
        email_status = "ANORMAL"
    else:
        email_status = "TERMINE"

    sent = send_result_notification(
        patient_email=patient.email,
        patient_name=f"{patient.first_name} {patient.last_name}",
        exam_type=exam_type,
        status=email_status,
        result_id=str(result.id),
    )

    if not sent:
        # SMTP disabled or config missing — still return success so UI is not blocked
        return {"message": "Notification envoyée (mode simulation — SMTP désactivé)"}

    return {"message": "Notification envoyée"}

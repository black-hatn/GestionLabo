from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.patient import Patient
from app.schemas.domain import (
    PatientCreate,
    PatientUpdate,
    PatientRead,
    PaginatedPatientResponse,
)
from app.schemas.common import MessageResponse
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.utils.audit_log import AuditLog

router = APIRouter()

ALL_ROLES = (
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.COLLECTOR,
    UserRole.LAB_TECH,
    UserRole.DOCTOR,
)
WRITE_ROLES = (UserRole.ADMIN, UserRole.RECEPTIONIST)


@router.get("", response_model=PaginatedPatientResponse)
def list_patients(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: str = Query("", min_length=0),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    query = select(Patient)
    if search:
        query = query.where(
            or_(
                Patient.first_name.ilike(f"%{search}%"),
                Patient.last_name.ilike(f"%{search}%"),
                Patient.email.ilike(f"%{search}%"),
                Patient.phone.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(Patient.created_at.desc())
    count_query = select(func.count()).select_from(Patient)
    if search:
        count_query = count_query.where(
            or_(
                Patient.first_name.ilike(f"%{search}%"),
                Patient.last_name.ilike(f"%{search}%"),
                Patient.email.ilike(f"%{search}%"),
                Patient.phone.ilike(f"%{search}%"),
            )
        )
    total = db.scalar(count_query) or 0
    pages = (total + limit - 1) // limit
    offset = (page - 1) * limit
    patients = db.execute(query.offset(offset).limit(limit)).scalars().all()
    AuditLog.log_action(
        db, current_user.id, "LIST_PATIENTS", "patient", "", details={"page": page}
    )
    return {
        "items": patients,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    AuditLog.log_action(db, current_user.id, "GET_PATIENT", "patient", patient_id)
    return patient


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    existing = db.scalar(select(Patient).where(Patient.email == payload.email))
    if existing:
        raise HTTPException(
            status_code=409, detail="Patient avec cet email existe déjà"
        )
    import uuid
    from app.utils.numbering import next_patient_number

    record_number = payload.record_number or next_patient_number(db)

    patient = Patient(
        id=str(uuid.uuid4()),
        record_number=record_number,
        first_name=payload.first_name,
        last_name=payload.last_name,
        birth_date=payload.birth_date,
        sex=payload.sex,
        email=payload.email,
        phone=payload.phone,
        city=payload.city,
        address=payload.address,
        insurance_number=payload.insurance_number,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    AuditLog.log_action(db, current_user.id, "CREATE_PATIENT", "patient", patient.id)
    return patient


@router.put("/{patient_id}", response_model=PatientRead)
def update_patient(
    patient_id: str,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    AuditLog.log_action(db, current_user.id, "UPDATE_PATIENT", "patient", patient_id)
    return patient


@router.delete("/{patient_id}", response_model=MessageResponse)
def delete_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Suppression en cascade manuelle (pas de CASCADE défini sur les FK)
    from app.models.invoice import Invoice
    from app.models.payment import Payment
    from app.models.exam_request import ExamRequest
    from app.models.result import Result

    # 1. Paiements liés aux factures du patient
    invoice_ids = db.execute(
        select(Invoice.id).where(Invoice.patient_id == patient_id)
    ).scalars().all()
    if invoice_ids:
        db.execute(
            select(Payment).where(Payment.invoice_id.in_(invoice_ids))
        )
        for payment in db.execute(
            select(Payment).where(Payment.invoice_id.in_(invoice_ids))
        ).scalars().all():
            db.delete(payment)

    # 2. Factures du patient
    for invoice in db.execute(
        select(Invoice).where(Invoice.patient_id == patient_id)
    ).scalars().all():
        db.delete(invoice)

    # 3. Résultats liés aux demandes d'examen du patient
    exam_req_ids = db.execute(
        select(ExamRequest.id).where(ExamRequest.patient_id == patient_id)
    ).scalars().all()
    if exam_req_ids:
        for result in db.execute(
            select(Result).where(Result.exam_request_id.in_(exam_req_ids))
        ).scalars().all():
            db.delete(result)

    # 4. Demandes d'examen du patient
    for exam_req in db.execute(
        select(ExamRequest).where(ExamRequest.patient_id == patient_id)
    ).scalars().all():
        db.delete(exam_req)

    # 5. Patient lui-même
    db.delete(patient)
    db.commit()

    AuditLog.log_action(db, current_user.id, "DELETE_PATIENT", "patient", patient_id)
    return MessageResponse(message="Patient et toutes ses données supprimés")

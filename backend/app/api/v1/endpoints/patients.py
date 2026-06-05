from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.patient import Patient
from app.schemas.domain import PatientCreate, PatientUpdate, PatientRead, PaginatedPatientResponse
from app.schemas.common import MessageResponse
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.utils.audit_log import AuditLog

router = APIRouter()

ALL_ROLES = (UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.COLLECTOR, UserRole.LAB_TECH, UserRole.DOCTOR)
WRITE_ROLES = (UserRole.ADMIN, UserRole.RECEPTIONIST)

@router.get("", response_model=PaginatedPatientResponse)
def list_patients(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query("", min_length=0),
    current_user: User = Depends(require_roles(*ALL_ROLES)),
):
    query = select(Patient)
    if search:
        query = query.where(or_(
            Patient.first_name.ilike(f"%{search}%"),
            Patient.last_name.ilike(f"%{search}%"),
            Patient.email.ilike(f"%{search}%"),
            Patient.phone.ilike(f"%{search}%"),
        ))
    query = query.order_by(Patient.created_at.desc())
    count_query = select(func.count()).select_from(Patient)
    if search:
        count_query = count_query.where(or_(
            Patient.first_name.ilike(f"%{search}%"),
            Patient.last_name.ilike(f"%{search}%"),
            Patient.email.ilike(f"%{search}%"),
            Patient.phone.ilike(f"%{search}%"),
        ))
    total = db.scalar(count_query)
    pages = (total + limit - 1) // limit
    offset = (page - 1) * limit
    patients = db.execute(query.offset(offset).limit(limit)).scalars().all()
    AuditLog.log_action(db, current_user.id, "LIST_PATIENTS", "patient", "", details={"page": page})
    return {"items": patients, "total": total, "page": page, "limit": limit, "pages": pages}

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
        raise HTTPException(status_code=409, detail="Patient avec cet email existe déjà")
    import uuid
    patient = Patient(
        id=str(uuid.uuid4()),
        record_number=payload.record_number,
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
    db.delete(patient)
    db.commit()
    AuditLog.log_action(db, current_user.id, "DELETE_PATIENT", "patient", patient_id)
    return MessageResponse(message="Patient supprimé")

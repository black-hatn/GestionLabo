"""
Patient Service - handles patient business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.patient import Patient
from app.schemas.domain import PatientCreate, PatientUpdate, PatientRead
from uuid import uuid4


class PatientService:
    """Service for patient operations"""

    @staticmethod
    def list_patients(db: Session, page: int = 1, limit: int = 10, search: str = None):
        """List patients with pagination and optional search"""
        query = db.query(Patient).filter(Patient.is_active == True)

        if search:
            query = query.filter(
                or_(
                    Patient.first_name.ilike(f"%{search}%"),
                    Patient.last_name.ilike(f"%{search}%"),
                    Patient.email.ilike(f"%{search}%"),
                    Patient.record_number.ilike(f"%{search}%"),
                )
            )

        total = query.count()
        patients = query.offset((page - 1) * limit).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": [PatientRead.model_validate(p) for p in patients]
        }

    @staticmethod
    def create_patient(db: Session, patient_create: PatientCreate):
        """Create a new patient"""
        db_patient = Patient(
            id=str(uuid4()),
            record_number=patient_create.record_number,
            first_name=patient_create.first_name,
            last_name=patient_create.last_name,
            birth_date=patient_create.birth_date,
            sex=patient_create.sex,
            email=patient_create.email,
            phone=patient_create.phone,
            city=patient_create.city,
            address=patient_create.address,
            insurance_number=patient_create.insurance_number,
            is_active=True,
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return PatientRead.model_validate(db_patient)

    @staticmethod
    def get_patient(db: Session, patient_id: str):
        """Get a patient by ID"""
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.is_active == True
        ).first()
        if not patient:
            return {"error": "Patient not found"}
        return PatientRead.model_validate(patient)

    @staticmethod
    def update_patient(db: Session, patient_id: str, patient_update: PatientUpdate):
        """Update a patient"""
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return {"error": "Patient not found"}

        update_data = patient_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(patient, key, value)

        db.commit()
        db.refresh(patient)
        return PatientRead.model_validate(patient)

    @staticmethod
    def delete_patient(db: Session, patient_id: str):
        """Soft delete a patient"""
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return {"error": "Patient not found"}

        patient.is_active = False
        db.commit()
        return {"status": "deleted"}

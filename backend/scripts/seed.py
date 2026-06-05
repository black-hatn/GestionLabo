import sys
import os
import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from app.config.database import Base
from app.config.security import hash_password
from app.models.user import User, UserRole
from app.models.patient import Patient, PatientSex
from app.models.exam import Exam
from app.models.exam_request import ExamRequest, ExamRequestStatus
from app.models.invoice import Invoice, InvoiceStatus
from app.models.payment import Payment, PaymentMethod
from app.models.result import Result, ResultStatus

def seed_db():
    engine = create_engine("sqlite:///laboratoire_examens.db")
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        print("Seeding database...")
        
        # 1. Users
        users_to_create = [
            ("admin@novabio.com", "Admin", "NovaBio", UserRole.ADMIN),
            ("receptionist@novabio.com", "Recep", "Tionnist", UserRole.RECEPTIONIST),
            ("collector@novabio.com", "Collec", "Teur", UserRole.COLLECTOR),
            ("tech@novabio.com", "Tech", "Nicien", UserRole.LAB_TECH),
            ("doctor@novabio.com", "Dr. Jean", "Dupont", UserRole.DOCTOR),
        ]
        
        seeded_users = {}
        for email, first, last, role in users_to_create:
            existing = db.scalar(select(User).where(User.email == email))
            if not existing:
                user = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    password_hash=hash_password("password123"),
                    first_name=first,
                    last_name=last,
                    role=role,
                    is_active=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                seeded_users[role] = user
                print(f"User created: {email} ({role})")
            else:
                seeded_users[role] = existing
                print(f"User already exists: {email}")
                
        # 2. Exams
        exams_to_create = [
            ("Hémogramme", "Numération formule sanguine complète", {"min": "4.0", "max": "10.0"}, "G/L"),
            ("Glycémie", "Mesure du taux de glucose dans le sang", {"min": "0.70", "max": "1.10"}, "g/L"),
            ("Cholestérol Total", "Bilan lipidique cholestérol", {"min": "1.50", "max": "2.00"}, "g/L"),
            ("Créatinine", "Évaluation de la fonction rénale", {"min": "5.0", "max": "12.0"}, "mg/L"),
        ]
        
        seeded_exams = []
        for name, desc, ref_vals, unit in exams_to_create:
            existing = db.scalar(select(Exam).where(Exam.name == name))
            if not existing:
                exam = Exam(
                    id=str(uuid.uuid4()),
                    name=name,
                    description=desc,
                    reference_values=ref_vals,
                    unit=unit,
                    is_active=True,
                )
                db.add(exam)
                db.commit()
                db.refresh(exam)
                seeded_exams.append(exam)
                print(f"Exam created: {name}")
            else:
                seeded_exams.append(existing)
                print(f"Exam already exists: {name}")
                
        # 3. Patients
        patients_to_create = [
            ("PAT-0001", "Amina", "Diallo", date(1993, 5, 1), PatientSex.F, "amina@example.com", "770001122", "Dakar"),
            ("PAT-0002", "Mamadou", "Sow", date(1985, 11, 23), PatientSex.M, "mamadou@example.com", "776543210", "Saint-Louis"),
            ("PAT-0003", "Sophie", "Ndiaye", date(2000, 2, 15), PatientSex.F, "sophie@example.com", "781234567", "Thies"),
        ]
        
        seeded_patients = []
        for rec, first, last, bdate, sex, email, phone, city in patients_to_create:
            existing = db.scalar(select(Patient).where(Patient.record_number == rec))
            if not existing:
                patient = Patient(
                    id=str(uuid.uuid4()),
                    record_number=rec,
                    first_name=first,
                    last_name=last,
                    birth_date=bdate,
                    sex=sex,
                    email=email,
                    phone=phone,
                    city=city,
                    is_active=True,
                )
                db.add(patient)
                db.commit()
                db.refresh(patient)
                seeded_patients.append(patient)
                print(f"Patient created: {first} {last}")
            else:
                seeded_patients.append(existing)
                print(f"Patient already exists: {rec}")
                
        # 4. Exam Requests
        if seeded_patients and seeded_exams:
            existing_er = db.query(ExamRequest).first()
            if not existing_er:
                # Request 1: EN_ATTENTE
                er1 = ExamRequest(
                    id=str(uuid.uuid4()),
                    patient_id=seeded_patients[0].id,
                    doctor_id=seeded_users[UserRole.DOCTOR].id,
                    exam_id=seeded_exams[0].id,
                    status=ExamRequestStatus.EN_ATTENTE,
                    sample_type="Sang total EDTA",
                    clinical_info="Bilan général, suspicion d'anémie",
                )
                db.add(er1)
                
                # Request 2: EN_COURS
                er2 = ExamRequest(
                    id=str(uuid.uuid4()),
                    patient_id=seeded_patients[1].id,
                    doctor_id=seeded_users[UserRole.DOCTOR].id,
                    exam_id=seeded_exams[1].id,
                    status=ExamRequestStatus.EN_COURS,
                    sample_type="Plasma fluoré",
                    clinical_info="Suivi diabète type 2",
                )
                db.add(er2)
                
                # Request 3: TERMINE with results
                er3 = ExamRequest(
                    id=str(uuid.uuid4()),
                    patient_id=seeded_patients[2].id,
                    doctor_id=seeded_users[UserRole.DOCTOR].id,
                    exam_id=seeded_exams[2].id,
                    status=ExamRequestStatus.TERMINE,
                    sample_type="Sérum",
                    clinical_info="Bilan lipidique de routine",
                )
                db.add(er3)
                
                db.commit()
                print("Exam requests seeded.")
                
                # Result for er3
                res3 = Result(
                    id=str(uuid.uuid4()),
                    exam_request_id=er3.id,
                    tested_by=seeded_users[UserRole.LAB_TECH].id,
                    value="2.45",
                    reference_value="1.50 - 2.00",
                    status=ResultStatus.ANORMAL,
                    notes="Cholestérol légèrement élevé",
                )
                db.add(res3)
                db.commit()
                print("Results seeded.")
                
        # 5. Invoices
        if seeded_patients:
            existing_inv = db.query(Invoice).first()
            if not existing_inv:
                # Invoice 1: BROUILLON
                inv1 = Invoice(
                    id=str(uuid.uuid4()),
                    patient_id=seeded_patients[0].id,
                    invoice_number="FAC-2026-0001",
                    total_amount=Decimal("15000.00"),
                    paid_amount=Decimal("0.00"),
                    status=InvoiceStatus.BROUILLON,
                    currency="XOF",
                    issue_date=date.today(),
                    due_date=date.today() + timedelta(days=15),
                )
                db.add(inv1)
                
                # Invoice 2: PAYEE
                inv2 = Invoice(
                    id=str(uuid.uuid4()),
                    patient_id=seeded_patients[1].id,
                    invoice_number="FAC-2026-0002",
                    total_amount=Decimal("5000.00"),
                    paid_amount=Decimal("5000.00"),
                    status=InvoiceStatus.PAYEE,
                    currency="XOF",
                    payment_type="MOBILE",
                    issue_date=date.today() - timedelta(days=5),
                    due_date=date.today() + timedelta(days=10),
                    paid_date=date.today() - timedelta(days=5),
                )
                db.add(inv2)
                db.commit()
                
                # Payment for inv2
                pay2 = Payment(
                    id=str(uuid.uuid4()),
                    invoice_id=inv2.id,
                    amount=Decimal("5000.00"),
                    method=PaymentMethod.MOBILE,
                    reference="WAVE-PAY-77654",
                    notes="Wave Payment",
                    paid_at=datetime.utcnow() - timedelta(days=5),
                )
                db.add(pay2)
                
                # Invoice 3: EN_RETARD
                inv3 = Invoice(
                    id=str(uuid.uuid4()),
                    patient_id=seeded_patients[2].id,
                    invoice_number="FAC-2026-0003",
                    total_amount=Decimal("8500.00"),
                    paid_amount=Decimal("0.00"),
                    status=InvoiceStatus.EN_RETARD,
                    currency="XOF",
                    issue_date=date.today() - timedelta(days=30),
                    due_date=date.today() - timedelta(days=15),
                )
                db.add(inv3)
                
                db.commit()
                print("Invoices and payments seeded successfully.")

        print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()

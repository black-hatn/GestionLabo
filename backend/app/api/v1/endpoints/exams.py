from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.exam import Exam
from app.schemas.domain import ExamCreate, ExamUpdate, ExamRead, PaginatedExamResponse
from app.schemas.common import MessageResponse
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.utils.audit_log import AuditLog

router = APIRouter()

@router.get("", response_model=PaginatedExamResponse)
def list_exams(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """List all exams"""
    query = select(Exam).order_by(Exam.created_at.desc())

    # Get total count
    total = db.scalar(select(func.count()).select_from(Exam))
    pages = (total + limit - 1) // limit

    # Get paginated results
    offset = (page - 1) * limit
    items = db.execute(query.offset(offset).limit(limit)).scalars().all()

    result = {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }
    AuditLog.log_action(current_user.id, "LIST_EXAMS", "exam", "")

    return result

@router.get("/{exam_id}", response_model=ExamRead)
def get_exam(exam_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific exam"""
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    AuditLog.log_action(current_user.id, "GET_EXAM", "exam", exam_id)
    return exam

@router.post("", response_model=ExamRead, status_code=status.HTTP_201_CREATED)
def create_exam(payload: ExamCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH))):
    """Create a new exam"""
    import uuid
    exam = Exam(
        id=str(uuid.uuid4()),
        name=payload.name,
        description=payload.description,
        reference_values=payload.reference_values or {},
        unit=payload.unit,
    )
    
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    AuditLog.log_action(current_user.id, "CREATE_EXAM", "exam", exam.id, f"name={exam.name}")
    return exam

@router.put("/{exam_id}", response_model=ExamRead)
def update_exam(exam_id: str, payload: ExamUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH))):
    """Update an exam"""
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(exam, field, value)
    
    db.commit()
    db.refresh(exam)
    
    AuditLog.log_action(current_user.id, "UPDATE_EXAM", "exam", exam_id)
    return exam

@router.delete("/{exam_id}", response_model=MessageResponse)
def delete_exam(exam_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Delete an exam"""
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    db.delete(exam)
    db.commit()

    AuditLog.log_action(current_user.id, "DELETE_EXAM", "exam", exam_id)
    return MessageResponse(message="Exam deleted successfully")


# ── Examens standards de laboratoire ──────────────────────────────────────
DEFAULT_EXAMS = [
    # Hématologie
    {"name": "Numération Formule Sanguine (NFS)",  "unit": "cells/µL", "description": "Analyse complète des éléments figurés du sang"},
    {"name": "Hémoglobine",                         "unit": "g/dL",     "description": "Taux d'hémoglobine"},
    {"name": "Hématocrite",                         "unit": "%",        "description": "Proportion de globules rouges"},
    {"name": "Vitesse de Sédimentation (VS)",        "unit": "mm/h",     "description": "Marqueur d'inflammation"},
    {"name": "Groupage Sanguin ABO-Rhésus",          "unit": "",         "description": "Détermination du groupe sanguin"},
    {"name": "TP / TCA (Bilan de Coagulation)",      "unit": "%/s",      "description": "Exploration de la coagulation"},
    # Biochimie
    {"name": "Glycémie",                             "unit": "mmol/L",   "description": "Taux de glucose sanguin"},
    {"name": "Créatinine",                           "unit": "µmol/L",   "description": "Marqueur de la fonction rénale"},
    {"name": "Urée Sanguine",                        "unit": "mmol/L",   "description": "Marqueur de la fonction rénale"},
    {"name": "Acide Urique",                         "unit": "µmol/L",   "description": "Taux d'acide urique"},
    {"name": "Transaminases ALAT (TGP)",             "unit": "U/L",      "description": "Enzyme hépatique — cytolyse"},
    {"name": "Transaminases ASAT (TGO)",             "unit": "U/L",      "description": "Enzyme hépatique — cytolyse"},
    {"name": "Bilirubine Totale",                    "unit": "µmol/L",   "description": "Marqueur hépatique"},
    {"name": "Protéines Totales",                    "unit": "g/L",      "description": "Taux de protéines sanguines"},
    {"name": "Albumine",                             "unit": "g/L",      "description": "Protéine plasmatique principale"},
    {"name": "Cholestérol Total",                    "unit": "mmol/L",   "description": "Bilan lipidique"},
    {"name": "Triglycérides",                        "unit": "mmol/L",   "description": "Bilan lipidique"},
    {"name": "Calcium Sérique",                      "unit": "mmol/L",   "description": "Taux de calcium"},
    {"name": "Fer Sérique",                          "unit": "µmol/L",   "description": "Taux de fer — bilan martial"},
    {"name": "CRP (Protéine C Réactive)",            "unit": "mg/L",     "description": "Marqueur d'inflammation"},
    # Sérologie / Immunologie
    {"name": "Sérologie VIH (HIV Test)",             "unit": "",         "description": "Dépistage du VIH 1 & 2"},
    {"name": "Sérologie Hépatite B (AgHBs)",         "unit": "",         "description": "Dépistage hépatite B"},
    {"name": "Sérologie Hépatite C",                 "unit": "",         "description": "Dépistage hépatite C"},
    {"name": "TPHA / VDRL (Syphilis)",               "unit": "",         "description": "Dépistage de la syphilis"},
    {"name": "Test de Grossesse (β-HCG)",            "unit": "mUI/mL",   "description": "Détection de la grossesse"},
    # Parasitologie / Microbiologie
    {"name": "Goutte Épaisse — Paludisme",           "unit": "",         "description": "Recherche de Plasmodium sp."},
    {"name": "ECBU (Cytobactériologie Urinaire)",    "unit": "",         "description": "Analyse bactériologique des urines"},
    {"name": "Coproculture",                         "unit": "",         "description": "Analyse bactériologique des selles"},
    {"name": "Examen Parasitologique des Selles",    "unit": "",         "description": "Recherche de parasites intestinaux"},
    {"name": "Bandelette Urinaire (BU)",             "unit": "",         "description": "Analyse urinaire rapide multi-paramètres"},
    # Endocrinologie
    {"name": "TSH (Thyréostimuline)",                "unit": "µUI/mL",   "description": "Exploration de la fonction thyroïdienne"},
    {"name": "PSA (Antigène Prostatique Spécifique)","unit": "ng/mL",    "description": "Marqueur du cancer de la prostate"},
]


@router.post("/seed-defaults", status_code=status.HTTP_200_OK)
def seed_default_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Insère les examens standards s'ils n'existent pas déjà (idempotent)."""
    import uuid
    inserted = 0
    for item in DEFAULT_EXAMS:
        exists = db.scalar(select(func.count()).select_from(Exam).where(Exam.name == item["name"]))
        if not exists:
            db.add(Exam(
                id=str(uuid.uuid4()),
                name=item["name"],
                unit=item["unit"] or None,
                description=item["description"],
                reference_values={},
            ))
            inserted += 1
    db.commit()
    AuditLog.log_action(current_user.id, "SEED_EXAMS", "exam", "", f"inserted={inserted}")
    return {"inserted": inserted, "total_defaults": len(DEFAULT_EXAMS)}

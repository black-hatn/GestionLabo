from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel
from typing import List

from app.config.database import get_db
from app.models.patient import Patient
from app.models.demande import Demande
from app.models.resultat import Resultat
from app.models.examen import Examen

router = APIRouter(prefix="/patient-portal", tags=["Patient Portal"])

class PatientLogin(BaseModel):
    numero_dossier: str
    date_naissance: date

class PatientPortalResponse(BaseModel):
    id_patient: int
    numero_dossier: str
    nom: str
    prenom: str
    date_naissance: date

@router.post("/login", response_model=PatientPortalResponse)
def patient_login(credentials: PatientLogin, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.numero_dossier == credentials.numero_dossier,
        Patient.date_naissance == credentials.date_naissance
    ).first()
    
    if not patient:
        raise HTTPException(status_code=401, detail="Numéro de dossier ou date de naissance incorrect.")
    
    return patient

@router.get("/{patient_id}/examens")
def get_patient_examens(patient_id: int, db: Session = Depends(get_db)):
    # Very basic auth (in production we'd use a JWT for patients)
    patient = db.query(Patient).filter(Patient.id_patient == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
        
    demandes = db.query(Demande).filter(Demande.patient_id == patient_id).order_by(Demande.date_demande.desc()).all()
    
    examens_list = []
    for demande in demandes:
        # A demande has resultats which link to examens
        resultats = db.query(Resultat).filter(Resultat.demande_id == demande.id_demande).all()
        
        # S'il y a des résultats, c'est terminé, sinon c'est en attente/en cours
        status = "Terminé" if resultats else "En cours d'analyse"
        
        for examen in demande.examens:
            examens_list.append({
                "id": f"{demande.id_demande}-{examen.id_examen}",
                "demande_id": demande.id_demande,
                "name": examen.nom,
                "medecin": demande.medecin.nom if demande.medecin else "Non spécifié",
                "date": demande.date_demande.strftime("%d/%m/%Y"),
                "status": status,
                "has_results": bool(resultats)
            })
            
    return examens_list

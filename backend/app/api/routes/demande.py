from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.config.database import get_db
from app.config.security import get_current_user
from app.models.demande import Demande
from app.models.resultat import Resultat
from app.models.user import User
from app.schemas.demande import DemandeCreate, DemandeResponse

router = APIRouter(prefix="/demandes", tags=["Demandes"])

@router.get("/", response_model=List[DemandeResponse])
def get_demandes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Demande).offset(skip).limit(limit).all()

@router.post("/", response_model=DemandeResponse, status_code=status.HTTP_201_CREATED)
def create_demande(demande: DemandeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    numero_demande = f"REQ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    db_demande = Demande(
        patient_id=demande.patient_id,
        medecin_id=demande.medecin_id,
        statut=demande.statut,
        notes=demande.notes,
        numero_demande=numero_demande,
        cree_par_id=current_user.id_utilisateur,
    )
    db.add(db_demande)
    db.commit()
    db.refresh(db_demande)

    for exam_id in demande.examens_ids:
        db.add(Resultat(demande_id=db_demande.id_demande, examen_id=exam_id))

    db.commit()
    db.refresh(db_demande)
    return db_demande

from app.models.patient import Patient
from app.models.examen import Examen
from app.services.pdf_service import generate_report
from fastapi.responses import StreamingResponse

@router.get("/{demande_id}/pdf")
def get_pdf_report(demande_id: int, db: Session = Depends(get_db)):
    demande = db.query(Demande).filter(Demande.id_demande == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande introuvable")
        
    patient = db.query(Patient).filter(Patient.id_patient == demande.patient_id).first()
    
    # Fetch resultats with examens
    resultats = db.query(Resultat).filter(Resultat.demande_id == demande_id).all()
    resultats_with_examen = []
    for res in resultats:
        examen = db.query(Examen).filter(Examen.id_examen == res.examen_id).first()
        resultats_with_examen.append((res, examen))
        
    pdf_buffer = generate_report(demande, patient, resultats_with_examen)
    
    headers = {
        'Content-Disposition': f'attachment; filename="resultats_{demande.numero_demande}.pdf"'
    }
    
    return StreamingResponse(pdf_buffer, headers=headers, media_type='application/pdf')

from datetime import timedelta
@router.get("/statistiques/evolution")
def get_stats_evolution(db: Session = Depends(get_db)):
    today = datetime.now().date()
    stats = []
    labels = []
    
    # Generate labels in French
    jours_fr = {0: 'Lun', 1: 'Mar', 2: 'Mer', 3: 'Jeu', 4: 'Ven', 5: 'Sam', 6: 'Dim'}
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        start_of_day = datetime(target_date.year, target_date.month, target_date.day)
        end_of_day = start_of_day + timedelta(days=1)
        count = db.query(Demande).filter(Demande.date_demande >= start_of_day, Demande.date_demande < end_of_day).count()
        stats.append(count)
        labels.append(jours_fr[target_date.weekday()])
        
    return {"labels": labels, "data": stats}

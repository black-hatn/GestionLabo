from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.config.security import get_current_user
from app.models.medecin import Medecin
from app.models.user import User

router = APIRouter(prefix="/medecins", tags=["Medecins"])

@router.get("/")
def get_medecins(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medecins = db.query(Medecin).all()
    return [
        {
            "id_medecin": m.id_medecin,
            "nom": m.nom,
            "prenom": m.prenom,
            "specialite": m.specialite,
        }
        for m in medecins
    ]

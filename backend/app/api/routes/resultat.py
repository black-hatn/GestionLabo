from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.config.database import get_db
from app.config.security import get_current_user
from app.models.resultat import Resultat
from app.models.user import User
from app.schemas.resultat import ResultatResponse
from pydantic import BaseModel

router = APIRouter(prefix="/resultats", tags=["Resultats"])


class ResultatUpdate(BaseModel):
    valeur: Optional[str] = None
    valeur_numerique: Optional[float] = None
    est_anormal: bool = False
    commentaire: Optional[str] = None


@router.get("/", response_model=List[ResultatResponse])
def get_all_resultats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Resultat).offset(skip).limit(limit).all()


from app.models.examen import Examen

@router.put("/{resultat_id}", response_model=ResultatResponse)
def update_resultat(resultat_id: int, res_update: ResultatUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_res = db.query(Resultat).filter(Resultat.id_resultat == resultat_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Resultat introuvable")

    if res_update.valeur is not None:
        db_res.valeur = res_update.valeur  # type: ignore
        
    if res_update.valeur_numerique is not None:
        db_res.valeur_numerique = res_update.valeur_numerique  # type: ignore
        
        # Interprétation automatique
        examen = db.query(Examen).filter(Examen.id_examen == db_res.examen_id).first()
        if examen and examen.valeur_min_homme is not None and examen.valeur_max_homme is not None:
            if res_update.valeur_numerique < examen.valeur_min_homme or res_update.valeur_numerique > examen.valeur_max_homme:
                db_res.est_anormal = True  # type: ignore
            else:
                db_res.est_anormal = False  # type: ignore
    else:
        # Si on ne donne pas de valeur numérique, on garde ce que le frontend envoie (ou False)
        db_res.est_anormal = res_update.est_anormal  # type: ignore

    if res_update.commentaire is not None:
        db_res.commentaire = res_update.commentaire  # type: ignore

    db.commit()
    db.refresh(db_res)
    return db_res


from app.config.security import get_current_user, require_role
from app.models.demande import Demande

@router.put("/{resultat_id}/validate", response_model=ResultatResponse)
def validate_resultat(
    resultat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "biologiste", "technicien"))
):
    db_res = db.query(Resultat).filter(Resultat.id_resultat == resultat_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Resultat introuvable")

    db_res.est_valide = True  # type: ignore
    db_res.date_validation = datetime.now(timezone.utc)  # type: ignore
    db_res.valide_par_id = current_user.id_utilisateur  # type: ignore

    db.commit()
    db.refresh(db_res)
    
    # Automatisation du statut de la demande
    demande = db.query(Demande).filter(Demande.id_demande == db_res.demande_id).first()
    if demande:
        tous_valides = all(r.est_valide for r in demande.resultats)
        if tous_valides:
            demande.statut = "Terminée"  # type: ignore
            db.commit()

    return db_res

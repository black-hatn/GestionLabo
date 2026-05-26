from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResultatBase(BaseModel):
    examen_id: int
    valeur: Optional[str] = None
    valeur_numerique: Optional[float] = None
    est_anormal: bool = False
    commentaire: Optional[str] = None

class ResultatCreate(ResultatBase):
    pass

class ResultatResponse(ResultatBase):
    id_resultat: int
    demande_id: int
    valide_par_id: Optional[int] = None
    date_saisie: datetime
    date_validation: Optional[datetime] = None
    est_valide: bool
    anteriorite: Optional[str] = None

    model_config = {"from_attributes": True}

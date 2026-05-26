from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class PatientBase(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    sexe: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    profession: Optional[str] = None
    groupe_sanguin: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id_patient: int
    numero_dossier: str
    date_creation: datetime

    model_config = {"from_attributes": True}

from pydantic import BaseModel, computed_field
from typing import Optional, List
from datetime import datetime
from app.schemas.resultat import ResultatResponse

class DemandeBase(BaseModel):
    patient_id: int
    medecin_id: Optional[int] = None
    statut: str = "En attente"
    notes: Optional[str] = None

class DemandeCreate(DemandeBase):
    examens_ids: List[int] # List of IDs to create results entries

class PatientInfo(BaseModel):
    nom: str
    prenom: str
    numero_dossier: str
    sexe: str
    model_config = {"from_attributes": True}

class DemandeResponse(DemandeBase):
    id_demande: int
    numero_demande: str
    cree_par_id: int
    date_demande: datetime
    resultats: List[ResultatResponse] = []
    patient: Optional[PatientInfo] = None

    model_config = {"from_attributes": True}

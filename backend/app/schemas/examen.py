from pydantic import BaseModel
from typing import Optional

class ExamenBase(BaseModel):
    code: str
    libelle: str
    categorie: str
    unite: Optional[str] = None
    valeur_min_homme: Optional[float] = None
    valeur_max_homme: Optional[float] = None
    valeur_min_femme: Optional[float] = None
    valeur_max_femme: Optional[float] = None
    prix: float = 0.0
    delai_heures: int = 24
    description: Optional[str] = None

class ExamenCreate(ExamenBase):
    pass

class ExamenResponse(ExamenBase):
    id_examen: int

    model_config = {"from_attributes": True}

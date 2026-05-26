"""Modèle MEDECIN"""
from sqlalchemy import Column, Integer, String
from app.config.database import Base


class Medecin(Base):
    """Table MEDECIN - Médecins prescripteurs"""
    __tablename__ = "medecin"
    
    id_medecin = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    specialite = Column(String(100), nullable=True)
    telephone = Column(String(15), nullable=True)
    email = Column(String(100), nullable=True, index=True)
    etablissement = Column(String(100), nullable=True)
    
    def __repr__(self):
        return f"<Medecin(id={self.id_medecin}, nom={self.nom})>"

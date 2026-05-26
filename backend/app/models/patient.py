"""Modèle PATIENT"""
from sqlalchemy import Column, Integer, String, Date, CHAR, DateTime
from datetime import datetime
from app.config.database import Base


class Patient(Base):
    """Table PATIENT - Informations patients"""
    __tablename__ = "patient"
    
    id_patient = Column(Integer, primary_key=True, index=True)
    numero_dossier = Column(String(20), unique=True, nullable=False, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    date_naissance = Column(Date, nullable=False)
    sexe = Column(CHAR(1), nullable=False)
    telephone = Column(String(15), nullable=True)
    adresse = Column(String(255), nullable=True)
    profession = Column(String(100), nullable=True)
    groupe_sanguin = Column(String(5), nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Patient(id={self.id_patient}, numero={self.numero_dossier})>"

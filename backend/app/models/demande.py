"""Modèle DEMANDE (Ordonnance / Prescription)"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.config.database import Base


class Demande(Base):
    """Table DEMANDE - Enregistrement d'une prescription"""
    __tablename__ = "demande"
    
    id_demande = Column(Integer, primary_key=True, index=True)
    numero_demande = Column(String(30), unique=True, nullable=False, index=True)
    
    # Clés étrangères
    patient_id = Column(Integer, ForeignKey("patient.id_patient"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("medecin.id_medecin"), nullable=True)
    cree_par_id = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), nullable=False)
    
    date_demande = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    statut = Column(String(20), default="En attente") # En attente, En cours, Terminée
    notes = Column(Text, nullable=True)
    
    # Relations
    patient = relationship("Patient", backref="demandes")
    medecin = relationship("Medecin", backref="demandes")
    createur = relationship("User", foreign_keys=[cree_par_id], backref="demandes_creees")
    resultats = relationship("Resultat", back_populates="demande", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Demande(numero={self.numero_demande}, statut={self.statut})>"

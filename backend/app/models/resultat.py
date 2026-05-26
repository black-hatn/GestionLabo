"""Modèle RESULTAT (Saisie des analyses)"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.config.database import Base


class Resultat(Base):
    """Table RESULTAT - Valeurs trouvées pour une demande"""
    __tablename__ = "resultat"
    
    id_resultat = Column(Integer, primary_key=True, index=True)
    
    # Clés étrangères
    demande_id = Column(Integer, ForeignKey("demande.id_demande"), nullable=False)
    examen_id = Column(Integer, ForeignKey("examen.id_examen"), nullable=False)
    valide_par_id = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), nullable=True)
    
    valeur = Column(String(100), nullable=True)  # Peut être un chiffre ou un texte (ex: Positif/Négatif)
    valeur_numerique = Column(Float, nullable=True) # Pour faciliter les calculs/graphes
    
    date_saisie = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    date_validation = Column(DateTime, nullable=True)
    
    est_anormal = Column(Boolean, default=False)
    est_valide = Column(Boolean, default=False)
    commentaire = Column(Text, nullable=True)
    
    # Relations
    demande = relationship("Demande", back_populates="resultats")
    examen = relationship("Examen")
    validateur = relationship("User")
    
    @property
    def anteriorite(self):
        from sqlalchemy.orm import object_session
        from app.models.demande import Demande
        session = object_session(self)
        if not session or getattr(self, 'demande', None) is None:
            return "-"
            
        last_resultat = (
            session.query(Resultat)
            .join(Demande)
            .filter(
                Demande.patient_id == self.demande.patient_id,
                Resultat.examen_id == self.examen_id,
                Demande.date_demande < self.demande.date_demande,
                Resultat.est_valide == True
            )
            .order_by(Demande.date_demande.desc())
            .first()
        )
        if last_resultat and last_resultat.date_validation:
            date_str = last_resultat.date_validation.strftime('%d/%m/%y')
            if last_resultat.valeur_numerique is not None:
                return f"{last_resultat.valeur_numerique} ({date_str})"
            if last_resultat.valeur:
                return f"{last_resultat.valeur} ({date_str})"
        return "-"

    def __repr__(self):
        return f"<Resultat(examen_id={self.examen_id}, valeur={self.valeur})>"

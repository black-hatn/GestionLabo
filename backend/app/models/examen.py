"""Modèle EXAMEN (Catalogue des analyses)"""
from sqlalchemy import Column, Integer, String, Float, Text
from app.config.database import Base


class Examen(Base):
    """Table EXAMEN - Catalogue des paramètres biologiques"""
    __tablename__ = "examen"
    
    id_examen = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    libelle = Column(String(100), nullable=False)
    categorie = Column(String(50), nullable=False)  # Hématologie, Biochimie...
    unite = Column(String(20), nullable=True)
    valeur_min_homme = Column(Float, nullable=True)
    valeur_max_homme = Column(Float, nullable=True)
    valeur_min_femme = Column(Float, nullable=True)
    valeur_max_femme = Column(Float, nullable=True)
    prix = Column(Float, nullable=False, default=0.0)
    delai_heures = Column(Integer, default=24)
    description = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Examen(code={self.code}, libelle={self.libelle})>"

"""Modèle UTILISATEUR"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


class User(Base):
    """Table UTILISATEUR - Comptes utilisateurs"""
    __tablename__ = "utilisateur"
    
    id_utilisateur = Column(Integer, primary_key=True, index=True)
    identifiant = Column(String(50), unique=True, nullable=False, index=True)
    mot_de_passe = Column(String(255), nullable=False)  # hash bcrypt
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True, index=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    actif = Column(Boolean, default=True)
    id_role = Column(Integer, ForeignKey("role.id_role"), nullable=False)
    
    role = relationship("Role")
    
    def __repr__(self):
        return f"<User(id={self.id_utilisateur}, identifiant={self.identifiant})>"

"""Modèle ROLE"""
from sqlalchemy import Column, Integer, String, Text
from app.config.database import Base


class Role(Base):
    """Table ROLE - Profils utilisateurs"""
    __tablename__ = "role"
    
    id_role = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Role(id={self.id_role}, libelle={self.libelle})>"

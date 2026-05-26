"""Schémas Pydantic pour authentification"""
from pydantic import BaseModel
from typing import Optional


class TokenResponse(BaseModel):
    """Réponse avec token JWT"""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str


class LoginRequest(BaseModel):
    """Requête de connexion"""
    identifiant: str
    mot_de_passe: str


class UserBase(BaseModel):
    """Base pour utilisateur"""
    identifiant: str
    nom: str
    prenom: str
    email: Optional[str] = None
    id_role: int


class UserCreate(UserBase):
    """Créer un utilisateur"""
    mot_de_passe: str


class UserResponse(UserBase):
    """Réponse utilisateur"""
    id_utilisateur: int
    actif: bool
    
    class Config:
        from_attributes = True

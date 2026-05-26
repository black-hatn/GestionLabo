"""Routes d'authentification"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import auth_service
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authentifier un utilisateur et retourner un token JWT
    """
    user = auth_service.authenticate_user(db, request.identifiant, request.mot_de_passe)
    access_token = auth_service.create_access_token_for_user(user)
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id_utilisateur,
        role=user.role.libelle if user.role else "inconnu"
    )


@router.post("/logout")
def logout():
    """
    Déconnecter un utilisateur (côté client : supprimer le token)
    """
    return {"message": "Déconnecté avec succès"}

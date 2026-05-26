"""Service d'authentification"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.config.security import verify_password, get_password_hash, create_access_token
from app.utils.exceptions import InvalidCredentialsError, UserNotFoundError


class AuthService:
    """Service pour l'authentification"""
    
    @staticmethod
    def authenticate_user(db: Session, identifiant: str, mot_de_passe: str) -> User:
        """Authentifier un utilisateur"""
        user = db.query(User).filter(User.identifiant == identifiant).first()
        
        if not user:
            raise UserNotFoundError()
        
        if not verify_password(mot_de_passe, user.mot_de_passe):
            raise InvalidCredentialsError()
        
        if not user.actif:
            raise InvalidCredentialsError()
        
        return user
    
    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        """Créer un token JWT pour un utilisateur"""
        data = {
            "sub": str(user.id_utilisateur),
            "identifiant": user.identifiant,
            "role_id": user.id_role
        }
        return create_access_token(data)
    
    @staticmethod
    def create_user(db: Session, identifiant: str, mot_de_passe: str, nom: str, 
                    prenom: str, id_role: int, email: str = None) -> User:
        """Créer un nouvel utilisateur"""
        hashed_password = get_password_hash(mot_de_passe)
        
        user = User(
            identifiant=identifiant,
            mot_de_passe=hashed_password,
            nom=nom,
            prenom=prenom,
            email=email,
            id_role=id_role
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


auth_service = AuthService()

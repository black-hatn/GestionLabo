import random
import string
import uuid
from datetime import datetime, timedelta, timezone

from app.api.deps import get_current_user
from app.config.database import get_db
from app.config.security import (
    create_access_token,
    create_refresh_token,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.config.settings import get_settings
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.domain import (
    LoginRequest,
    RefreshRequest,
    TokenPair,
    UserCreate,
    UserRead,
)
from app.utils.audit_log import AuditLog
from app.utils.rate_limit import rate_limiter
from app.utils.two_factor import TwoFactorService
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session


class OTPRequest(BaseModel):
    email: str


class OTPVerification(BaseModel):
    email: str
    otp: str


router = APIRouter()
settings = get_settings()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré")
    # Empêcher l'auto-attribution du rôle ADMIN via l'inscription publique
    role = payload.role
    if str(role).upper() == "ADMIN":
        role = "DOCTOR"
    # Generate UUID if not provided
    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/seed", response_model=MessageResponse)
def seed(db: Session = Depends(get_db)):
    if settings.ENVIRONMENT == "production":
        raise HTTPException(status_code=403, detail="Seed désactivé en production")
    _s = settings
    existing = db.scalar(select(User).where(User.email == _s.ADMIN_EMAIL))
    if existing:
        return MessageResponse(message="L'administrateur a déjà été initialisé")
    from datetime import datetime

    user = User(
        id=str(uuid.uuid4()),
        email=_s.ADMIN_EMAIL,
        password_hash=hash_password(_s.ADMIN_PASSWORD),
        first_name="Admin",
        last_name="NovaBio",
        role="ADMIN",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    return MessageResponse(message="L'administrateur a été initialisé avec succès")


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if not rate_limiter.is_allowed(f"login:{payload.email}", max_requests=5, window=60):
        raise HTTPException(
            status_code=429, detail="Trop de tentatives. Réessayez dans 1 minute."
        )
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        if user:
            AuditLog.log_action(
                db,
                user.id,
                "LOGIN_FAILED",
                "auth",
                user.id,
                status="FAILURE",
                details={"reason": "bad_password"},
            )
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    if not user.is_active:
        AuditLog.log_action(
            db,
            user.id,
            "LOGIN_FAILED",
            "auth",
            user.id,
            status="FAILURE",
            details={"reason": "account_disabled"},
        )
        raise HTTPException(
            status_code=403, detail="Compte désactivé. Contactez l'administrateur."
        )
    AuditLog.log_action(
        db, user.id, "LOGIN", "auth", user.id, details={"email": user.email}
    )
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_payload = decode_token(payload.refresh_token)
    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=401, detail="Token de rafraîchissement invalide"
        )
    user = db.get(User, token_payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur inactif")
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout():
    return MessageResponse(message="Déconnexion réussie")


# ── Changement de mot de passe ────────────────────────────────────────────────


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    body: ChangePasswordBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permet à un utilisateur authentifié de changer son mot de passe."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    AuditLog.log_action(db, current_user.id, "CHANGE_PASSWORD", "auth", current_user.id)
    return MessageResponse(message="Mot de passe modifié avec succès")


@router.post("/2fa/request-otp", response_model=MessageResponse)
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """Demande un code OTP pour l'authentification à deux facteurs"""
    if not rate_limiter.is_allowed(f"otp:{payload.email}", max_requests=3, window=60):
        raise HTTPException(
            status_code=429, detail="Trop de tentatives. Réessayez dans 1 minute."
        )
    user = db.scalar(select(User).where(User.email == payload.email))
    # Message générique pour éviter l'énumération des emails
    if not user:
        return MessageResponse(message="Si cet email existe, un OTP a été envoyé")

    otp = TwoFactorService.generate_otp()
    TwoFactorService.send_otp_email(payload.email, otp, db)
    AuditLog.log_action(db, user.id, "REQUEST_OTP", "auth", "otp_request")

    return MessageResponse(message="Si cet email existe, un OTP a été envoyé")


@router.post("/2fa/verify-otp", response_model=TokenPair)
def verify_otp(payload: OTPVerification, db: Session = Depends(get_db)):
    """Vérifie le code OTP et retourne les tokens"""
    user = db.scalar(select(User).where(User.email == payload.email))
    # Message générique pour éviter l'énumération des emails
    if not user or not TwoFactorService.verify_otp(payload.email, payload.otp, db):
        if user:
            AuditLog.log_action(
                db,
                user.id,
                "VERIFY_OTP_FAILED",
                "auth",
                "otp_verification",
                status="FAILED",
            )
        raise HTTPException(status_code=401, detail="Code OTP invalide ou expiré")

    AuditLog.log_action(db, user.id, "VERIFY_OTP_SUCCESS", "auth", "otp_verification")

    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


# ── Password Reset ────────────────────────────────────────────────────────────


class PasswordResetRequestBody(BaseModel):
    email: str


class PasswordResetVerifyBody(BaseModel):
    email: str
    code: str


class PasswordResetConfirmBody(BaseModel):
    token: str
    new_password: str


@router.post("/password-reset-request")
def password_reset_request(
    body: PasswordResetRequestBody, db: Session = Depends(get_db)
):
    if not rate_limiter.is_allowed(f"pwreset:{body.email}", max_requests=3, window=300):
        raise HTTPException(
            status_code=429, detail="Trop de tentatives. Réessayez dans 5 minutes."
        )
    user = db.scalar(select(User).where(User.email == body.email))
    if user:
        code = "".join(random.choices(string.digits, k=6))
        # Delete any existing tokens for this email
        db.query(PasswordResetToken).filter(
            PasswordResetToken.email == body.email
        ).delete()
        # Persist new token to DB
        db.add(
            PasswordResetToken(
                email=body.email,
                code=code,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
            )
        )
        db.commit()
        # Send email (graceful fail)
        try:
            from app.utils.email_service import send_email

            send_email(
                to=body.email,
                subject="Code de réinitialisation — NovaBio Lab",
                html_body=f"<p>Votre code de réinitialisation est : <strong>{code}</strong></p><p>Valable 15 minutes.</p>",
            )
        except Exception:
            pass
    return {"message": "Si cette adresse existe, un code a été envoyé."}


@router.post("/password-reset-verify")
def password_reset_verify(body: PasswordResetVerifyBody, db: Session = Depends(get_db)):
    token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.email == body.email, PasswordResetToken.used == False
        )  # noqa: E712
        .order_by(PasswordResetToken.created_at.desc())
        .first()
    )
    if not token or token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(
        timezone.utc
    ):
        raise HTTPException(status_code=400, detail="Code invalide ou expiré")
    if token.code != body.code:
        raise HTTPException(status_code=400, detail="Code incorrect")
    # Issue a short-lived reset token (type="reset")
    reset_token = create_token(
        subject=body.email,
        token_type="reset",
        expires_delta=timedelta(minutes=15),
    )
    return {"valid": True, "token": reset_token}


@router.post("/password-reset-confirm")
def password_reset_confirm(
    body: PasswordResetConfirmBody, db: Session = Depends(get_db)
):
    from app.config.settings import get_settings
    from jose import JWTError

    _settings = get_settings()
    try:
        from jose import jwt

        payload = jwt.decode(
            body.token, _settings.SECRET_KEY, algorithms=[_settings.ALGORITHM]
        )
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Token invalide")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.password_hash = hash_password(body.new_password)
    # Mark all reset tokens for this email as used
    db.query(PasswordResetToken).filter(PasswordResetToken.email == email).update(
        {"used": True}
    )
    db.commit()
    return {"message": "Mot de passe réinitialisé avec succès"}

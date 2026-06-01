from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import string

from app.api.deps import get_current_user
from app.config.database import get_db
from app.config.security import create_access_token, create_refresh_token, create_token, decode_token, hash_password, verify_password
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.schemas.common import MessageResponse
from app.schemas.domain import LoginRequest, RefreshRequest, TokenPair, UserCreate, UserRead
from app.utils.two_factor import TwoFactorService
from app.utils.audit_log import AuditLog
from pydantic import BaseModel

class OTPRequest(BaseModel):
    email: str

class OTPVerification(BaseModel):
    email: str
    otp: str

# In-memory reset tokens: { email: { "code": "123456", "expires": datetime } }
_reset_tokens: dict = {}

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Generate UUID if not provided
    import uuid
    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/seed", response_model=MessageResponse)
def seed(db: Session = Depends(get_db)):
    from app.config.settings import get_settings
    _s = get_settings()
    existing = db.scalar(select(User).where(User.email == _s.ADMIN_EMAIL))
    if existing:
        return MessageResponse(message="Admin already seeded")
    import uuid
    from datetime import datetime
    user = User(
        id=str(uuid.uuid4()),
        email=_s.ADMIN_EMAIL,
        password_hash=hash_password(_s.ADMIN_PASSWORD),
        first_name="Admin",
        last_name="NovaBio",
        role="ADMIN",
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    return MessageResponse(message="Admin seeded successfully")


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_payload = decode_token(payload.refresh_token)
    if token_payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.get(User, token_payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not active")
    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout():
    return MessageResponse(message="Logged out")


@router.post("/2fa/request-otp", response_model=MessageResponse)
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """Demande un code OTP pour l'authentification à deux facteurs"""
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = TwoFactorService.generate_otp()
    TwoFactorService.send_otp_email(payload.email, otp)
    AuditLog.log_action(user.id, "REQUEST_OTP", "auth", "otp_request")

    return MessageResponse(message="OTP envoyé avec succès")


@router.post("/2fa/verify-otp", response_model=TokenPair)
def verify_otp(payload: OTPVerification, db: Session = Depends(get_db)):
    """Vérifie le code OTP et retourne les tokens"""
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not TwoFactorService.verify_otp(payload.email, payload.otp):
        AuditLog.log_action(user.id, "VERIFY_OTP_FAILED", "auth", "otp_verification", status="FAILED")
        raise HTTPException(status_code=401, detail="Invalid OTP")

    AuditLog.log_action(user.id, "VERIFY_OTP_SUCCESS", "auth", "otp_verification")

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
def password_reset_request(body: PasswordResetRequestBody, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email))
    if user:
        code = "".join(random.choices(string.digits, k=6))
        # Delete any existing tokens for this email
        db.query(PasswordResetToken).filter(PasswordResetToken.email == body.email).delete()
        # Persist new token to DB
        db.add(PasswordResetToken(
            email=body.email,
            code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=15),
        ))
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
        .filter(PasswordResetToken.email == body.email, PasswordResetToken.used == False)  # noqa: E712
        .order_by(PasswordResetToken.created_at.desc())
        .first()
    )
    if not token or token.expires_at < datetime.utcnow():
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
def password_reset_confirm(body: PasswordResetConfirmBody, db: Session = Depends(get_db)):
    from jose import JWTError
    from app.config.settings import get_settings
    _settings = get_settings()
    try:
        from jose import jwt
        payload = jwt.decode(body.token, _settings.SECRET_KEY, algorithms=[_settings.ALGORITHM])
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
    db.query(PasswordResetToken).filter(PasswordResetToken.email == email).update({"used": True})
    db.commit()
    return {"message": "Mot de passe réinitialisé avec succès"}

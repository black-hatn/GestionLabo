from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.config.database import get_db
from app.config.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models.user import User
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

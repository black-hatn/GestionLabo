from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.api.deps import get_current_user, require_roles
from app.config.database import get_db
from app.config.security import hash_password
from app.models.user import User, UserRole
from app.schemas.domain import UserCreate, UserRead
from app.schemas.common import MessageResponse
from app.utils.audit_log import AuditLog
from pydantic import BaseModel


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


router = APIRouter()


@router.get("", response_model=dict)
def list_users(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: str = Query("", min_length=0),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """List all users - ADMIN only"""
    query = select(User)
    count_q = select(func.count()).select_from(User)
    if search:
        from sqlalchemy import or_
        search_filter = or_(
            User.email.ilike(f"%{search}%"),
            User.first_name.ilike(f"%{search}%"),
            User.last_name.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_q = count_q.where(search_filter)
    query = query.order_by(User.created_at.desc())

    total = db.scalar(count_q) or 0
    pages = (total + limit - 1) // limit

    offset = (page - 1) * limit
    items = db.execute(query.offset(offset).limit(limit)).scalars().all()

    AuditLog.log_action(db, current_user.id, "LIST_USERS", "user", "")
    return {
        "items": [UserRead.model_validate(u) for u in items],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Get a specific user - ADMIN only"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Create a new user - ADMIN only"""
    from sqlalchemy import select as sel
    existing = db.scalar(sel(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

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

    AuditLog.log_action(db, current_user.id, "CREATE_USER", "user", user.id, details={"email": user.email})
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Update a user - ADMIN only"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        valid_roles = [r.value for r in UserRole]
        if payload.role not in valid_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
        user.role = UserRole(payload.role)

    db.commit()
    db.refresh(user)

    AuditLog.log_action(db, current_user.id, "UPDATE_USER", "user", user_id)
    return user


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Delete a user - ADMIN only. Cannot delete yourself."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    AuditLog.log_action(db, current_user.id, "DELETE_USER", "user", user_id, details={"email": user.email})
    return MessageResponse(message="User deleted successfully")


@router.patch("/{user_id}/toggle-active", response_model=UserRead)
def toggle_user_active(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Toggle user active status - ADMIN only"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas désactiver votre propre compte")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    AuditLog.log_action(db, current_user.id, "TOGGLE_USER_ACTIVE", "user", user_id, details={"is_active": user.is_active})
    return user

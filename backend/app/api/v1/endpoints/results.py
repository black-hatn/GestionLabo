from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.domain import ResultCreate, ResultUpdate
from app.services.result_service import ResultService
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter()


@router.get("/")
def list_results(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH)),
):
    return ResultService.list_results(db, page, limit)


@router.post("/")
def create_result(
    result_create: ResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH)),
):
    return ResultService.create_result(db, result_create, current_user.id)


@router.get("/{result_id}")
def get_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH)),
):
    return ResultService.get_result(db, result_id)


@router.put("/{result_id}")
def update_result(
    result_id: str,
    result_update: ResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH)),
):
    return ResultService.update_result(db, result_id, result_update)


@router.delete("/{result_id}")
def delete_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH)),
):
    return ResultService.delete_result(db, result_id)

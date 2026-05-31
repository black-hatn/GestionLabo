from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.exam import Exam
from app.schemas.domain import ExamCreate, ExamUpdate, ExamRead, PaginatedExamResponse
from app.schemas.common import MessageResponse
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.utils.audit_log import AuditLog

router = APIRouter()

@router.get("", response_model=PaginatedExamResponse)
def list_exams(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """List all exams"""
    query = select(Exam).order_by(Exam.created_at.desc())

    # Get total count
    total = db.scalar(select(func.count()).select_from(Exam))
    pages = (total + limit - 1) // limit

    # Get paginated results
    offset = (page - 1) * limit
    items = db.execute(query.offset(offset).limit(limit)).scalars().all()

    result = {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }
    AuditLog.log_action(current_user.id, "LIST_EXAMS", "exam", "")

    return result

@router.get("/{exam_id}", response_model=ExamRead)
def get_exam(exam_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific exam"""
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    AuditLog.log_action(current_user.id, "GET_EXAM", "exam", exam_id)
    return exam

@router.post("", response_model=ExamRead, status_code=status.HTTP_201_CREATED)
def create_exam(payload: ExamCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH))):
    """Create a new exam"""
    import uuid
    exam = Exam(
        id=str(uuid.uuid4()),
        name=payload.name,
        description=payload.description,
        category=payload.category,
        unit=payload.unit,
        reference_min=payload.reference_min,
        reference_max=payload.reference_max,
    )
    
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    AuditLog.log_action(current_user.id, "CREATE_EXAM", "exam", exam.id, f"name={exam.name}")
    return exam

@router.put("/{exam_id}", response_model=ExamRead)
def update_exam(exam_id: str, payload: ExamUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH))):
    """Update an exam"""
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(exam, field, value)
    
    db.commit()
    db.refresh(exam)
    
    AuditLog.log_action(current_user.id, "UPDATE_EXAM", "exam", exam_id)
    return exam

@router.delete("/{exam_id}", response_model=MessageResponse)
def delete_exam(exam_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Delete an exam"""
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    db.delete(exam)
    db.commit()
    
    AuditLog.log_action(current_user.id, "DELETE_EXAM", "exam", exam_id)
    return MessageResponse(message="Exam deleted successfully")

"""
Exam Service - handles exam business logic
"""
from sqlalchemy.orm import Session
from app.models.exam import Exam
from app.schemas.domain import ExamCreate, ExamRead
from uuid import uuid4


class ExamService:
    """Service for exam operations"""

    @staticmethod
    def list_exams(db: Session, page: int = 1, limit: int = 10):
        """List exams with pagination"""
        query = db.query(Exam).filter(Exam.is_active == True)
        total = query.count()
        exams = query.offset((page - 1) * limit).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": [ExamRead.model_validate(e) for e in exams]
        }

    @staticmethod
    def create_exam(db: Session, exam_create: ExamCreate):
        """Create a new exam"""
        db_exam = Exam(
            id=str(uuid4()),
            name=exam_create.name,
            description=exam_create.description,
            reference_values=exam_create.reference_values or {},
            unit=exam_create.unit,
            is_active=True,
        )
        db.add(db_exam)
        db.commit()
        db.refresh(db_exam)
        return ExamRead.model_validate(db_exam)

    @staticmethod
    def get_exam(db: Session, exam_id: str):
        """Get an exam by ID"""
        exam = db.query(Exam).filter(
            Exam.id == exam_id,
            Exam.is_active == True
        ).first()
        if not exam:
            return {"error": "Exam not found"}
        return ExamRead.model_validate(exam)

    @staticmethod
    def update_exam(db: Session, exam_id: str, exam_update: ExamCreate):
        """Update an exam"""
        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            return {"error": "Exam not found"}

        exam.name = exam_update.name
        if exam_update.description is not None:
            exam.description = exam_update.description
        if exam_update.reference_values is not None:
            exam.reference_values = exam_update.reference_values
        if exam_update.unit is not None:
            exam.unit = exam_update.unit

        db.commit()
        db.refresh(exam)
        return ExamRead.model_validate(exam)

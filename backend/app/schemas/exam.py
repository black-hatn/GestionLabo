"""
Exam schemas - re-exported from domain
"""
from app.schemas.domain import (
    ExamCreate,
    ExamRead as ExamResponse,
)

# ExamUpdate can be same as ExamCreate or we can make it partial
ExamUpdate = ExamCreate

__all__ = ["ExamCreate", "ExamUpdate", "ExamResponse"]

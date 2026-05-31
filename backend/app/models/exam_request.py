import enum
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base


class ExamRequestStatus(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    EN_COURS = "EN_COURS"
    TERMINE = "TERMINE"
    ANNULE = "ANNULE"


class ExamRequest(Base):
    __tablename__ = "exam_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("exams.id"), nullable=False, index=True)
    status: Mapped[ExamRequestStatus] = mapped_column(
        Enum(ExamRequestStatus), default=ExamRequestStatus.EN_ATTENTE, nullable=False
    )
    clinical_info: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sample_type: Mapped[str] = mapped_column(String(100), nullable=False)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

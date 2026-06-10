import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ResultStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    ANORMAL = "ANORMAL"
    CRITIQUE = "CRITIQUE"


class Result(Base):
    __tablename__ = "results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("exam_requests.id"), nullable=False, unique=True, index=True
    )
    tested_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(120), nullable=False)
    reference_value: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[ResultStatus] = mapped_column(Enum(ResultStatus), default=ResultStatus.NORMAL, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

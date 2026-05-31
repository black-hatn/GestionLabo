"""
Modèle AuditLog — Trace chaque action sensible effectuée sur la plateforme.
Obligation légale pour les systèmes de santé (RGPD, HIPAA, HL7).
"""
import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # Qui
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    user_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    user_role: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Quoi
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # Ex: CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT_PDF

    # Sur quoi
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # Ex: patient, result, exam_request, invoice, user
    resource_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Contexte
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Ex: {"patient_name": "Dupont Jean", "changes": {"status": "EN_COURS"}}

    status: Mapped[str] = mapped_column(String(20), nullable=False, default="SUCCESS")
    # SUCCESS | FAILURE | DENIED

    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )

"""
AuditLog service — Persistance des logs d'audit en base de données.
Remplace l'ancienne version in-memory (perdue à chaque redémarrage).
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog as AuditLogModel


class AuditLog:
    """Service d'audit : enregistre chaque action sensible en base."""

    @staticmethod
    def log_action(
        db: Session,
        action: str,
        resource_type: str,
        resource_id: str = "",
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        user_role: Optional[str] = None,
        details: Optional[dict] = None,
        status: str = "SUCCESS",
        ip_address: Optional[str] = None,
    ) -> None:
        """Enregistre une action en base de données (non-bloquant)."""
        try:
            entry = AuditLogModel(
                user_id=user_id,
                user_email=user_email,
                user_role=user_role,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id or None,
                details=details or {},
                status=status,
                ip_address=ip_address,
                timestamp=datetime.utcnow(),
            )
            db.add(entry)
            db.commit()
            print(
                f"[AUDIT] {action} | {resource_type}/{resource_id} "
                f"| user={user_email or user_id} | status={status}"
            )
        except Exception as e:
            # Ne jamais bloquer l'action principale à cause d'un log
            db.rollback()
            print(f"[AUDIT-ERROR] Failed to write audit log: {e}")

    @staticmethod
    def get_logs(
        db: Session,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list:
        """Récupère les logs filtrés, du plus récent au plus ancien."""
        query = db.query(AuditLogModel)
        if user_id:
            query = query.filter(AuditLogModel.user_id == user_id)
        if resource_type:
            query = query.filter(AuditLogModel.resource_type == resource_type)
        if action:
            query = query.filter(AuditLogModel.action == action)
        return (
            query.order_by(AuditLogModel.timestamp.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

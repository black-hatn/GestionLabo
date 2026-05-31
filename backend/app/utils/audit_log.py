"""
AuditLog service — Persistance des logs d'audit en base de données.
Rétrocompatible avec l'ancienne signature (user_id, action, resource_type, ...).
"""
from datetime import datetime
from typing import Optional, Union
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog as AuditLogModel


class AuditLog:
    """Service d'audit : enregistre chaque action sensible en base."""

    @staticmethod
    def log_action(
        db_or_user_id,           # Session (nouveau) OU str user_id (ancien)
        action: str,
        resource_type: str,
        resource_id: str = "",
        user_id_or_details=None, # user_id (nouveau) OU details str (ancien)
        user_email: Optional[str] = None,
        user_role: Optional[str] = None,
        details: Optional[dict] = None,
        status: str = "SUCCESS",
        ip_address: Optional[str] = None,
    ) -> None:
        """
        Accepte deux signatures :
          - Nouveau  : log_action(db, action, resource_type, resource_id, user_id, user_email, ...)
          - Héritage : log_action(user_id_str, action, resource_type, resource_id, details_str, ...)
        """

        # ── Détection de la convention d'appel ──
        if isinstance(db_or_user_id, str):
            # Ancienne convention — juste un print, pas de crash
            legacy_user = db_or_user_id
            print(
                f"[AUDIT] {action} | {resource_type}/{resource_id} "
                f"| user={legacy_user} | status={status}"
            )
            return

        # Nouvelle convention — db Session fournie
        db: Session = db_or_user_id
        uid: Optional[str] = user_id_or_details if isinstance(user_id_or_details, str) else None

        try:
            entry = AuditLogModel(
                user_id=uid,
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
                f"| user={user_email or uid} | status={status}"
            )
        except Exception as e:
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

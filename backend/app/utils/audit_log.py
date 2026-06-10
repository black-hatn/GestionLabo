"""
AuditLog service — Persistance des logs d'audit en base de données.
Signature unique : log_action(db, user_id, action, resource_type, ...).
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog as AuditLogModel

logger = logging.getLogger(__name__)


class AuditLog:
    """Service d'audit : enregistre chaque action sensible en base."""

    @staticmethod
    def log_action(
        db: Session,
        user_id: Optional[str],
        action: str,
        resource_type: str,
        resource_id: str = "",
        user_email: Optional[str] = None,
        user_role: Optional[str] = None,
        details: Optional[dict] = None,
        status: str = "SUCCESS",
        ip_address: Optional[str] = None,
    ) -> None:
        """
        Enregistre une action en base de données.

        Args:
            db:            Session SQLAlchemy (obligatoire).
            user_id:       Identifiant de l'utilisateur.
            action:        Code de l'action (ex: CREATE_PATIENT, LOGIN).
            resource_type: Type de ressource (ex: patient, invoice).
            resource_id:   Identifiant de la ressource concernée.
            user_email:    Email de l'utilisateur (optionnel).
            user_role:     Rôle de l'utilisateur (optionnel).
            details:       Dictionnaire de métadonnées supplémentaires.
            status:        SUCCESS | FAILURE | DENIED.
            ip_address:    Adresse IP de la requête (optionnel).
        """
        # Auto-résolution email/rôle depuis la DB si non fournis
        if user_id and (user_email is None or user_role is None):
            try:
                from app.models.user import User as UserModel
                u = db.get(UserModel, user_id)
                if u:
                    if user_email is None:
                        user_email = u.email
                    if user_role is None:
                        role = u.role
                        user_role = role.value if hasattr(role, "value") else str(role)
            except Exception:
                pass

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
                timestamp=datetime.now(timezone.utc),
            )
            db.add(entry)
            db.commit()
            logger.info(
                "[AUDIT] %s | %s/%s | user=%s | status=%s",
                action,
                resource_type,
                resource_id,
                user_email or user_id,
                status,
            )
        except Exception as e:
            db.rollback()
            logger.error("[AUDIT-ERROR] Failed to write audit log: %s", e)

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

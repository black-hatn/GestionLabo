"""
Endpoint Audit Logs — Accessible ADMIN uniquement.
Permet de consulter l'historique complet des actions effectuées sur la plateforme.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.config.database import get_db
from app.models.user import UserRole
from app.models.audit_log import AuditLog as AuditLogModel
from app.utils.audit_log import AuditLog

router = APIRouter()


@router.get("/", summary="Liste des logs d'audit (ADMIN)")
def get_audit_logs(
    user_id: str | None = Query(None),
    resource_type: str | None = Query(None),
    action: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.ADMIN)),
):
    logs = AuditLog.get_logs(
        db,
        user_id=user_id,
        resource_type=resource_type,
        action=action,
        limit=limit,
        offset=offset,
    )
    total = db.query(AuditLogModel).count()
    return {
        "items": [
            {
                "id":            log.id,
                "timestamp":     log.timestamp.isoformat(),
                "user_id":       log.user_id,
                "user_email":    log.user_email,
                "user_role":     log.user_role,
                "action":        log.action,
                "resource_type": log.resource_type,
                "resource_id":   log.resource_id,
                "details":       log.details,
                "status":        log.status,
                "ip_address":    log.ip_address,
            }
            for log in logs
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/stats", summary="Statistiques d'audit (ADMIN)")
def get_audit_stats(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.ADMIN)),
):
    from sqlalchemy import func
    total = db.query(AuditLogModel).count()
    by_action = (
        db.query(AuditLogModel.action, func.count(AuditLogModel.id).label("count"))
        .group_by(AuditLogModel.action)
        .all()
    )
    by_resource = (
        db.query(AuditLogModel.resource_type, func.count(AuditLogModel.id).label("count"))
        .group_by(AuditLogModel.resource_type)
        .all()
    )
    return {
        "total": total,
        "by_action":   {row.action: row.count for row in by_action},
        "by_resource": {row.resource_type: row.count for row in by_resource},
    }

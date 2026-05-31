import json
from datetime import datetime
from typing import Any, Optional

class AuditLog:
    """Service pour l'audit logging"""
    
    _logs = []
    
    @staticmethod
    def log_action(
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Optional[dict] = None,
        status: str = "SUCCESS"
    ) -> None:
        """Enregistre une action pour l'audit"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'details': details or {},
            'status': status,
        }
        AuditLog._logs.append(log_entry)
        print(f"[AUDIT] {action} on {resource_type}/{resource_id} by {user_id}")
    
    @staticmethod
    def get_logs(user_id: Optional[str] = None, limit: int = 100) -> list:
        """Récupère les logs d'audit"""
        if user_id:
            return [log for log in AuditLog._logs if log['user_id'] == user_id][-limit:]
        return AuditLog._logs[-limit:]

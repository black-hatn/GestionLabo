from fastapi import HTTPException, status
from typing import Optional, Dict, Any

class AppError(Exception):
    """Base application error"""
    def __init__(self, message: str, status_code: int = 400, detail: Optional[Dict[str, Any]] = None):
        self.message = message
        self.status_code = status_code
        self.detail = detail or {}
        super().__init__(self.message)

class ValidationError(AppError):
    """Validation error (400)"""
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, detail)

class NotFoundError(AppError):
    """Resource not found (404)"""
    def __init__(self, resource: str, identifier: str = ""):
        message = f"{resource} not found"
        if identifier:
            message += f" (ID: {identifier})"
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class UnauthorizedError(AppError):
    """Unauthorized (401)"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class ForbiddenError(AppError):
    """Forbidden (403)"""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class ConflictError(AppError):
    """Resource conflict (409)"""
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_409_CONFLICT)

def raise_http_exception(error: AppError):
    """Convert AppError to HTTPException"""
    raise HTTPException(
        status_code=error.status_code,
        detail=error.message,
    )

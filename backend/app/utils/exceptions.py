"""Exceptions personnalisées"""
from fastapi import HTTPException, status


class UserNotFoundError(HTTPException):
    """Utilisateur non trouvé"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )


class InvalidCredentialsError(HTTPException):
    """Identifiants invalides"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides"
        )


class UnauthorizedError(HTTPException):
    """Non authentifié"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )


class ForbiddenError(HTTPException):
    """Accès refusé"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé"
        )

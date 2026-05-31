"""
Result schemas - re-exported from domain
"""
from app.schemas.domain import (
    ResultCreate,
    ResultRead as ResultResponse,
)

# ResultUpdate can be same as ResultCreate
ResultUpdate = ResultCreate

__all__ = ["ResultCreate", "ResultUpdate", "ResultResponse"]

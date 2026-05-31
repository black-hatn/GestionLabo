from datetime import date, datetime
from decimal import Decimal
from typing import Generic, TypeVar, List
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PaginationQuery(BaseModel):
    skip: int = 0
    limit: int = 20


class MessageResponse(BaseModel):
    message: str


class Timestamped(ORMModel):
    created_at: datetime
    updated_at: datetime | None = None


class MoneyModel(ORMModel):
    amount: Decimal


class DateRangeModel(BaseModel):
    start_date: date | None = None
    end_date: date | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int

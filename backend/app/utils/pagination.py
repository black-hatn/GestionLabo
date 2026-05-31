from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel

T = TypeVar("T")

class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 10
    
    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    
    class Config:
        from_attributes = True
    
    @property
    def has_next(self) -> bool:
        return self.page < self.pages
    
    @property
    def has_prev(self) -> bool:
        return self.page > 1

def paginate(query, page: int = 1, limit: int = 10):
    """Helper function to paginate SQLAlchemy queries"""
    total = query.count()
    pages = (total + limit - 1) // limit
    
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }

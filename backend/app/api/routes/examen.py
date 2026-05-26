from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.config.security import get_current_user
from app.models.examen import Examen
from app.models.user import User
from app.schemas.examen import ExamenCreate, ExamenResponse

router = APIRouter(prefix="/examens", tags=["Examens"])

@router.get("/", response_model=List[ExamenResponse])
def get_examens(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Examen).offset(skip).limit(limit).all()

@router.post("/", response_model=ExamenResponse, status_code=status.HTTP_201_CREATED)
def create_examen(examen: ExamenCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_examen = Examen(**examen.model_dump())
    db.add(db_examen)
    db.commit()
    db.refresh(db_examen)
    return db_examen

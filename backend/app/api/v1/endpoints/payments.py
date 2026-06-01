from decimal import Decimal
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.config.database import get_db
from app.models.invoice import Invoice, InvoiceStatus
from app.models.payment import Payment
from app.models.user import UserRole
from app.schemas.domain import PaymentCreate, PaymentRead, PaginatedPaymentResponse

router = APIRouter(dependencies=[Depends(require_roles(UserRole.ADMIN))])


@router.get("", response_model=PaginatedPaymentResponse)
def list_payments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    query = select(Payment).order_by(Payment.paid_at.desc())

    # Get total count
    total = db.scalar(select(func.count()).select_from(Payment))
    pages = (total + limit - 1) // limit

    # Get paginated results
    offset = (page - 1) * limit
    items = db.execute(query.offset(offset).limit(limit)).scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    invoice = db.get(Invoice, payload.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    payment = Payment(**payload.model_dump())
    invoice.paid_amount = Decimal(invoice.paid_amount) + Decimal(payload.amount)
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = InvoiceStatus.PAYEE
        invoice.paid_date = date.today()
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

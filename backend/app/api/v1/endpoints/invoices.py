from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.config.database import get_db
from app.models.invoice import Invoice, InvoiceStatus
from app.schemas.domain import InvoiceCreate, InvoiceUpdate, InvoiceRead, PaginatedInvoiceResponse
from app.schemas.common import MessageResponse
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.utils.audit_log import AuditLog


def _auto_mark_overdue(invoices: list, db: Session) -> bool:
    """Mark invoices as EN_RETARD when due_date is past. Returns True if any change was made."""
    changed = False
    today = date.today()
    for invoice in invoices:
        if invoice.status not in (InvoiceStatus.PAYEE, InvoiceStatus.ANNULEE):
            if invoice.due_date and invoice.due_date < today:
                invoice.status = InvoiceStatus.EN_RETARD
                changed = True
    return changed

router = APIRouter()

@router.get("", response_model=PaginatedInvoiceResponse)
def list_invoices(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status_filter: str = Query("", min_length=0),
    current_user: User = Depends(get_current_user),
):
    """List all invoices with optional status filter, scoped to patient if USER role"""
    from app.models.patient import Patient

    query = select(Invoice)
    count_query = select(func.count()).select_from(Invoice)

    if current_user.role not in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH, UserRole.RECEPTIONIST]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if status_filter:
        query = query.where(Invoice.status == status_filter)
        count_query = count_query.where(Invoice.status == status_filter)

    query = query.order_by(Invoice.created_at.desc())

    total = db.scalar(count_query)
    pages = (total + limit - 1) // limit

    # Get paginated results
    offset = (page - 1) * limit
    items = db.execute(query.offset(offset).limit(limit)).scalars().all()

    # Auto-workflow: marquer les factures en retard
    if _auto_mark_overdue(list(items), db):
        db.commit()

    result = {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }
    AuditLog.log_action(current_user.id, "LIST_INVOICES", "invoice", "")

    return result

@router.get("/{invoice_id}", response_model=InvoiceRead)
def get_invoice(invoice_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific invoice"""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if current_user.role not in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH, UserRole.RECEPTIONIST]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    # Auto-workflow: marquer la facture en retard si nécessaire
    if _auto_mark_overdue([invoice], db):
        db.commit()
        db.refresh(invoice)

    AuditLog.log_action(current_user.id, "GET_INVOICE", "invoice", invoice_id)
    return invoice

@router.post("", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH, UserRole.DOCTOR, UserRole.RECEPTIONIST))):
    """Create a new invoice"""
    import uuid
    
    invoice = Invoice(
        id=str(uuid.uuid4()),
        patient_id=payload.patient_id,
        invoice_number=payload.invoice_number,
        total_amount=payload.total_amount,
        paid_amount=0,
        status=InvoiceStatus.BROUILLON,
        currency=payload.currency,
        payment_type=payload.payment_type,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
    )

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    AuditLog.log_action(current_user.id, "CREATE_INVOICE", "invoice", invoice.id, f"invoice_number={invoice.invoice_number}")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceRead)
def update_invoice(invoice_id: str, payload: InvoiceUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH, UserRole.RECEPTIONIST))):
    """Update an invoice"""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    
    AuditLog.log_action(current_user.id, "UPDATE_INVOICE", "invoice", invoice_id)
    return invoice

@router.post("/{invoice_id}/mark-paid", response_model=MessageResponse)
def mark_invoice_paid(invoice_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Mark an invoice as paid"""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = "PAID"
    invoice.paid_date = datetime.now()
    db.commit()
    
    AuditLog.log_action(current_user.id, "MARK_INVOICE_PAID", "invoice", invoice_id)
    return MessageResponse(message="Invoice marked as paid")

@router.delete("/{invoice_id}", response_model=MessageResponse)
def delete_invoice(invoice_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Delete an invoice"""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db.delete(invoice)
    db.commit()
    
    AuditLog.log_action(current_user.id, "DELETE_INVOICE", "invoice", invoice_id)
    return MessageResponse(message="Invoice deleted successfully")

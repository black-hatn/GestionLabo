from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime

from app.config.database import get_db
from app.models.invoice import Invoice
from app.schemas.domain import InvoiceCreate, InvoiceUpdate, InvoiceRead, PaginatedInvoiceResponse
from app.schemas.common import MessageResponse
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.utils.audit_log import AuditLog

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

    if current_user.role == UserRole.USER:
        query = query.join(Patient, Invoice.patient_id == Patient.id).where(Patient.email == current_user.email)
        count_query = count_query.join(Patient, Invoice.patient_id == Patient.id).where(Patient.email == current_user.email)
    elif current_user.role not in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH]:
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
    
    if current_user.role == UserRole.USER:
        from app.models.patient import Patient
        patient = db.get(Patient, invoice.patient_id)
        if not patient or patient.email != current_user.email:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this invoice")
    elif current_user.role not in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECH]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    
    AuditLog.log_action(current_user.id, "GET_INVOICE", "invoice", invoice_id)
    return invoice

@router.post("", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH, UserRole.DOCTOR))):
    """Create a new invoice"""
    import uuid
    
    invoice = Invoice(
        id=str(uuid.uuid4()),
        patient_id=payload.patient_id,
        number=f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        amount=payload.amount,
        tax_amount=payload.tax_amount,
        total_amount=payload.total_amount,
        status="DRAFT",
        due_date=payload.due_date,
        notes=payload.notes,
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    AuditLog.log_action(current_user.id, "CREATE_INVOICE", "invoice", invoice.id, f"amount={invoice.amount}")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceRead)
def update_invoice(invoice_id: str, payload: InvoiceUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LAB_TECH))):
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

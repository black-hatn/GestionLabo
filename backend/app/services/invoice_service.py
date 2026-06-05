"""
Invoice Service - handles invoice business logic
"""
from sqlalchemy.orm import Session
from decimal import Decimal
from app.models.invoice import Invoice, InvoiceStatus
from app.schemas.domain import InvoiceCreate, InvoiceRead, InvoiceUpdate
from uuid import uuid4
from datetime import datetime


class InvoiceService:
    """Service for invoice operations"""

    @staticmethod
    def list_invoices(db: Session, page: int = 1, limit: int = 10):
        """List invoices with pagination"""
        query = db.query(Invoice)
        total = query.count()
        invoices = query.offset((page - 1) * limit).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": [InvoiceRead.model_validate(i) for i in invoices]
        }

    @staticmethod
    def create_invoice(db: Session, invoice_create: InvoiceCreate):
        """Create a new invoice"""
        db_invoice = Invoice(
            id=str(uuid4()),
            patient_id=invoice_create.patient_id,
            invoice_number=invoice_create.invoice_number,
            total_amount=invoice_create.total_amount,
            paid_amount=Decimal("0.00"),
            status=InvoiceStatus.BROUILLON,
            issue_date=invoice_create.issue_date,
            due_date=invoice_create.due_date,
            paid_date=None,
        )
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        return InvoiceRead.model_validate(db_invoice)

    @staticmethod
    def get_invoice(db: Session, invoice_id: str):
        """Get an invoice by ID"""
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return {"error": "Invoice not found"}
        return InvoiceRead.model_validate(invoice)

    @staticmethod
    def update_invoice(db: Session, invoice_id: str, invoice_update: InvoiceUpdate):
        """Update an invoice"""
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return {"error": "Invoice not found"}

        if invoice_update.status is not None:
            invoice.status = invoice_update.status
        if invoice_update.paid_amount is not None:
            invoice.paid_amount = invoice_update.paid_amount
        if invoice_update.paid_date is not None:
            invoice.paid_date = invoice_update.paid_date

        db.commit()
        db.refresh(invoice)
        return InvoiceRead.model_validate(invoice)

    @staticmethod
    def delete_invoice(db: Session, invoice_id: str):
        """Mark invoice as cancelled"""
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return {"error": "Invoice not found"}

        invoice.status = InvoiceStatus.ANNULEE
        db.commit()
        return {"status": "cancelled"}

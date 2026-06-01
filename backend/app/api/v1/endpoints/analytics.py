from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import date

from app.config.database import get_db
from app.models.invoice import Invoice, InvoiceStatus
from app.models.patient import Patient
from app.models.exam_request import ExamRequest
from app.models.payment import Payment
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregated analytics data for the dashboard"""

    # ── Patients ──────────────────────────────────────────────────────────────
    total_patients = db.scalar(select(func.count()).select_from(Patient)) or 0
    active_patients = db.scalar(
        select(func.count()).select_from(Patient).where(Patient.is_active == True)
    ) or 0

    # ── Invoices ──────────────────────────────────────────────────────────────
    total_invoices = db.scalar(select(func.count()).select_from(Invoice)) or 0

    # Somme des paid_amount sur toutes les factures
    total_revenue = float(
        db.scalar(select(func.coalesce(func.sum(Invoice.paid_amount), 0)).select_from(Invoice)) or 0
    )

    # Revenue en attente : total_amount - paid_amount des factures non payées / non annulées
    pending_revenue = float(
        db.scalar(
            select(
                func.coalesce(
                    func.sum(Invoice.total_amount - Invoice.paid_amount), 0
                )
            )
            .select_from(Invoice)
            .where(
                Invoice.status.notin_([InvoiceStatus.PAYEE, InvoiceStatus.ANNULEE])
            )
        ) or 0
    )

    # Factures par statut
    invoice_status_rows = db.execute(
        select(Invoice.status, func.count().label("n"))
        .group_by(Invoice.status)
    ).all()
    invoices_by_status: dict = {s.value: 0 for s in InvoiceStatus}
    for row in invoice_status_rows:
        invoices_by_status[row.status.value] = row.n

    # ── Exam requests ─────────────────────────────────────────────────────────
    total_exam_requests = db.scalar(select(func.count()).select_from(ExamRequest)) or 0

    from app.models.exam_request import ExamRequestStatus
    exam_status_rows = db.execute(
        select(ExamRequest.status, func.count().label("n"))
        .group_by(ExamRequest.status)
    ).all()
    exam_requests_by_status: dict = {s.value: 0 for s in ExamRequestStatus}
    for row in exam_status_rows:
        exam_requests_by_status[row.status.value] = row.n

    # ── Payments ──────────────────────────────────────────────────────────────
    total_payments = db.scalar(select(func.count()).select_from(Payment)) or 0

    return {
        "total_patients": total_patients,
        "active_patients": active_patients,
        "total_invoices": total_invoices,
        "total_revenue": total_revenue,
        "pending_revenue": pending_revenue,
        "invoices_by_status": invoices_by_status,
        "total_exam_requests": total_exam_requests,
        "exam_requests_by_status": exam_requests_by_status,
        "total_payments": total_payments,
    }

"""
Génération automatique des numéros séquentiels par année.
Format patient  : PAT-YYYY-NNNN
Format facture  : FAC-YYYY-NNNN

La contrainte UNIQUE sur la colonne joue le rôle de filet de sécurité
contre les rares collisions en cas d'accès concurrent.
"""

from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.orm import Session


def next_patient_number(db: Session) -> str:
    from app.models.patient import Patient

    year = datetime.now().year
    prefix = f"PAT-{year}-"

    last: str | None = db.execute(
        select(func.max(Patient.record_number)).where(
            Patient.record_number.like(f"{prefix}%")
        )
    ).scalar()

    last_num = 0
    if last:
        try:
            last_num = int(last.split("-")[-1])
        except (ValueError, IndexError):
            pass

    return f"{prefix}{last_num + 1:04d}"


def next_invoice_number(db: Session) -> str:
    from app.models.invoice import Invoice

    year = datetime.now().year
    prefix = f"FAC-{year}-"

    last: str | None = db.execute(
        select(func.max(Invoice.invoice_number)).where(
            Invoice.invoice_number.like(f"{prefix}%")
        )
    ).scalar()

    last_num = 0
    if last:
        try:
            last_num = int(last.split("-")[-1])
        except (ValueError, IndexError):
            pass

    return f"{prefix}{last_num + 1:04d}"

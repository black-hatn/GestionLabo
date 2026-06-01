"""Add currency and payment_type to invoices

Revision ID: 002
Revises: 001
Create Date: 2026-05-31
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001_audit_logs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("invoices", sa.Column("currency", sa.String(10), nullable=False, server_default="XOF"))
    op.add_column("invoices", sa.Column("payment_type", sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column("invoices", "payment_type")
    op.drop_column("invoices", "currency")

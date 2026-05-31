"""add_audit_logs_table

Revision ID: 001_audit_logs
Revises:
Create Date: 2026-05-31

"""
from alembic import op
import sqlalchemy as sa

revision = "001_audit_logs"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id",            sa.String(36),  primary_key=True),
        sa.Column("user_id",       sa.String(36),  nullable=True,  index=True),
        sa.Column("user_email",    sa.String(255), nullable=True),
        sa.Column("user_role",     sa.String(50),  nullable=True),
        sa.Column("action",        sa.String(100), nullable=False, index=True),
        sa.Column("resource_type", sa.String(100), nullable=False, index=True),
        sa.Column("resource_id",   sa.String(36),  nullable=True),
        sa.Column("details",       sa.JSON,        nullable=True),
        sa.Column("status",        sa.String(20),  nullable=False, server_default="SUCCESS"),
        sa.Column("ip_address",    sa.String(45),  nullable=True),
        sa.Column("timestamp",     sa.DateTime,    nullable=False, index=True),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")

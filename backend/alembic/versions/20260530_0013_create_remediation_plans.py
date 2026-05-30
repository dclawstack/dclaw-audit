"""create remediation plans

Revision ID: 20260530_0013
Revises: 20260530_0012
Create Date: 2026-05-30 00:00:13
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260530_0013"
down_revision: Union[str, None] = "20260530_0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

remediation_status = sa.Enum(
    "open", "in_progress", "completed", "overdue", "cancelled",
    name="remediation_status",
)


def upgrade() -> None:
    remediation_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "remediation_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "finding_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("findings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "engagement_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("audit_engagements.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("action_items", sa.Text, nullable=True),
        sa.Column("owner_name", sa.String(255), nullable=True),
        sa.Column("due_date", sa.Date, nullable=True),
        sa.Column("status", remediation_status, nullable=False, server_default="open"),
        sa.Column("progress_pct", sa.Integer, nullable=False, server_default="0"),
        sa.Column("ai_generated", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_remediation_plans_finding_id", "remediation_plans", ["finding_id"])
    op.create_index("ix_remediation_plans_engagement_id", "remediation_plans", ["engagement_id"])
    op.create_index("ix_remediation_plans_status", "remediation_plans", ["status"])


def downgrade() -> None:
    op.drop_index("ix_remediation_plans_status", "remediation_plans")
    op.drop_index("ix_remediation_plans_engagement_id", "remediation_plans")
    op.drop_index("ix_remediation_plans_finding_id", "remediation_plans")
    op.drop_table("remediation_plans")
    remediation_status.drop(op.get_bind(), checkfirst=True)

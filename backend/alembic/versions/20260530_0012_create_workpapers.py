"""create workpapers

Revision ID: 20260530_0012
Revises: 20260528_0011
Create Date: 2026-05-30 00:00:12
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260530_0012"
down_revision: Union[str, None] = "20260528_0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

workpaper_status = sa.Enum("draft", "in_review", "approved", "archived", name="workpaper_status")


def upgrade() -> None:
    workpaper_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "workpapers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "engagement_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("audit_engagements.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text, nullable=True),
        sa.Column("status", workpaper_status, nullable=False, server_default="draft"),
        sa.Column("preparer_name", sa.String(255), nullable=True),
        sa.Column("reviewer_name", sa.String(255), nullable=True),
        sa.Column("reviewed_at", sa.DateTime, nullable=True),
        sa.Column("approved_at", sa.DateTime, nullable=True),
        sa.Column("version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_workpapers_engagement_id", "workpapers", ["engagement_id"])
    op.create_index("ix_workpapers_status", "workpapers", ["status"])


def downgrade() -> None:
    op.drop_index("ix_workpapers_status", "workpapers")
    op.drop_index("ix_workpapers_engagement_id", "workpapers")
    op.drop_table("workpapers")
    workpaper_status.drop(op.get_bind(), checkfirst=True)

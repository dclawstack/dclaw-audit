"""create evidence files

Revision ID: 20260530_0014
Revises: 20260530_0013
Create Date: 2026-05-30 00:00:14
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260530_0014"
down_revision: Union[str, None] = "20260530_0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "evidence_files",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "request_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("evidence_requests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("content_type", sa.String(200), nullable=True),
        sa.Column("file_size", sa.Integer, nullable=True),
        sa.Column("storage_path", sa.String(1000), nullable=True),
        sa.Column("uploaded_by", sa.String(255), nullable=True),
        sa.Column("version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_evidence_files_request_id", "evidence_files", ["request_id"])


def downgrade() -> None:
    op.drop_index("ix_evidence_files_request_id", "evidence_files")
    op.drop_table("evidence_files")

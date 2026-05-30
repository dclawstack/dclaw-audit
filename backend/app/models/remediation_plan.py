import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.finding import Finding
    from app.models.audit_engagement import AuditEngagement


class RemediationStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    completed = "completed"
    overdue = "overdue"
    cancelled = "cancelled"


class RemediationPlan(Base):
    __tablename__ = "remediation_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finding_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("findings.id", ondelete="CASCADE"),
        nullable=False,
    )
    engagement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_engagements.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    action_items: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array stored as text
    owner_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[RemediationStatus] = mapped_column(
        SQLEnum(RemediationStatus, name="remediation_status"),
        nullable=False,
        default=RemediationStatus.open,
    )
    progress_pct: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ai_generated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    finding: Mapped["Finding"] = relationship(lazy="selectin")
    engagement: Mapped["AuditEngagement"] = relationship(lazy="selectin")

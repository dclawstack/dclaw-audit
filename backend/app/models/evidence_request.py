import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.audit_engagement import AuditEngagement
    from app.models.evidence_version_log import EvidenceVersionLog


class EvidenceRequestStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    received = "received"
    overdue = "overdue"


class EvidenceRequest(Base):
    __tablename__ = "evidence_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engagement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_engagements.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    request_owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[EvidenceRequestStatus] = mapped_column(
        SQLEnum(EvidenceRequestStatus, name="evidence_request_status"),
        nullable=False,
        default=EvidenceRequestStatus.draft,
    )
    source_system: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    engagement: Mapped["AuditEngagement"] = relationship(
        back_populates="evidence_requests",
        lazy="selectin",
    )
    version_logs: Mapped[list["EvidenceVersionLog"]] = relationship(
        back_populates="evidence_request",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

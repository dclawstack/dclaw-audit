import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum as SQLEnum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.evidence_request import EvidenceRequest
    from app.models.finding import Finding
    from app.models.report import SavedReport


class EngagementStatus(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    reporting = "reporting"
    completed = "completed"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AuditEngagement(Base):
    __tablename__ = "audit_engagements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[EngagementStatus] = mapped_column(
        SQLEnum(EngagementStatus, name="engagement_status"),
        nullable=False,
        default=EngagementStatus.planned,
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        SQLEnum(RiskLevel, name="engagement_risk_level"),
        nullable=False,
        default=RiskLevel.medium,
    )
    owner_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    audit_period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    audit_period_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    evidence_requests: Mapped[list["EvidenceRequest"]] = relationship(
        back_populates="engagement",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    findings: Mapped[list["Finding"]] = relationship(
        back_populates="engagement",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    saved_reports: Mapped[list["SavedReport"]] = relationship(
        back_populates="engagement",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.utils import utc_now
from app.models.base import Base


class SignalSource(str, Enum):
    erp = "erp"
    iam = "iam"
    ticketing = "ticketing"
    cloud = "cloud"
    manual = "manual"


class SignalType(str, Enum):
    control_deviation = "control_deviation"
    access_change = "access_change"
    config_change = "config_change"
    threshold_breach = "threshold_breach"
    anomaly = "anomaly"


class SignalStatus(str, Enum):
    new = "new"
    reviewed = "reviewed"
    dismissed = "dismissed"
    escalated = "escalated"


class AuditSignal(Base):
    __tablename__ = "audit_signals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    signal_source: Mapped[SignalSource] = mapped_column(
        SQLEnum(SignalSource, name="signal_source"),
        nullable=False,
    )
    signal_type: Mapped[SignalType] = mapped_column(
        SQLEnum(SignalType, name="signal_type"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    entity_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    status: Mapped[SignalStatus] = mapped_column(
        SQLEnum(SignalStatus, name="signal_status"),
        nullable=False,
        default=SignalStatus.new,
    )
    engagement_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    finding_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    raw_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, index=True)

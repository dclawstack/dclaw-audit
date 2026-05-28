import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum as SQLEnum, Float, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.anomaly import AnomalyFlag


class AnomalyFlagType(str, Enum):
    statistical = "statistical"
    rule_based = "rule_based"


class AnomalyFlagStatus(str, Enum):
    flagged = "flagged"
    reviewed = "reviewed"
    cleared = "cleared"
    escalated = "escalated"


class AnomalyTransaction(Base):
    __tablename__ = "anomaly_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engagement_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    transaction_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    account_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    party_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_system: Mapped[str | None] = mapped_column(String(255), nullable=True)
    batch_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    raw_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)

    flags: Mapped[list["AnomalyFlag"]] = relationship(
        back_populates="transaction",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class AnomalyFlag(Base):
    __tablename__ = "anomaly_flags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("anomaly_transactions.id", ondelete="CASCADE"),
        nullable=False,
    )
    flag_type: Mapped[AnomalyFlagType] = mapped_column(
        SQLEnum(AnomalyFlagType, name="anomaly_flag_type"),
        nullable=False,
    )
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[AnomalyFlagStatus] = mapped_column(
        SQLEnum(AnomalyFlagStatus, name="anomaly_flag_status"),
        nullable=False,
        default=AnomalyFlagStatus.flagged,
    )
    analyst_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)

    transaction: Mapped["AnomalyTransaction"] = relationship(
        back_populates="flags",
        lazy="selectin",
    )

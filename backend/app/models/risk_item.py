import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.audit_engagement import AuditEngagement


class RiskItemStatus(str, Enum):
    open = "open"
    mitigated = "mitigated"
    accepted = "accepted"


class RiskItem(Base):
    __tablename__ = "risk_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engagement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_engagements.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    likelihood: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    impact: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=9.0)
    residual_likelihood: Mapped[int | None] = mapped_column(Integer, nullable=True)
    residual_impact: Mapped[int | None] = mapped_column(Integer, nullable=True)
    residual_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    owner_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[RiskItemStatus] = mapped_column(
        SQLEnum(RiskItemStatus, name="risk_item_status"),
        nullable=False,
        default=RiskItemStatus.open,
    )
    mitigation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    engagement: Mapped["AuditEngagement"] = relationship(
        back_populates="risk_items",
        lazy="selectin",
    )

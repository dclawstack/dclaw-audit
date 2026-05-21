import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.control import Control
    from app.models.framework_requirement import FrameworkRequirement


class MappingCoverageStatus(str, Enum):
    full = "full"
    partial = "partial"
    planned = "planned"


class ControlMapping(Base):
    __tablename__ = "control_mappings"
    __table_args__ = (
        UniqueConstraint("control_id", "framework_requirement_id", name="uq_control_requirement_mapping"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    control_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("controls.id", ondelete="CASCADE"),
        nullable=False,
    )
    framework_requirement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("framework_requirements.id", ondelete="CASCADE"),
        nullable=False,
    )
    coverage_status: Mapped[MappingCoverageStatus] = mapped_column(
        SQLEnum(MappingCoverageStatus, name="mapping_coverage_status"),
        nullable=False,
        default=MappingCoverageStatus.partial,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    control: Mapped["Control"] = relationship(
        back_populates="mappings",
        lazy="selectin",
    )
    framework_requirement: Mapped["FrameworkRequirement"] = relationship(
        back_populates="mappings",
        lazy="selectin",
    )

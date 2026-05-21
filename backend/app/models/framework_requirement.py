import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base
from app.models.control import FrameworkName

if TYPE_CHECKING:
    from app.models.control_mapping import ControlMapping


class FrameworkRequirement(Base):
    __tablename__ = "framework_requirements"
    __table_args__ = (
        UniqueConstraint("framework", "requirement_code", name="uq_framework_requirement_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    framework: Mapped[FrameworkName] = mapped_column(
        SQLEnum(FrameworkName, name="framework_name"),
        nullable=False,
    )
    requirement_code: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    mappings: Mapped[list["ControlMapping"]] = relationship(
        back_populates="framework_requirement",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

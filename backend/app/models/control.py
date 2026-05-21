import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.control_mapping import ControlMapping


class FrameworkName(str, Enum):
    sox = "sox"
    iso_27001 = "iso_27001"
    nist = "nist"
    pci_dss = "pci_dss"


class Control(Base):
    __tablename__ = "controls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    framework: Mapped[FrameworkName | None] = mapped_column(
        SQLEnum(FrameworkName, name="framework_name"),
        nullable=True,
    )
    control_owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    frequency: Mapped[str | None] = mapped_column(String(100), nullable=True)
    automated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    mappings: Mapped[list["ControlMapping"]] = relationship(
        back_populates="control",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

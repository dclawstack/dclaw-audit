import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.control_test import ControlTestSample


class ControlTestType(str, Enum):
    manual = "manual"
    automated = "automated"
    sample_based = "sample_based"


class ControlTestStatus(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    completed = "completed"
    exception = "exception"


class ControlTestResult(str, Enum):
    pass_ = "pass"
    fail = "fail"
    exception = "exception"
    not_applicable = "not_applicable"


class ControlTest(Base):
    __tablename__ = "control_tests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engagement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_engagements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    control_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("controls.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    test_type: Mapped[ControlTestType] = mapped_column(
        SQLEnum(ControlTestType, name="control_test_type"),
        nullable=False,
        default=ControlTestType.manual,
    )
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[ControlTestStatus] = mapped_column(
        SQLEnum(ControlTestStatus, name="control_test_status"),
        nullable=False,
        default=ControlTestStatus.planned,
    )
    overall_result: Mapped[ControlTestResult | None] = mapped_column(
        SQLEnum(ControlTestResult, name="control_test_result"),
        nullable=True,
    )
    sample_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    exceptions_found: Mapped[int | None] = mapped_column(Integer, nullable=True)
    test_objective: Mapped[str | None] = mapped_column(Text, nullable=True)
    test_procedure: Mapped[str | None] = mapped_column(Text, nullable=True)
    test_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    samples: Mapped[list["ControlTestSample"]] = relationship(
        back_populates="test",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class ControlTestSample(Base):
    __tablename__ = "control_test_samples"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("control_tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    item_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[ControlTestResult | None] = mapped_column(
        SQLEnum(ControlTestResult, name="control_test_result"),
        nullable=True,
    )
    exception_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)

    test: Mapped["ControlTest"] = relationship(
        back_populates="samples",
        lazy="selectin",
    )

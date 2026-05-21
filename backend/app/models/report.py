import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.audit_engagement import AuditEngagement


class SavedReportStatus(str, Enum):
    draft = "draft"
    generating = "generating"
    completed = "completed"


class ReportSectionType(str, Enum):
    executive_summary = "executive_summary"
    scope = "scope"
    methodology = "methodology"
    findings = "findings"
    recommendations = "recommendations"
    management_response = "management_response"
    conclusion = "conclusion"


class ReportTemplate(Base):
    __tablename__ = "report_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Ordered list of section types this template includes
    sections: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    default_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    saved_reports: Mapped[list["SavedReport"]] = relationship(
        back_populates="template",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class SavedReport(Base):
    __tablename__ = "saved_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engagement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_engagements.id", ondelete="CASCADE"),
        nullable=False,
    )
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("report_templates.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[SavedReportStatus] = mapped_column(
        SQLEnum(SavedReportStatus, name="saved_report_status"),
        nullable=False,
        default=SavedReportStatus.draft,
    )
    # JSON: { section_type: rendered_content }
    sections: Mapped[dict[str, str]] = mapped_column(JSON, nullable=False, default=dict)
    generated_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    engagement: Mapped["AuditEngagement"] = relationship(
        back_populates="saved_reports",
        lazy="selectin",
    )
    template: Mapped["ReportTemplate"] = relationship(
        back_populates="saved_reports",
        lazy="selectin",
    )

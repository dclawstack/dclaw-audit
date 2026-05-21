import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.utils import utc_now
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.evidence_request import EvidenceRequest


class EvidenceVersionAction(str, Enum):
    created = "created"
    updated = "updated"
    status_changed = "status_changed"
    file_attached = "file_attached"
    note_added = "note_added"
    reminder_sent = "reminder_sent"


class EvidenceVersionLog(Base):
    __tablename__ = "evidence_version_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence_requests.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[EvidenceVersionAction] = mapped_column(
        SQLEnum(EvidenceVersionAction, name="evidence_version_action"),
        nullable=False,
    )
    previous_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    actor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)

    evidence_request: Mapped["EvidenceRequest"] = relationship(
        back_populates="version_logs",
        lazy="selectin",
    )

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.audit_signal import SignalSource, SignalStatus, SignalType


class AuditSignalCreate(BaseModel):
    signal_source: SignalSource
    signal_type: SignalType
    title: str
    description: str | None = None
    entity_ref: str | None = None
    severity: str = "medium"
    engagement_id: uuid.UUID | None = None
    raw_payload: str | None = None


class AuditSignalUpdate(BaseModel):
    status: SignalStatus | None = None
    engagement_id: uuid.UUID | None = None
    finding_id: uuid.UUID | None = None
    reviewed_by: str | None = None


class AuditSignalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    signal_source: SignalSource
    signal_type: SignalType
    title: str
    description: str | None
    entity_ref: str | None
    severity: str
    status: SignalStatus
    engagement_id: uuid.UUID | None
    finding_id: uuid.UUID | None
    reviewed_by: str | None
    reviewed_at: datetime | None
    created_at: datetime


class AuditSignalListResponse(BaseModel):
    items: list[AuditSignalRead]
    total: int

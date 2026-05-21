from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.evidence_request import EvidenceRequestStatus


class EvidenceRequestCreate(BaseModel):
    engagement_id: UUID
    title: str
    description: str | None = None
    request_owner: str | None = None
    due_date: date | None = None
    status: EvidenceRequestStatus = EvidenceRequestStatus.draft
    source_system: str | None = None


class EvidenceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    engagement_id: UUID
    title: str
    description: str | None = None
    request_owner: str | None = None
    due_date: date | None = None
    status: EvidenceRequestStatus
    source_system: str | None = None
    created_at: datetime
    updated_at: datetime


class EvidenceRequestListResponse(BaseModel):
    items: list[EvidenceRequestRead]
    total: int

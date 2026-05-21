from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.evidence_version_log import EvidenceVersionAction


class EvidenceVersionLogCreate(BaseModel):
    evidence_request_id: UUID
    action: EvidenceVersionAction
    previous_value: str | None = None
    new_value: str | None = None
    actor_name: str | None = None
    note: str | None = None


class EvidenceVersionLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    evidence_request_id: UUID
    action: EvidenceVersionAction
    previous_value: str | None = None
    new_value: str | None = None
    actor_name: str | None = None
    note: str | None = None
    created_at: datetime


class EvidenceVersionLogListResponse(BaseModel):
    items: list[EvidenceVersionLogRead]
    total: int

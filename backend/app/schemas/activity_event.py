import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ActivityEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    engagement_id: uuid.UUID | None
    entity_type: str
    entity_id: uuid.UUID | None
    action: str
    actor_name: str | None
    details: str | None
    created_at: datetime


class ActivityEventCreate(BaseModel):
    engagement_id: uuid.UUID | None = None
    entity_type: str
    entity_id: uuid.UUID | None = None
    action: str
    actor_name: str | None = None
    details: str | None = None


class ActivityEventListResponse(BaseModel):
    items: list[ActivityEventRead]
    total: int

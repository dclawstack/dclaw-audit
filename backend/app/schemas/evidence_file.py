from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class EvidenceFileRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    request_id: UUID
    filename: str
    content_type: str | None
    file_size: int | None
    uploaded_by: str | None
    version: int
    notes: str | None
    created_at: datetime

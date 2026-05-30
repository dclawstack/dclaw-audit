from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.workpaper import WorkpaperStatus


class WorkpaperBase(BaseModel):
    title: str
    content: str | None = None
    status: WorkpaperStatus = WorkpaperStatus.draft
    preparer_name: str | None = None
    reviewer_name: str | None = None
    notes: str | None = None


class WorkpaperCreate(WorkpaperBase):
    engagement_id: UUID


class WorkpaperUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    status: WorkpaperStatus | None = None
    preparer_name: str | None = None
    reviewer_name: str | None = None
    reviewed_at: datetime | None = None
    approved_at: datetime | None = None
    notes: str | None = None


class WorkpaperRead(WorkpaperBase):
    model_config = {"from_attributes": True}

    id: UUID
    engagement_id: UUID
    version: int
    reviewed_at: datetime | None
    approved_at: datetime | None
    created_at: datetime
    updated_at: datetime


class WorkpaperListResponse(BaseModel):
    items: list[WorkpaperRead]
    total: int

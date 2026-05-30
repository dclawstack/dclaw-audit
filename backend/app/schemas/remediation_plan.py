from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.remediation_plan import RemediationStatus


class RemediationPlanCreate(BaseModel):
    finding_id: UUID
    engagement_id: UUID
    title: str
    action_items: str | None = None
    owner_name: str | None = None
    due_date: date | None = None
    status: RemediationStatus = RemediationStatus.open
    progress_pct: int = Field(default=0, ge=0, le=100)
    notes: str | None = None


class RemediationPlanUpdate(BaseModel):
    title: str | None = None
    action_items: str | None = None
    owner_name: str | None = None
    due_date: date | None = None
    status: RemediationStatus | None = None
    progress_pct: int | None = Field(default=None, ge=0, le=100)
    notes: str | None = None


class RemediationPlanRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    finding_id: UUID
    engagement_id: UUID
    title: str
    action_items: str | None
    owner_name: str | None
    due_date: date | None
    status: RemediationStatus
    progress_pct: int
    ai_generated: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime


class RemediationPlanListResponse(BaseModel):
    items: list[RemediationPlanRead]
    total: int

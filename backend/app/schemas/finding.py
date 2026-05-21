from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.finding import FindingSeverity, FindingStatus


class FindingCreate(BaseModel):
    engagement_id: UUID
    title: str
    description: str | None = None
    severity: FindingSeverity = FindingSeverity.medium
    status: FindingStatus = FindingStatus.open
    root_cause: str | None = None
    recommendation: str | None = None
    remediation_plan: str | None = None
    owner_name: str | None = None
    due_date: date | None = None


class FindingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    severity: FindingSeverity | None = None
    status: FindingStatus | None = None
    root_cause: str | None = None
    recommendation: str | None = None
    remediation_plan: str | None = None
    owner_name: str | None = None
    due_date: date | None = None


class FindingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    engagement_id: UUID
    title: str
    description: str | None = None
    severity: FindingSeverity
    status: FindingStatus
    root_cause: str | None = None
    recommendation: str | None = None
    remediation_plan: str | None = None
    owner_name: str | None = None
    due_date: date | None = None
    created_at: datetime
    updated_at: datetime


class FindingListResponse(BaseModel):
    items: list[FindingRead]
    total: int

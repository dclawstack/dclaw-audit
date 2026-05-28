import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.risk_item import RiskItemStatus


class RiskItemCreate(BaseModel):
    engagement_id: uuid.UUID
    title: str
    description: str | None = None
    category: str | None = None
    likelihood: int = 3
    impact: int = 3
    residual_likelihood: int | None = None
    residual_impact: int | None = None
    owner_name: str | None = None
    status: RiskItemStatus = RiskItemStatus.open
    mitigation_notes: str | None = None

    @field_validator("likelihood", "impact")
    @classmethod
    def clamp_score(cls, v: int) -> int:
        return max(1, min(5, v))


class RiskItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    likelihood: int | None = None
    impact: int | None = None
    residual_likelihood: int | None = None
    residual_impact: int | None = None
    owner_name: str | None = None
    status: RiskItemStatus | None = None
    mitigation_notes: str | None = None


class RiskItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    engagement_id: uuid.UUID
    title: str
    description: str | None
    category: str | None
    likelihood: int
    impact: int
    risk_score: float
    residual_likelihood: int | None
    residual_impact: int | None
    residual_score: float | None
    owner_name: str | None
    status: RiskItemStatus
    mitigation_notes: str | None
    created_at: datetime
    updated_at: datetime


class RiskItemListResponse(BaseModel):
    items: list[RiskItemRead]
    total: int

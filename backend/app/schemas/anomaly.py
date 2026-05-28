import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.anomaly import AnomalyFlagStatus, AnomalyFlagType


class AnomalyTransactionIngest(BaseModel):
    engagement_id: uuid.UUID | None = None
    transaction_date: date | None = None
    amount: float | None = None
    description: str | None = None
    account_code: str | None = None
    party_name: str | None = None
    source_system: str | None = None
    batch_id: str | None = None
    raw_data: str | None = None


class AnomalyTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    engagement_id: uuid.UUID | None
    transaction_date: date | None
    amount: float | None
    description: str | None
    account_code: str | None
    party_name: str | None
    source_system: str | None
    batch_id: str | None
    created_at: datetime
    flags: list["AnomalyFlagRead"]


class AnomalyFlagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    transaction_id: uuid.UUID
    flag_type: AnomalyFlagType
    severity: str
    description: str
    confidence_score: float | None
    status: AnomalyFlagStatus
    analyst_notes: str | None
    reviewed_by: str | None
    reviewed_at: datetime | None
    created_at: datetime


class AnomalyFlagUpdate(BaseModel):
    status: AnomalyFlagStatus | None = None
    analyst_notes: str | None = None
    reviewed_by: str | None = None


class AnomalyTransactionListResponse(BaseModel):
    items: list[AnomalyTransactionRead]
    total: int


class AnomalyFlagListResponse(BaseModel):
    items: list[AnomalyFlagRead]
    total: int


class BulkIngestRequest(BaseModel):
    transactions: list[AnomalyTransactionIngest]
    run_detection: bool = True


class BulkIngestResponse(BaseModel):
    ingested: int
    flags_created: int

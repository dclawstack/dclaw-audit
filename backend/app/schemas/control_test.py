import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.control_test import ControlTestResult, ControlTestStatus, ControlTestType


class ControlTestCreate(BaseModel):
    engagement_id: uuid.UUID
    control_id: uuid.UUID | None = None
    title: str
    test_type: ControlTestType = ControlTestType.manual
    scheduled_date: date | None = None
    test_objective: str | None = None
    test_procedure: str | None = None
    sample_size: int | None = None
    owner_name: str | None = None
    reviewer_name: str | None = None


class ControlTestUpdate(BaseModel):
    title: str | None = None
    test_type: ControlTestType | None = None
    scheduled_date: date | None = None
    completed_date: date | None = None
    status: ControlTestStatus | None = None
    overall_result: ControlTestResult | None = None
    sample_size: int | None = None
    exceptions_found: int | None = None
    test_objective: str | None = None
    test_procedure: str | None = None
    test_notes: str | None = None
    owner_name: str | None = None
    reviewer_name: str | None = None


class ControlTestSampleCreate(BaseModel):
    test_id: uuid.UUID
    item_reference: str
    item_description: str | None = None
    result: ControlTestResult | None = None
    exception_notes: str | None = None


class ControlTestSampleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    test_id: uuid.UUID
    item_reference: str
    item_description: str | None
    result: ControlTestResult | None
    exception_notes: str | None
    created_at: datetime


class ControlTestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    engagement_id: uuid.UUID
    control_id: uuid.UUID | None
    title: str
    test_type: ControlTestType
    scheduled_date: date | None
    completed_date: date | None
    status: ControlTestStatus
    overall_result: ControlTestResult | None
    sample_size: int | None
    exceptions_found: int | None
    test_objective: str | None
    test_procedure: str | None
    test_notes: str | None
    owner_name: str | None
    reviewer_name: str | None
    created_at: datetime
    updated_at: datetime
    samples: list[ControlTestSampleRead]


class ControlTestListResponse(BaseModel):
    items: list[ControlTestRead]
    total: int

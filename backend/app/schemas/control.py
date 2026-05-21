from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.control import FrameworkName
from app.models.control_mapping import MappingCoverageStatus


class ControlCreate(BaseModel):
    name: str
    description: str | None = None
    framework: FrameworkName | None = None
    control_owner: str | None = None
    frequency: str | None = None
    automated: bool = False


class ControlRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    framework: FrameworkName | None = None
    control_owner: str | None = None
    frequency: str | None = None
    automated: bool
    created_at: datetime
    updated_at: datetime


class ControlListResponse(BaseModel):
    items: list[ControlRead]
    total: int


class FrameworkRequirementCreate(BaseModel):
    framework: FrameworkName
    requirement_code: str
    title: str
    description: str | None = None


class FrameworkRequirementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    framework: FrameworkName
    requirement_code: str
    title: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime


class FrameworkRequirementListResponse(BaseModel):
    items: list[FrameworkRequirementRead]
    total: int


class ControlMappingCreate(BaseModel):
    control_id: UUID
    framework_requirement_id: UUID
    coverage_status: MappingCoverageStatus = MappingCoverageStatus.partial
    notes: str | None = None


class ControlMappingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    control_id: UUID
    framework_requirement_id: UUID
    coverage_status: MappingCoverageStatus
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class ControlMappingListResponse(BaseModel):
    items: list[ControlMappingRead]
    total: int


class ControlMappingWithDetailsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    control_id: UUID
    framework_requirement_id: UUID
    coverage_status: MappingCoverageStatus
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    control: ControlRead
    framework_requirement: FrameworkRequirementRead


class ControlWithMappingsRead(ControlRead):
    mappings: list[ControlMappingWithDetailsRead]


class FrameworkRequirementWithMappingsRead(FrameworkRequirementRead):
    mappings: list[ControlMappingWithDetailsRead]


class GapAnalysisItem(BaseModel):
    framework_requirement: FrameworkRequirementRead
    mapped_controls: list[ControlRead]
    coverage_status: MappingCoverageStatus | None = None

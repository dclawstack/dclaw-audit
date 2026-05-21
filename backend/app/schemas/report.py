from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.report import ReportSectionType, SavedReportStatus


# ReportTemplate schemas

class ReportTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    sections: list[str]
    default_prompt: str | None = None


class ReportTemplateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    sections: list[str]
    default_prompt: str | None = None
    created_at: datetime
    updated_at: datetime


class ReportTemplateListResponse(BaseModel):
    items: list[ReportTemplateRead]
    total: int


# SavedReport schemas

class SavedReportCreate(BaseModel):
    engagement_id: UUID
    template_id: UUID
    title: str


class SavedReportUpdate(BaseModel):
    title: str | None = None
    status: SavedReportStatus | None = None
    sections: dict[str, str] | None = None
    generated_summary: str | None = None


class SavedReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    engagement_id: UUID
    template_id: UUID
    title: str
    status: SavedReportStatus
    sections: dict[str, str]
    generated_summary: str | None = None
    created_at: datetime
    updated_at: datetime


class SavedReportListResponse(BaseModel):
    items: list[SavedReportRead]
    total: int


class SavedReportWithTemplateRead(SavedReportRead):
    template: ReportTemplateRead


class ReportGenerateRequest(BaseModel):
    engagement_id: UUID
    template_id: UUID
    title: str
    provider: str | None = "openrouter"

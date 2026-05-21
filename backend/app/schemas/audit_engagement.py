from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.audit_engagement import EngagementStatus, RiskLevel
from app.schemas.control import ControlRead
from app.schemas.evidence_request import EvidenceRequestRead
from app.schemas.finding import FindingRead


class AuditEngagementCreate(BaseModel):
    title: str
    client_name: str
    status: EngagementStatus = EngagementStatus.planned
    risk_level: RiskLevel = RiskLevel.medium
    owner_name: str | None = None
    description: str | None = None
    audit_period_start: date | None = None
    audit_period_end: date | None = None


class AuditEngagementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    client_name: str
    status: EngagementStatus
    risk_level: RiskLevel
    owner_name: str | None = None
    description: str | None = None
    audit_period_start: date | None = None
    audit_period_end: date | None = None
    created_at: datetime
    updated_at: datetime


class AuditEngagementListResponse(BaseModel):
    items: list[AuditEngagementRead]
    total: int


class AuditDashboardSummary(BaseModel):
    total_engagements: int
    status_breakdown: dict[str, int]
    risk_breakdown: dict[str, int]
    open_requests: int
    overdue_requests: int
    total_findings: int
    open_findings: int
    overdue_findings: int
    finding_severity_breakdown: dict[str, int]
    finding_status_breakdown: dict[str, int]
    finding_aging_buckets: dict[str, int]
    total_controls: int
    total_framework_requirements: int
    framework_breakdown: dict[str, int]
    recent_engagements: list[AuditEngagementRead]
    recent_evidence_requests: list[EvidenceRequestRead]
    recent_findings: list[FindingRead]
    recent_controls: list[ControlRead]

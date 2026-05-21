from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_engagement import AuditEngagement
from app.models.framework_requirement import FrameworkRequirement
from app.repositories.base_repo import BaseRepository
from app.repositories.control_repository import ControlRepository, FrameworkRequirementRepository
from app.repositories.evidence_request_repository import EvidenceRequestRepository
from app.repositories.finding_repository import FindingRepository
from app.schemas.audit_engagement import AuditDashboardSummary, AuditEngagementCreate


class AuditEngagementRepository(BaseRepository[AuditEngagement]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, AuditEngagement)

    async def create_engagement(self, payload: AuditEngagementCreate) -> AuditEngagement:
        engagement = AuditEngagement(**payload.model_dump())
        return await self.create(engagement)

    async def list_recent(self, limit: int = 5) -> list[AuditEngagement]:
        result = await self.db.execute(
            select(AuditEngagement)
            .order_by(AuditEngagement.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_dashboard_summary(self) -> AuditDashboardSummary:
        total_engagements = await self.count()

        status_rows = await self.db.execute(
            select(AuditEngagement.status, func.count())
            .group_by(AuditEngagement.status)
        )
        risk_rows = await self.db.execute(
            select(AuditEngagement.risk_level, func.count())
            .group_by(AuditEngagement.risk_level)
        )

        recent_engagements = await self.list_recent()
        evidence_request_repository = EvidenceRequestRepository(self.db)
        open_requests = await evidence_request_repository.count_open_requests()
        overdue_requests = await evidence_request_repository.count_overdue_requests()
        recent_evidence_requests = await evidence_request_repository.list_recent()

        finding_repository = FindingRepository(self.db)
        total_findings = await finding_repository.count()
        open_findings = await finding_repository.count_open_findings()
        overdue_findings = await finding_repository.count_overdue_findings()
        recent_findings = await finding_repository.list_recent()
        finding_severity_breakdown = await finding_repository.get_severity_breakdown()
        finding_status_breakdown = await finding_repository.get_status_breakdown()
        finding_aging_buckets = await finding_repository.get_aging_buckets()

        control_repository = ControlRepository(self.db)
        total_controls = await control_repository.count()
        recent_controls = await control_repository.list_recent()

        framework_repository = FrameworkRequirementRepository(self.db)
        total_framework_requirements = await framework_repository.count()
        framework_rows = await self.db.execute(
            select(AuditEngagement.risk_level, func.count())
            .group_by(AuditEngagement.risk_level)
        )
        # Actually framework breakdown should be on FrameworkRequirement.framework
        framework_rows = await self.db.execute(
            select(FrameworkRequirement.framework, func.count())
            .group_by(FrameworkRequirement.framework)
        )

        return AuditDashboardSummary(
            total_engagements=total_engagements,
            status_breakdown={status.value: count for status, count in status_rows.all()},
            risk_breakdown={risk.value: count for risk, count in risk_rows.all()},
            open_requests=open_requests,
            overdue_requests=overdue_requests,
            total_findings=total_findings,
            open_findings=open_findings,
            overdue_findings=overdue_findings,
            finding_severity_breakdown=finding_severity_breakdown,
            finding_status_breakdown=finding_status_breakdown,
            finding_aging_buckets=finding_aging_buckets,
            total_controls=total_controls,
            total_framework_requirements=total_framework_requirements,
            framework_breakdown={fw.value: count for fw, count in framework_rows.all()},
            recent_engagements=recent_engagements,
            recent_evidence_requests=recent_evidence_requests,
            recent_findings=recent_findings,
            recent_controls=recent_controls,
        )

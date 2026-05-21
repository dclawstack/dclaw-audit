from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finding import Finding, FindingSeverity, FindingStatus
from app.repositories.base_repo import BaseRepository
from app.schemas.finding import FindingCreate, FindingUpdate


class FindingRepository(BaseRepository[Finding]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Finding)

    async def create_finding(self, payload: FindingCreate) -> Finding:
        finding = Finding(**payload.model_dump())
        return await self.create(finding)

    async def list_findings(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
        status: FindingStatus | None = None,
        severity: FindingSeverity | None = None,
    ) -> tuple[list[Finding], int]:
        query = select(Finding)
        count_query = select(func.count()).select_from(Finding)

        if engagement_id is not None:
            query = query.where(Finding.engagement_id == engagement_id)
            count_query = count_query.where(Finding.engagement_id == engagement_id)

        if status is not None:
            query = query.where(Finding.status == status)
            count_query = count_query.where(Finding.status == status)

        if severity is not None:
            query = query.where(Finding.severity == severity)
            count_query = count_query.where(Finding.severity == severity)

        query = query.order_by(Finding.created_at.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def list_recent(self, limit: int = 5) -> list[Finding]:
        result = await self.db.execute(
            select(Finding)
            .order_by(Finding.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update_finding(self, finding: Finding, payload: FindingUpdate) -> Finding:
        updates = payload.model_dump(exclude_unset=True)
        return await self.update(finding, updates)

    async def count_open_findings(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Finding)
            .where(Finding.status != FindingStatus.verified)
        )
        return result.scalar() or 0

    async def count_overdue_findings(self) -> int:
        today = date.today()
        result = await self.db.execute(
            select(func.count())
            .select_from(Finding)
            .where(
                (Finding.due_date < today)
                & (Finding.status != FindingStatus.verified)
            )
        )
        return result.scalar() or 0

    async def get_severity_breakdown(self) -> dict[str, int]:
        rows = await self.db.execute(
            select(Finding.severity, func.count())
            .group_by(Finding.severity)
        )
        return {severity.value: count for severity, count in rows.all()}

    async def get_status_breakdown(self) -> dict[str, int]:
        rows = await self.db.execute(
            select(Finding.status, func.count())
            .group_by(Finding.status)
        )
        return {status.value: count for status, count in rows.all()}

    async def get_aging_buckets(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Finding)
            .where(Finding.status != FindingStatus.verified)
        )
        active_findings = list(result.scalars().all())
        today = date.today()
        buckets = {
            "0_30": 0,
            "31_60": 0,
            "61_90": 0,
            "91_plus": 0,
        }

        for finding in active_findings:
            age_days = (today - finding.created_at.date()).days
            if age_days <= 30:
                buckets["0_30"] += 1
            elif age_days <= 60:
                buckets["31_60"] += 1
            elif age_days <= 90:
                buckets["61_90"] += 1
            else:
                buckets["91_plus"] += 1

        return buckets

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import ReportTemplate, SavedReport
from app.repositories.base_repo import BaseRepository
from app.schemas.report import ReportTemplateCreate, SavedReportCreate, SavedReportUpdate


class ReportTemplateRepository(BaseRepository[ReportTemplate]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ReportTemplate)

    async def create_template(self, payload: ReportTemplateCreate) -> ReportTemplate:
        template = ReportTemplate(**payload.model_dump())
        return await self.create(template)

    async def list_templates(self, limit: int = 20, offset: int = 0) -> tuple[list[ReportTemplate], int]:
        return await self.list_all(limit=limit, offset=offset)


class SavedReportRepository(BaseRepository[SavedReport]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, SavedReport)

    async def create_saved_report(self, payload: SavedReportCreate) -> SavedReport:
        report = SavedReport(**payload.model_dump())
        return await self.create(report)

    async def list_reports(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
    ) -> tuple[list[SavedReport], int]:
        query = select(SavedReport)
        count_query = select(func.count()).select_from(SavedReport)

        if engagement_id is not None:
            query = query.where(SavedReport.engagement_id == engagement_id)
            count_query = count_query.where(SavedReport.engagement_id == engagement_id)

        query = query.order_by(SavedReport.created_at.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def update_report(self, report: SavedReport, payload: SavedReportUpdate) -> SavedReport:
        updates = payload.model_dump(exclude_unset=True)
        return await self.update(report, updates)

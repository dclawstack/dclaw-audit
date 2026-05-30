from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.remediation_plan import RemediationPlan, RemediationStatus
from app.repositories.base_repo import BaseRepository
from app.schemas.remediation_plan import RemediationPlanCreate, RemediationPlanUpdate


class RemediationPlanRepository(BaseRepository[RemediationPlan]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, RemediationPlan)

    async def create_plan(self, payload: RemediationPlanCreate) -> RemediationPlan:
        plan = RemediationPlan(**payload.model_dump())
        return await self.create(plan)

    async def list_plans(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
        finding_id: UUID | None = None,
        status: RemediationStatus | None = None,
    ) -> tuple[list[RemediationPlan], int]:
        query = select(RemediationPlan)
        count_query = select(func.count()).select_from(RemediationPlan)

        if engagement_id is not None:
            query = query.where(RemediationPlan.engagement_id == engagement_id)
            count_query = count_query.where(RemediationPlan.engagement_id == engagement_id)
        if finding_id is not None:
            query = query.where(RemediationPlan.finding_id == finding_id)
            count_query = count_query.where(RemediationPlan.finding_id == finding_id)
        if status is not None:
            query = query.where(RemediationPlan.status == status)
            count_query = count_query.where(RemediationPlan.status == status)

        query = query.order_by(RemediationPlan.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total = (await self.db.execute(count_query)).scalar() or 0
        return items, total

    async def update_plan(self, plan: RemediationPlan, payload: RemediationPlanUpdate) -> RemediationPlan:
        return await self.update(plan, payload.model_dump(exclude_unset=True))

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.risk_item import RiskItem, RiskItemStatus
from app.repositories.base_repo import BaseRepository
from app.schemas.risk_item import RiskItemCreate, RiskItemUpdate


class RiskItemRepository(BaseRepository[RiskItem]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, RiskItem)

    async def create_risk_item(self, payload: RiskItemCreate) -> RiskItem:
        data = payload.model_dump()
        data["risk_score"] = float(data["likelihood"] * data["impact"])
        if data.get("residual_likelihood") and data.get("residual_impact"):
            data["residual_score"] = float(data["residual_likelihood"] * data["residual_impact"])
        item = RiskItem(**data)
        return await self.create(item)

    async def update_risk_item(self, item: RiskItem, payload: RiskItemUpdate) -> RiskItem:
        updates = payload.model_dump(exclude_unset=True)
        likelihood = updates.get("likelihood", item.likelihood)
        impact = updates.get("impact", item.impact)
        updates["risk_score"] = float(likelihood * impact)
        res_l = updates.get("residual_likelihood", item.residual_likelihood)
        res_i = updates.get("residual_impact", item.residual_impact)
        if res_l and res_i:
            updates["residual_score"] = float(res_l * res_i)
        return await self.update(item, updates)

    async def list_risk_items(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
        status: RiskItemStatus | None = None,
    ) -> tuple[list[RiskItem], int]:
        query = select(RiskItem)
        count_query = select(func.count()).select_from(RiskItem)

        if engagement_id is not None:
            query = query.where(RiskItem.engagement_id == engagement_id)
            count_query = count_query.where(RiskItem.engagement_id == engagement_id)

        if status is not None:
            query = query.where(RiskItem.status == status)
            count_query = count_query.where(RiskItem.status == status)

        query = query.order_by(RiskItem.risk_score.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

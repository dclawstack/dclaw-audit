from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_event import ActivityEvent
from app.repositories.base_repo import BaseRepository
from app.schemas.activity_event import ActivityEventCreate


class ActivityEventRepository(BaseRepository[ActivityEvent]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ActivityEvent)

    async def log(self, payload: ActivityEventCreate) -> ActivityEvent:
        event = ActivityEvent(**payload.model_dump())
        return await self.create(event)

    async def list_events(
        self,
        limit: int = 50,
        offset: int = 0,
        engagement_id: UUID | None = None,
        entity_type: str | None = None,
    ) -> tuple[list[ActivityEvent], int]:
        query = select(ActivityEvent)
        count_query = select(func.count()).select_from(ActivityEvent)

        if engagement_id is not None:
            query = query.where(ActivityEvent.engagement_id == engagement_id)
            count_query = count_query.where(ActivityEvent.engagement_id == engagement_id)

        if entity_type is not None:
            query = query.where(ActivityEvent.entity_type == entity_type)
            count_query = count_query.where(ActivityEvent.entity_type == entity_type)

        query = query.order_by(ActivityEvent.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

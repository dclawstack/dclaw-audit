from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workpaper import Workpaper, WorkpaperStatus
from app.repositories.base_repo import BaseRepository
from app.schemas.workpaper import WorkpaperCreate, WorkpaperUpdate


class WorkpaperRepository(BaseRepository[Workpaper]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Workpaper)

    async def create_workpaper(self, payload: WorkpaperCreate) -> Workpaper:
        wp = Workpaper(**payload.model_dump())
        return await self.create(wp)

    async def list_workpapers(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
        status: WorkpaperStatus | None = None,
    ) -> tuple[list[Workpaper], int]:
        query = select(Workpaper)
        count_query = select(func.count()).select_from(Workpaper)

        if engagement_id is not None:
            query = query.where(Workpaper.engagement_id == engagement_id)
            count_query = count_query.where(Workpaper.engagement_id == engagement_id)
        if status is not None:
            query = query.where(Workpaper.status == status)
            count_query = count_query.where(Workpaper.status == status)

        query = query.order_by(Workpaper.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total = (await self.db.execute(count_query)).scalar() or 0
        return items, total

    async def update_workpaper(self, wp: Workpaper, payload: WorkpaperUpdate) -> Workpaper:
        updates = payload.model_dump(exclude_unset=True)
        # bump version on content changes
        if "content" in updates:
            updates["version"] = wp.version + 1
        return await self.update(wp, updates)

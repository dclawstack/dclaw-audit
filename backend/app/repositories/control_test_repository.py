from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.control_test import ControlTest, ControlTestSample, ControlTestStatus
from app.repositories.base_repo import BaseRepository
from app.schemas.control_test import ControlTestCreate, ControlTestSampleCreate, ControlTestUpdate


class ControlTestRepository(BaseRepository[ControlTest]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ControlTest)

    async def create_test(self, payload: ControlTestCreate) -> ControlTest:
        test = ControlTest(**payload.model_dump())
        return await self.create(test)

    async def update_test(self, test: ControlTest, payload: ControlTestUpdate) -> ControlTest:
        updates = payload.model_dump(exclude_unset=True)
        return await self.update(test, updates)

    async def list_tests(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
        control_id: UUID | None = None,
        status: ControlTestStatus | None = None,
    ) -> tuple[list[ControlTest], int]:
        query = select(ControlTest)
        count_query = select(func.count()).select_from(ControlTest)

        if engagement_id is not None:
            query = query.where(ControlTest.engagement_id == engagement_id)
            count_query = count_query.where(ControlTest.engagement_id == engagement_id)

        if control_id is not None:
            query = query.where(ControlTest.control_id == control_id)
            count_query = count_query.where(ControlTest.control_id == control_id)

        if status is not None:
            query = query.where(ControlTest.status == status)
            count_query = count_query.where(ControlTest.status == status)

        query = query.order_by(ControlTest.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total


class ControlTestSampleRepository(BaseRepository[ControlTestSample]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ControlTestSample)

    async def create_sample(self, payload: ControlTestSampleCreate) -> ControlTestSample:
        sample = ControlTestSample(**payload.model_dump())
        return await self.create(sample)

    async def list_samples(
        self, test_id: UUID, limit: int = 100, offset: int = 0
    ) -> tuple[list[ControlTestSample], int]:
        query = select(ControlTestSample).where(ControlTestSample.test_id == test_id)
        count_query = select(func.count()).select_from(ControlTestSample).where(
            ControlTestSample.test_id == test_id
        )
        query = query.order_by(ControlTestSample.created_at.asc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

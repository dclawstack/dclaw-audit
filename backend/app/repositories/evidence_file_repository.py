from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_file import EvidenceFile
from app.repositories.base_repo import BaseRepository


class EvidenceFileRepository(BaseRepository[EvidenceFile]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, EvidenceFile)

    async def list_by_request(self, request_id: UUID) -> list[EvidenceFile]:
        result = await self.db.execute(
            select(EvidenceFile)
            .where(EvidenceFile.request_id == request_id)
            .order_by(EvidenceFile.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_file(self, **kwargs) -> EvidenceFile:
        f = EvidenceFile(**kwargs)
        return await self.create(f)

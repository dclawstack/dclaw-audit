from datetime import date
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_request import EvidenceRequest, EvidenceRequestStatus
from app.repositories.base_repo import BaseRepository
from app.schemas.evidence_request import EvidenceRequestCreate


class EvidenceRequestRepository(BaseRepository[EvidenceRequest]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, EvidenceRequest)

    async def create_request(self, payload: EvidenceRequestCreate) -> EvidenceRequest:
        evidence_request = EvidenceRequest(**payload.model_dump())
        return await self.create(evidence_request)

    async def list_requests(
        self,
        limit: int = 20,
        offset: int = 0,
        engagement_id: UUID | None = None,
    ) -> tuple[list[EvidenceRequest], int]:
        query = select(EvidenceRequest)
        count_query = select(func.count()).select_from(EvidenceRequest)

        if engagement_id is not None:
            query = query.where(EvidenceRequest.engagement_id == engagement_id)
            count_query = count_query.where(EvidenceRequest.engagement_id == engagement_id)

        query = query.order_by(EvidenceRequest.created_at.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def list_recent(self, limit: int = 5) -> list[EvidenceRequest]:
        result = await self.db.execute(
            select(EvidenceRequest)
            .order_by(EvidenceRequest.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_open_requests(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(EvidenceRequest)
            .where(EvidenceRequest.status != EvidenceRequestStatus.received)
        )
        return result.scalar() or 0

    async def count_overdue_requests(self) -> int:
        today = date.today()
        result = await self.db.execute(
            select(func.count())
            .select_from(EvidenceRequest)
            .where(
                or_(
                    EvidenceRequest.status == EvidenceRequestStatus.overdue,
                    (
                        (EvidenceRequest.due_date < today)
                        & (EvidenceRequest.status != EvidenceRequestStatus.received)
                    ),
                )
            )
        )
        return result.scalar() or 0

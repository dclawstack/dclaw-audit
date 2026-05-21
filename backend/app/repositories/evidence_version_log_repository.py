from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_version_log import EvidenceVersionLog, EvidenceVersionAction
from app.repositories.base_repo import BaseRepository
from app.schemas.evidence_version_log import EvidenceVersionLogCreate


class EvidenceVersionLogRepository(BaseRepository[EvidenceVersionLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, EvidenceVersionLog)

    async def create_log(self, payload: EvidenceVersionLogCreate) -> EvidenceVersionLog:
        log = EvidenceVersionLog(**payload.model_dump())
        return await self.create(log)

    async def list_logs(
        self,
        evidence_request_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[EvidenceVersionLog], int]:
        query = (
            select(EvidenceVersionLog)
            .where(EvidenceVersionLog.evidence_request_id == evidence_request_id)
            .order_by(EvidenceVersionLog.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        count_query = (
            select(func.count())
            .select_from(EvidenceVersionLog)
            .where(EvidenceVersionLog.evidence_request_id == evidence_request_id)
        )

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def auto_log_status_change(
        self,
        evidence_request_id: UUID,
        previous_status: str,
        new_status: str,
        actor_name: str | None = None,
    ) -> EvidenceVersionLog:
        log = EvidenceVersionLog(
            evidence_request_id=evidence_request_id,
            action=EvidenceVersionAction.status_changed,
            previous_value=previous_status,
            new_value=new_status,
            actor_name=actor_name,
            note=f"Status changed from {previous_status} to {new_status}",
        )
        return await self.create(log)

    async def auto_log_created(
        self,
        evidence_request_id: UUID,
        actor_name: str | None = None,
    ) -> EvidenceVersionLog:
        log = EvidenceVersionLog(
            evidence_request_id=evidence_request_id,
            action=EvidenceVersionAction.created,
            actor_name=actor_name,
            note="Evidence request created",
        )
        return await self.create(log)

    async def auto_log_updated(
        self,
        evidence_request_id: UUID,
        field_name: str,
        previous_value: str | None,
        new_value: str | None,
        actor_name: str | None = None,
    ) -> EvidenceVersionLog:
        log = EvidenceVersionLog(
            evidence_request_id=evidence_request_id,
            action=EvidenceVersionAction.updated,
            previous_value=previous_value,
            new_value=new_value,
            actor_name=actor_name,
            note=f"Field '{field_name}' updated",
        )
        return await self.create(log)

from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_signal import AuditSignal, SignalSource, SignalStatus, SignalType
from app.repositories.base_repo import BaseRepository
from app.schemas.audit_signal import AuditSignalCreate, AuditSignalUpdate


class AuditSignalRepository(BaseRepository[AuditSignal]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, AuditSignal)

    async def create_signal(self, payload: AuditSignalCreate) -> AuditSignal:
        signal = AuditSignal(**payload.model_dump())
        return await self.create(signal)

    async def update_signal(self, signal: AuditSignal, payload: AuditSignalUpdate) -> AuditSignal:
        updates = payload.model_dump(exclude_unset=True)
        if "reviewed_by" in updates and updates["reviewed_by"]:
            updates["reviewed_at"] = datetime.utcnow()
            if "status" not in updates:
                updates["status"] = SignalStatus.reviewed
        return await self.update(signal, updates)

    async def list_signals(
        self,
        limit: int = 50,
        offset: int = 0,
        engagement_id: UUID | None = None,
        status: SignalStatus | None = None,
        signal_source: SignalSource | None = None,
        signal_type: SignalType | None = None,
    ) -> tuple[list[AuditSignal], int]:
        query = select(AuditSignal)
        count_query = select(func.count()).select_from(AuditSignal)

        if engagement_id is not None:
            query = query.where(AuditSignal.engagement_id == engagement_id)
            count_query = count_query.where(AuditSignal.engagement_id == engagement_id)

        if status is not None:
            query = query.where(AuditSignal.status == status)
            count_query = count_query.where(AuditSignal.status == status)

        if signal_source is not None:
            query = query.where(AuditSignal.signal_source == signal_source)
            count_query = count_query.where(AuditSignal.signal_source == signal_source)

        if signal_type is not None:
            query = query.where(AuditSignal.signal_type == signal_type)
            count_query = count_query.where(AuditSignal.signal_type == signal_type)

        query = query.order_by(AuditSignal.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def get_source_breakdown(self) -> dict[str, int]:
        rows = await self.db.execute(
            select(AuditSignal.signal_source, func.count()).group_by(AuditSignal.signal_source)
        )
        return {source.value: count for source, count in rows.all()}

    async def get_status_breakdown(self) -> dict[str, int]:
        rows = await self.db.execute(
            select(AuditSignal.status, func.count()).group_by(AuditSignal.status)
        )
        return {status.value: count for status, count in rows.all()}

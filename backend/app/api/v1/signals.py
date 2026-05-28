from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.audit_signal import SignalSource, SignalStatus, SignalType
from app.repositories.audit_signal_repository import AuditSignalRepository
from app.schemas.audit_signal import (
    AuditSignalCreate,
    AuditSignalListResponse,
    AuditSignalRead,
    AuditSignalUpdate,
)

router = APIRouter()


@router.get("/audit-signals", response_model=AuditSignalListResponse)
async def list_audit_signals(
    limit: int = 50,
    offset: int = 0,
    engagement_id: UUID | None = None,
    status: SignalStatus | None = None,
    signal_source: SignalSource | None = None,
    signal_type: SignalType | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = AuditSignalRepository(db)
    items, total = await repo.list_signals(
        limit=limit, offset=offset, engagement_id=engagement_id,
        status=status, signal_source=signal_source, signal_type=signal_type
    )
    return AuditSignalListResponse(items=items, total=total)


@router.post("/audit-signals", response_model=AuditSignalRead, status_code=status.HTTP_201_CREATED)
async def create_audit_signal(
    payload: AuditSignalCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = AuditSignalRepository(db)
    return await repo.create_signal(payload)


@router.get("/audit-signals/{signal_id}", response_model=AuditSignalRead)
async def get_audit_signal(signal_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = AuditSignalRepository(db)
    signal = await repo.get_by_id(signal_id)
    if signal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    return signal


@router.patch("/audit-signals/{signal_id}", response_model=AuditSignalRead)
async def update_audit_signal(
    signal_id: UUID,
    payload: AuditSignalUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = AuditSignalRepository(db)
    signal = await repo.get_by_id(signal_id)
    if signal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    return await repo.update_signal(signal, payload)


@router.delete("/audit-signals/{signal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_audit_signal(signal_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = AuditSignalRepository(db)
    signal = await repo.get_by_id(signal_id)
    if signal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    await repo.delete(signal)


@router.get("/audit-signals/stats/breakdown")
async def get_signal_breakdown(db: AsyncSession = Depends(get_db)):
    repo = AuditSignalRepository(db)
    source_breakdown = await repo.get_source_breakdown()
    status_breakdown = await repo.get_status_breakdown()
    return {"source_breakdown": source_breakdown, "status_breakdown": status_breakdown}

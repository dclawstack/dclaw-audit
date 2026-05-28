from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.anomaly import AnomalyFlagStatus, AnomalyFlagType
from app.repositories.anomaly_repository import AnomalyFlagRepository, AnomalyTransactionRepository
from app.schemas.anomaly import (
    AnomalyFlagListResponse,
    AnomalyFlagRead,
    AnomalyFlagUpdate,
    AnomalyTransactionIngest,
    AnomalyTransactionListResponse,
    AnomalyTransactionRead,
    BulkIngestRequest,
    BulkIngestResponse,
)

router = APIRouter()


@router.get("/anomaly-transactions", response_model=AnomalyTransactionListResponse)
async def list_anomaly_transactions(
    limit: int = 50,
    offset: int = 0,
    engagement_id: UUID | None = None,
    batch_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = AnomalyTransactionRepository(db)
    items, total = await repo.list_transactions(
        limit=limit, offset=offset, engagement_id=engagement_id, batch_id=batch_id
    )
    return AnomalyTransactionListResponse(items=items, total=total)


@router.post(
    "/anomaly-transactions/ingest",
    response_model=AnomalyTransactionRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_transaction(
    payload: AnomalyTransactionIngest,
    db: AsyncSession = Depends(get_db),
):
    repo = AnomalyTransactionRepository(db)
    return await repo.ingest(payload)


@router.post("/anomaly-transactions/bulk-ingest", response_model=BulkIngestResponse)
async def bulk_ingest_transactions(
    payload: BulkIngestRequest,
    db: AsyncSession = Depends(get_db),
):
    repo = AnomalyTransactionRepository(db)
    ingested_txns = []
    for txn_data in payload.transactions:
        txn = await repo.ingest(txn_data)
        ingested_txns.append(txn)

    flags_created = 0
    if payload.run_detection and ingested_txns:
        stat_flags = await repo.run_statistical_detection(ingested_txns)
        rule_flags = await repo.run_rule_detection(ingested_txns)
        flags_created = len(stat_flags) + len(rule_flags)

    return BulkIngestResponse(ingested=len(ingested_txns), flags_created=flags_created)


@router.post("/anomaly-transactions/{txn_id}/detect", response_model=BulkIngestResponse)
async def run_detection_on_batch(
    txn_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Re-run detection on all transactions in the same batch as txn_id."""
    repo = AnomalyTransactionRepository(db)
    txn = await repo.get_by_id(txn_id)
    if txn is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    batch_txns, _ = await repo.list_transactions(
        limit=1000, batch_id=txn.batch_id, engagement_id=txn.engagement_id
    )
    stat_flags = await repo.run_statistical_detection(batch_txns)
    rule_flags = await repo.run_rule_detection(batch_txns)
    return BulkIngestResponse(ingested=len(batch_txns), flags_created=len(stat_flags) + len(rule_flags))


@router.get("/anomaly-flags", response_model=AnomalyFlagListResponse)
async def list_anomaly_flags(
    limit: int = 50,
    offset: int = 0,
    status: AnomalyFlagStatus | None = None,
    flag_type: AnomalyFlagType | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = AnomalyFlagRepository(db)
    items, total = await repo.list_flags(
        limit=limit, offset=offset, status=status, flag_type=flag_type
    )
    return AnomalyFlagListResponse(items=items, total=total)


@router.patch("/anomaly-flags/{flag_id}", response_model=AnomalyFlagRead)
async def review_anomaly_flag(
    flag_id: UUID,
    payload: AnomalyFlagUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = AnomalyFlagRepository(db)
    flag = await repo.get_by_id(flag_id)
    if flag is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flag not found")
    return await repo.review_flag(flag, payload)

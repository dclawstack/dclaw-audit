from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.risk_item import RiskItemStatus
from app.repositories.audit_engagement_repository import AuditEngagementRepository
from app.repositories.risk_item_repository import RiskItemRepository
from app.schemas.risk_item import RiskItemCreate, RiskItemListResponse, RiskItemRead, RiskItemUpdate

router = APIRouter()


@router.get("/risk-items", response_model=RiskItemListResponse)
async def list_risk_items(
    limit: int = 20,
    offset: int = 0,
    engagement_id: UUID | None = None,
    status: RiskItemStatus | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = RiskItemRepository(db)
    items, total = await repo.list_risk_items(
        limit=limit, offset=offset, engagement_id=engagement_id, status=status
    )
    return RiskItemListResponse(items=items, total=total)


@router.post("/risk-items", response_model=RiskItemRead, status_code=status.HTTP_201_CREATED)
async def create_risk_item(
    payload: RiskItemCreate,
    db: AsyncSession = Depends(get_db),
):
    eng_repo = AuditEngagementRepository(db)
    if await eng_repo.get_by_id(payload.engagement_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")
    repo = RiskItemRepository(db)
    return await repo.create_risk_item(payload)


@router.get("/risk-items/{item_id}", response_model=RiskItemRead)
async def get_risk_item(item_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = RiskItemRepository(db)
    item = await repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk item not found")
    return item


@router.patch("/risk-items/{item_id}", response_model=RiskItemRead)
async def update_risk_item(
    item_id: UUID,
    payload: RiskItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = RiskItemRepository(db)
    item = await repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk item not found")
    return await repo.update_risk_item(item, payload)


@router.delete("/risk-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_risk_item(item_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = RiskItemRepository(db)
    item = await repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk item not found")
    await repo.delete(item)

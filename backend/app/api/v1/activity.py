from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.activity_event_repository import ActivityEventRepository
from app.schemas.activity_event import ActivityEventCreate, ActivityEventListResponse, ActivityEventRead

router = APIRouter()


@router.get("/activity-events", response_model=ActivityEventListResponse)
async def list_activity_events(
    limit: int = 50,
    offset: int = 0,
    engagement_id: UUID | None = None,
    entity_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = ActivityEventRepository(db)
    items, total = await repo.list_events(
        limit=limit, offset=offset, engagement_id=engagement_id, entity_type=entity_type
    )
    return ActivityEventListResponse(items=items, total=total)


@router.post("/activity-events", response_model=ActivityEventRead)
async def create_activity_event(
    payload: ActivityEventCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = ActivityEventRepository(db)
    return await repo.log(payload)

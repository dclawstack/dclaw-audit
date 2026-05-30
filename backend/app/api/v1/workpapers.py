from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.workpaper import WorkpaperStatus
from app.repositories.workpaper_repository import WorkpaperRepository
from app.schemas.workpaper import WorkpaperCreate, WorkpaperListResponse, WorkpaperRead, WorkpaperUpdate

router = APIRouter()


@router.get("/workpapers", response_model=WorkpaperListResponse)
async def list_workpapers(
    engagement_id: UUID | None = Query(None),
    status: WorkpaperStatus | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = WorkpaperRepository(db)
    items, total = await repo.list_workpapers(limit=limit, offset=offset, engagement_id=engagement_id, status=status)
    return WorkpaperListResponse(items=items, total=total)


@router.post("/workpapers", response_model=WorkpaperRead, status_code=status.HTTP_201_CREATED)
async def create_workpaper(payload: WorkpaperCreate, db: AsyncSession = Depends(get_db)):
    repo = WorkpaperRepository(db)
    return await repo.create_workpaper(payload)


@router.get("/workpapers/{workpaper_id}", response_model=WorkpaperRead)
async def get_workpaper(workpaper_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = WorkpaperRepository(db)
    wp = await repo.get_by_id(workpaper_id)
    if wp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workpaper not found")
    return wp


@router.patch("/workpapers/{workpaper_id}", response_model=WorkpaperRead)
async def update_workpaper(workpaper_id: UUID, payload: WorkpaperUpdate, db: AsyncSession = Depends(get_db)):
    repo = WorkpaperRepository(db)
    wp = await repo.get_by_id(workpaper_id)
    if wp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workpaper not found")
    return await repo.update_workpaper(wp, payload)


@router.delete("/workpapers/{workpaper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workpaper(workpaper_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = WorkpaperRepository(db)
    wp = await repo.get_by_id(workpaper_id)
    if wp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workpaper not found")
    await repo.delete(wp)

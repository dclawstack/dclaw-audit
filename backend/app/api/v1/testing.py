from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.control_test import ControlTestStatus
from app.repositories.audit_engagement_repository import AuditEngagementRepository
from app.repositories.control_test_repository import ControlTestRepository, ControlTestSampleRepository
from app.schemas.control_test import (
    ControlTestCreate,
    ControlTestListResponse,
    ControlTestRead,
    ControlTestSampleCreate,
    ControlTestSampleRead,
    ControlTestUpdate,
)

router = APIRouter()


@router.get("/control-tests", response_model=ControlTestListResponse)
async def list_control_tests(
    limit: int = 20,
    offset: int = 0,
    engagement_id: UUID | None = None,
    control_id: UUID | None = None,
    status: ControlTestStatus | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = ControlTestRepository(db)
    items, total = await repo.list_tests(
        limit=limit, offset=offset, engagement_id=engagement_id,
        control_id=control_id, status=status
    )
    return ControlTestListResponse(items=items, total=total)


@router.post("/control-tests", response_model=ControlTestRead, status_code=status.HTTP_201_CREATED)
async def create_control_test(
    payload: ControlTestCreate,
    db: AsyncSession = Depends(get_db),
):
    eng_repo = AuditEngagementRepository(db)
    if await eng_repo.get_by_id(payload.engagement_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")
    repo = ControlTestRepository(db)
    return await repo.create_test(payload)


@router.get("/control-tests/{test_id}", response_model=ControlTestRead)
async def get_control_test(test_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ControlTestRepository(db)
    test = await repo.get_by_id(test_id)
    if test is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control test not found")
    return test


@router.patch("/control-tests/{test_id}", response_model=ControlTestRead)
async def update_control_test(
    test_id: UUID,
    payload: ControlTestUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = ControlTestRepository(db)
    test = await repo.get_by_id(test_id)
    if test is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control test not found")
    return await repo.update_test(test, payload)


@router.delete("/control-tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_control_test(test_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ControlTestRepository(db)
    test = await repo.get_by_id(test_id)
    if test is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control test not found")
    await repo.delete(test)


@router.get("/control-tests/{test_id}/samples", response_model=list[ControlTestSampleRead])
async def list_test_samples(test_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ControlTestSampleRepository(db)
    samples, _ = await repo.list_samples(test_id)
    return samples


@router.post(
    "/control-tests/{test_id}/samples",
    response_model=ControlTestSampleRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_test_sample(
    test_id: UUID,
    payload: ControlTestSampleCreate,
    db: AsyncSession = Depends(get_db),
):
    test_repo = ControlTestRepository(db)
    if await test_repo.get_by_id(test_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control test not found")
    sample_repo = ControlTestSampleRepository(db)
    return await sample_repo.create_sample(ControlTestSampleCreate(test_id=test_id, **payload.model_dump(exclude={"test_id"})))

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.remediation_plan import RemediationStatus
from app.repositories.remediation_plan_repository import RemediationPlanRepository
from app.schemas.remediation_plan import (
    RemediationPlanCreate,
    RemediationPlanListResponse,
    RemediationPlanRead,
    RemediationPlanUpdate,
)
from app.services.ai_service import AIService, AIServiceError

router = APIRouter()


@router.get("/remediation-plans", response_model=RemediationPlanListResponse)
async def list_remediation_plans(
    engagement_id: UUID | None = Query(None),
    finding_id: UUID | None = Query(None),
    status: RemediationStatus | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = RemediationPlanRepository(db)
    items, total = await repo.list_plans(
        limit=limit, offset=offset, engagement_id=engagement_id, finding_id=finding_id, status=status
    )
    return RemediationPlanListResponse(items=items, total=total)


@router.post("/remediation-plans", response_model=RemediationPlanRead, status_code=status.HTTP_201_CREATED)
async def create_remediation_plan(payload: RemediationPlanCreate, db: AsyncSession = Depends(get_db)):
    repo = RemediationPlanRepository(db)
    return await repo.create_plan(payload)


@router.post("/remediation-plans/ai-generate", response_model=RemediationPlanRead, status_code=status.HTTP_201_CREATED)
async def ai_generate_remediation_plan(
    finding_id: UUID = Query(...),
    engagement_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Use AI to generate a remediation plan for a finding."""
    svc = AIService()
    try:
        result = await svc.generate_remediation_plan(db, finding_id=finding_id, engagement_id=engagement_id)
    except AIServiceError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    from app.schemas.remediation_plan import RemediationPlanCreate
    payload = RemediationPlanCreate(
        finding_id=finding_id,
        engagement_id=engagement_id,
        title=result.get("title", "AI-Generated Remediation Plan"),
        action_items=result.get("action_items", ""),
        owner_name=result.get("owner_name"),
        notes=result.get("notes"),
        ai_generated=True,
    )
    repo = RemediationPlanRepository(db)
    return await repo.create_plan(payload)


@router.get("/remediation-plans/{plan_id}", response_model=RemediationPlanRead)
async def get_remediation_plan(plan_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = RemediationPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Remediation plan not found")
    return plan


@router.patch("/remediation-plans/{plan_id}", response_model=RemediationPlanRead)
async def update_remediation_plan(plan_id: UUID, payload: RemediationPlanUpdate, db: AsyncSession = Depends(get_db)):
    repo = RemediationPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Remediation plan not found")
    return await repo.update_plan(plan, payload)


@router.delete("/remediation-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_remediation_plan(plan_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = RemediationPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Remediation plan not found")
    await repo.delete(plan)

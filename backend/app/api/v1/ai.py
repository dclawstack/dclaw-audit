from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.ai_service import AIService, AIServiceError

router = APIRouter()


class AIRunRequest(BaseModel):
    engagement_id: UUID
    provider: str | None = "openrouter"


class DraftEvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    evidence_requests: list[dict]


class RiskCopilotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    risks: list[str]
    controls: list[str]
    test_ideas: list[str]


class DraftFindingRequest(BaseModel):
    engagement_id: UUID
    observation: str
    provider: str | None = "openrouter"


class DraftFindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    description: str
    root_cause: str
    recommendation: str
    severity: str


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    executive_summary: str
    key_observations: list[str]
    overall_risk_rating: str


@router.post("/ai/draft-evidence", response_model=DraftEvidenceResponse)
async def ai_draft_evidence_requests(
    payload: AIRunRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.draft_evidence_requests(db, payload.engagement_id)
        return DraftEvidenceResponse(evidence_requests=result)
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/ai/risk-copilot", response_model=RiskCopilotResponse)
async def ai_risk_copilot(
    payload: AIRunRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.risk_copilot(db, payload.engagement_id)
        return RiskCopilotResponse(
            risks=result.get("risks", []),
            controls=result.get("controls", []),
            test_ideas=result.get("test_ideas", []),
        )
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/ai/draft-finding", response_model=DraftFindingResponse)
async def ai_draft_finding(
    payload: DraftFindingRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.draft_finding(db, payload.engagement_id, payload.observation)
        return DraftFindingResponse(
            title=result.get("title", ""),
            description=result.get("description", ""),
            root_cause=result.get("root_cause", ""),
            recommendation=result.get("recommendation", ""),
            severity=result.get("severity", "medium"),
        )
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/ai/generate-report", response_model=ReportResponse)
async def ai_generate_report(
    payload: AIRunRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.generate_report(db, payload.engagement_id)
        return ReportResponse(
            executive_summary=result.get("executive_summary", ""),
            key_observations=result.get("key_observations", []),
            overall_risk_rating=result.get("overall_risk_rating", ""),
        )
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

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


class EvidenceCompletenessResponse(BaseModel):
    completeness_score: int
    missing_areas: list[str]
    recommendations: list[str]
    overall_assessment: str


class PrioritizeFindingsResponse(BaseModel):
    prioritized_findings: list[dict]
    critical_path: list[str]
    summary: str


class RemediationPlanAIResponse(BaseModel):
    title: str
    action_items: str
    owner_name: str | None
    estimated_days: int | None
    notes: str | None


class RemediationPlanAIRequest(BaseModel):
    finding_id: UUID
    engagement_id: UUID
    provider: str | None = "openrouter"


@router.post("/ai/check-evidence-completeness", response_model=EvidenceCompletenessResponse)
async def ai_check_evidence_completeness(
    payload: AIRunRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.check_evidence_completeness(db, payload.engagement_id)
        return EvidenceCompletenessResponse(
            completeness_score=result.get("completeness_score", 0),
            missing_areas=result.get("missing_areas", []),
            recommendations=result.get("recommendations", []),
            overall_assessment=result.get("overall_assessment", ""),
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.post("/ai/prioritize-findings", response_model=PrioritizeFindingsResponse)
async def ai_prioritize_findings(
    payload: AIRunRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.prioritize_findings(db, payload.engagement_id)
        return PrioritizeFindingsResponse(
            prioritized_findings=result.get("prioritized_findings", []),
            critical_path=result.get("critical_path", []),
            summary=result.get("summary", ""),
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.post("/ai/generate-remediation-plan", response_model=RemediationPlanAIResponse)
async def ai_generate_remediation_plan(
    payload: RemediationPlanAIRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = AIService(provider=payload.provider or "openrouter")
        result = await service.generate_remediation_plan(db, payload.finding_id, payload.engagement_id)
        return RemediationPlanAIResponse(
            title=result.get("title", "Remediation Plan"),
            action_items=result.get("action_items", ""),
            owner_name=result.get("owner_name"),
            estimated_days=result.get("estimated_days"),
            notes=result.get("notes"),
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

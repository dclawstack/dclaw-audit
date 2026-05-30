import os
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.evidence_file_repository import EvidenceFileRepository
from app.schemas.evidence_file import EvidenceFileRead

from app.core.database import get_db
from app.models.control import FrameworkName
from app.models.finding import FindingSeverity, FindingStatus
from app.repositories.audit_engagement_repository import AuditEngagementRepository
from app.repositories.control_repository import (
    ControlMappingRepository,
    ControlRepository,
    FrameworkRequirementRepository,
)
from app.repositories.evidence_request_repository import EvidenceRequestRepository
from app.repositories.evidence_version_log_repository import EvidenceVersionLogRepository
from app.repositories.finding_repository import FindingRepository
from app.schemas.audit_engagement import (
    AuditDashboardSummary,
    AuditEngagementCreate,
    AuditEngagementListResponse,
    AuditEngagementRead,
)
from app.schemas.control import (
    ControlCreate,
    ControlListResponse,
    ControlMappingCreate,
    ControlMappingListResponse,
    ControlMappingRead,
    ControlRead,
    ControlWithMappingsRead,
    FrameworkRequirementCreate,
    FrameworkRequirementListResponse,
    FrameworkRequirementRead,
    FrameworkRequirementWithMappingsRead,
    GapAnalysisItem,
)
from app.schemas.evidence_request import (
    EvidenceRequestCreate,
    EvidenceRequestListResponse,
    EvidenceRequestRead,
)
from app.schemas.evidence_version_log import (
    EvidenceVersionLogCreate,
    EvidenceVersionLogListResponse,
    EvidenceVersionLogRead,
)
from app.schemas.finding import FindingCreate, FindingListResponse, FindingRead, FindingUpdate

router = APIRouter()


@router.get("/engagements", response_model=AuditEngagementListResponse)
async def list_engagements(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repository = AuditEngagementRepository(db)
    items, total = await repository.list_all(limit=limit, offset=offset)
    return AuditEngagementListResponse(items=items, total=total)


@router.post(
    "/engagements",
    response_model=AuditEngagementRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_engagement(
    payload: AuditEngagementCreate,
    db: AsyncSession = Depends(get_db),
):
    repository = AuditEngagementRepository(db)
    return await repository.create_engagement(payload)


@router.get("/engagements/{engagement_id}", response_model=AuditEngagementRead)
async def get_engagement(
    engagement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = AuditEngagementRepository(db)
    engagement = await repository.get_by_id(engagement_id)
    if engagement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")
    return engagement


@router.delete("/engagements/{engagement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_engagement(
    engagement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = AuditEngagementRepository(db)
    engagement = await repository.get_by_id(engagement_id)
    if engagement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")
    await repository.delete(engagement)


@router.get("/evidence-requests", response_model=EvidenceRequestListResponse)
async def list_evidence_requests(
    limit: int = 20,
    offset: int = 0,
    engagement_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = EvidenceRequestRepository(db)
    items, total = await repository.list_requests(
        limit=limit,
        offset=offset,
        engagement_id=engagement_id,
    )
    return EvidenceRequestListResponse(items=items, total=total)


@router.post(
    "/evidence-requests",
    response_model=EvidenceRequestRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_evidence_request(
    payload: EvidenceRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    engagement_repository = AuditEngagementRepository(db)
    engagement = await engagement_repository.get_by_id(payload.engagement_id)
    if engagement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")

    repository = EvidenceRequestRepository(db)
    evidence_request = await repository.create_request(payload)

    log_repository = EvidenceVersionLogRepository(db)
    await log_repository.auto_log_created(
        evidence_request_id=evidence_request.id,
        actor_name=payload.request_owner,
    )
    return evidence_request


@router.get("/evidence-requests/{request_id}", response_model=EvidenceRequestRead)
async def get_evidence_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = EvidenceRequestRepository(db)
    evidence_request = await repository.get_by_id(request_id)
    if evidence_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence request not found")
    return evidence_request


@router.delete("/evidence-requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evidence_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = EvidenceRequestRepository(db)
    evidence_request = await repository.get_by_id(request_id)
    if evidence_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence request not found")
    await repository.delete(evidence_request)


# Evidence Version Log

@router.get(
    "/evidence-requests/{request_id}/version-log",
    response_model=EvidenceVersionLogListResponse,
)
async def list_evidence_version_logs(
    request_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repository = EvidenceVersionLogRepository(db)
    items, total = await repository.list_logs(
        evidence_request_id=request_id,
        limit=limit,
        offset=offset,
    )
    return EvidenceVersionLogListResponse(items=items, total=total)


@router.post(
    "/evidence-requests/{request_id}/version-log",
    response_model=EvidenceVersionLogRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_evidence_version_log(
    request_id: UUID,
    payload: EvidenceVersionLogCreate,
    db: AsyncSession = Depends(get_db),
):
    evidence_repository = EvidenceRequestRepository(db)
    evidence_request = await evidence_repository.get_by_id(request_id)
    if evidence_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence request not found")

    repository = EvidenceVersionLogRepository(db)
    log = EvidenceVersionLogCreate(
        evidence_request_id=request_id,
        action=payload.action,
        previous_value=payload.previous_value,
        new_value=payload.new_value,
        actor_name=payload.actor_name,
        note=payload.note,
    )
    return await repository.create_log(log)


@router.get("/findings", response_model=FindingListResponse)
async def list_findings(
    limit: int = 20,
    offset: int = 0,
    engagement_id: UUID | None = None,
    finding_status: FindingStatus | None = None,
    finding_severity: FindingSeverity | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = FindingRepository(db)
    items, total = await repository.list_findings(
        limit=limit,
        offset=offset,
        engagement_id=engagement_id,
        status=finding_status,
        severity=finding_severity,
    )
    return FindingListResponse(items=items, total=total)


@router.post(
    "/findings",
    response_model=FindingRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_finding(
    payload: FindingCreate,
    db: AsyncSession = Depends(get_db),
):
    engagement_repository = AuditEngagementRepository(db)
    engagement = await engagement_repository.get_by_id(payload.engagement_id)
    if engagement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")

    repository = FindingRepository(db)
    return await repository.create_finding(payload)


@router.get("/findings/{finding_id}", response_model=FindingRead)
async def get_finding(
    finding_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = FindingRepository(db)
    finding = await repository.get_by_id(finding_id)
    if finding is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
    return finding


@router.patch("/findings/{finding_id}", response_model=FindingRead)
async def update_finding(
    finding_id: UUID,
    payload: FindingUpdate,
    db: AsyncSession = Depends(get_db),
):
    repository = FindingRepository(db)
    finding = await repository.get_by_id(finding_id)
    if finding is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

    # Capture previous status if it's being changed
    previous_status = None
    if payload.status is not None and payload.status != finding.status:
        previous_status = finding.status.value

    updated = await repository.update_finding(finding, payload)

    # Auto-log status change on the engagement evidence story
    if previous_status is not None:
        # Find or create a master evidence request for this engagement to log against
        # For now, we log against the most recent evidence request in the engagement
        evidence_repo = EvidenceRequestRepository(db)
        requests, _ = await evidence_repo.list_requests(
            limit=1, engagement_id=updated.engagement_id
        )
        if requests:
            log_repo = EvidenceVersionLogRepository(db)
            await log_repo.auto_log_status_change(
                evidence_request_id=requests[0].id,
                previous_status=previous_status,
                new_status=updated.status.value,
                actor_name=payload.owner_name or updated.owner_name,
            )

    return updated


@router.delete("/findings/{finding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_finding(
    finding_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = FindingRepository(db)
    finding = await repository.get_by_id(finding_id)
    if finding is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
    await repository.delete(finding)


# Controls & Framework Mapping

@router.get("/controls", response_model=ControlListResponse)
async def list_controls(
    limit: int = 20,
    offset: int = 0,
    framework: FrameworkName | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlRepository(db)
    items, total = await repository.list_controls(
        limit=limit, offset=offset, framework=framework.value if framework else None
    )
    return ControlListResponse(items=items, total=total)


@router.post(
    "/controls",
    response_model=ControlRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_control(
    payload: ControlCreate,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlRepository(db)
    return await repository.create_control(payload)


@router.get("/controls/gap-analysis", response_model=list[GapAnalysisItem])
async def get_gap_analysis(
    framework: FrameworkName | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlMappingRepository(db)
    gaps = await repository.get_gap_analysis(
        framework=framework.value if framework else None
    )
    return [
        GapAnalysisItem(
            framework_requirement=gap["framework_requirement"],
            mapped_controls=gap["mapped_controls"],
            coverage_status=gap["coverage_status"],
        )
        for gap in gaps
    ]


@router.get("/controls/{control_id}", response_model=ControlRead)
async def get_control(
    control_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlRepository(db)
    control = await repository.get_by_id(control_id)
    if control is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control not found")
    return control


@router.get("/controls/{control_id}/with-mappings", response_model=ControlWithMappingsRead)
async def get_control_with_mappings(
    control_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlRepository(db)
    control = await repository.get_by_id(control_id)
    if control is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control not found")
    return control


@router.delete("/controls/{control_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_control(
    control_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlRepository(db)
    control = await repository.get_by_id(control_id)
    if control is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control not found")
    await repository.delete(control)


@router.get("/framework-requirements", response_model=FrameworkRequirementListResponse)
async def list_framework_requirements(
    limit: int = 20,
    offset: int = 0,
    framework: FrameworkName | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = FrameworkRequirementRepository(db)
    items, total = await repository.list_requirements(
        limit=limit, offset=offset, framework=framework.value if framework else None
    )
    return FrameworkRequirementListResponse(items=items, total=total)


@router.post(
    "/framework-requirements",
    response_model=FrameworkRequirementRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_framework_requirement(
    payload: FrameworkRequirementCreate,
    db: AsyncSession = Depends(get_db),
):
    repository = FrameworkRequirementRepository(db)
    return await repository.create_requirement(payload)


@router.get("/framework-requirements/{requirement_id}", response_model=FrameworkRequirementRead)
async def get_framework_requirement(
    requirement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = FrameworkRequirementRepository(db)
    requirement = await repository.get_by_id(requirement_id)
    if requirement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    return requirement


@router.get(
    "/framework-requirements/{requirement_id}/with-mappings",
    response_model=FrameworkRequirementWithMappingsRead,
)
async def get_framework_requirement_with_mappings(
    requirement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = FrameworkRequirementRepository(db)
    requirement = await repository.get_by_id(requirement_id)
    if requirement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    return requirement


@router.delete("/framework-requirements/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_framework_requirement(
    requirement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = FrameworkRequirementRepository(db)
    requirement = await repository.get_by_id(requirement_id)
    if requirement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    await repository.delete(requirement)


@router.get("/control-mappings", response_model=ControlMappingListResponse)
async def list_control_mappings(
    limit: int = 20,
    offset: int = 0,
    control_id: UUID | None = None,
    framework_requirement_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlMappingRepository(db)
    items, total = await repository.list_mappings(
        limit=limit,
        offset=offset,
        control_id=control_id,
        framework_requirement_id=framework_requirement_id,
    )
    return ControlMappingListResponse(items=items, total=total)


@router.post(
    "/control-mappings",
    response_model=ControlMappingRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_control_mapping(
    payload: ControlMappingCreate,
    db: AsyncSession = Depends(get_db),
):
    control_repository = ControlRepository(db)
    control = await control_repository.get_by_id(payload.control_id)
    if control is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Control not found")

    requirement_repository = FrameworkRequirementRepository(db)
    requirement = await requirement_repository.get_by_id(payload.framework_requirement_id)
    if requirement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Framework requirement not found"
        )

    repository = ControlMappingRepository(db)
    return await repository.create_mapping(payload)


@router.get("/control-mappings/{mapping_id}", response_model=ControlMappingRead)
async def get_control_mapping(
    mapping_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlMappingRepository(db)
    mapping = await repository.get_by_id(mapping_id)
    if mapping is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mapping not found")
    return mapping


@router.delete("/control-mappings/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_control_mapping(
    mapping_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ControlMappingRepository(db)
    mapping = await repository.get_by_id(mapping_id)
    if mapping is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mapping not found")
    await repository.delete(mapping)


@router.get("/dashboard/summary", response_model=AuditDashboardSummary)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    repository = AuditEngagementRepository(db)
    return await repository.get_dashboard_summary()


# ── Evidence File Upload ──────────────────────────────────────────────────────

@router.get("/evidence-files", response_model=list[EvidenceFileRead])
async def list_evidence_files(
    request_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    repo = EvidenceFileRepository(db)
    return await repo.list_by_request(request_id)


@router.post("/evidence-files/upload", response_model=EvidenceFileRead, status_code=status.HTTP_201_CREATED)
async def upload_evidence_file(
    request_id: UUID = Form(...),
    uploaded_by: str | None = Form(None),
    notes: str | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    os.makedirs(settings.upload_dir, exist_ok=True)
    safe_name = os.path.basename(file.filename or "upload")
    dest = os.path.join(settings.upload_dir, f"{request_id}_{safe_name}")
    content = await file.read()
    if len(content) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
    with open(dest, "wb") as f_out:
        f_out.write(content)
    repo = EvidenceFileRepository(db)
    return await repo.create_file(
        request_id=request_id,
        filename=safe_name,
        content_type=file.content_type,
        file_size=len(content),
        storage_path=dest,
        uploaded_by=uploaded_by,
        notes=notes,
    )


@router.delete("/evidence-files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evidence_file(file_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = EvidenceFileRepository(db)
    ef = await repo.get_by_id(file_id)
    if ef is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence file not found")
    if ef.storage_path and os.path.exists(ef.storage_path):
        os.remove(ef.storage_path)
    await repo.delete(ef)

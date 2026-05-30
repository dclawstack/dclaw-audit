from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.audit_engagement_repository import AuditEngagementRepository
from app.repositories.report_repository import ReportTemplateRepository, SavedReportRepository
from app.schemas.report import (
    ReportTemplateCreate,
    ReportTemplateListResponse,
    ReportTemplateRead,
    SavedReportCreate,
    SavedReportListResponse,
    SavedReportRead,
    SavedReportUpdate,
    SavedReportWithTemplateRead,
    ReportGenerateRequest,
)
from app.services.ai_service import AIService, AIServiceError

router = APIRouter()


@router.get("/report-templates", response_model=ReportTemplateListResponse)
async def list_report_templates(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repository = ReportTemplateRepository(db)
    items, total = await repository.list_templates(limit=limit, offset=offset)
    return ReportTemplateListResponse(items=items, total=total)


@router.post(
    "/report-templates",
    response_model=ReportTemplateRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_report_template(
    payload: ReportTemplateCreate,
    db: AsyncSession = Depends(get_db),
):
    repository = ReportTemplateRepository(db)
    return await repository.create_template(payload)


@router.get("/report-templates/{template_id}", response_model=ReportTemplateRead)
async def get_report_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ReportTemplateRepository(db)
    template = await repository.get_by_id(template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template


@router.delete("/report-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ReportTemplateRepository(db)
    template = await repository.get_by_id(template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    await repository.delete(template)


# Saved Reports

@router.get("/saved-reports", response_model=SavedReportListResponse)
async def list_saved_reports(
    limit: int = 20,
    offset: int = 0,
    engagement_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    repository = SavedReportRepository(db)
    items, total = await repository.list_reports(
        limit=limit, offset=offset, engagement_id=engagement_id
    )
    return SavedReportListResponse(items=items, total=total)


@router.post(
    "/saved-reports",
    response_model=SavedReportRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_saved_report(
    payload: SavedReportCreate,
    db: AsyncSession = Depends(get_db),
):
    engagement_repository = AuditEngagementRepository(db)
    engagement = await engagement_repository.get_by_id(payload.engagement_id)
    if engagement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")

    template_repository = ReportTemplateRepository(db)
    template = await template_repository.get_by_id(payload.template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    repository = SavedReportRepository(db)
    return await repository.create_saved_report(payload)


@router.get("/saved-reports/{report_id}", response_model=SavedReportWithTemplateRead)
async def get_saved_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = SavedReportRepository(db)
    report = await repository.get_by_id(report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.patch("/saved-reports/{report_id}", response_model=SavedReportRead)
async def update_saved_report(
    report_id: UUID,
    payload: SavedReportUpdate,
    db: AsyncSession = Depends(get_db),
):
    repository = SavedReportRepository(db)
    report = await repository.get_by_id(report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return await repository.update_report(report, payload)


@router.delete("/saved-reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = SavedReportRepository(db)
    report = await repository.get_by_id(report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    await repository.delete(report)


@router.post("/saved-reports/generate", response_model=SavedReportRead)
async def generate_report_from_template(
    payload: ReportGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    engagement_repository = AuditEngagementRepository(db)
    engagement = await engagement_repository.get_by_id(payload.engagement_id)
    if engagement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")

    template_repository = ReportTemplateRepository(db)
    template = await template_repository.get_by_id(payload.template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    repository = SavedReportRepository(db)
    report = await repository.create_saved_report(
        SavedReportCreate(
            engagement_id=payload.engagement_id,
            template_id=payload.template_id,
            title=payload.title,
        )
    )

    try:
        service = AIService(provider=payload.provider or "openrouter")
        ai_result = await service.generate_report(db, payload.engagement_id)
        report.sections = {
            "executive_summary": ai_result.get("executive_summary", ""),
            "key_observations": "\n".join(ai_result.get("key_observations", [])),
        }
        report.generated_summary = ai_result.get("overall_risk_rating", "")
        report.status = "completed"
        await repository.update(report, {
            "sections": report.sections,
            "generated_summary": report.generated_summary,
            "status": report.status,
        })
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return report


@router.get("/saved-reports/{report_id}/export", response_class=HTMLResponse)
async def export_report_html(report_id: UUID, db: AsyncSession = Depends(get_db)):
    """Return a board-ready HTML export of a saved report."""
    repo = SavedReportRepository(db)
    report = await repo.get_by_id(report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    engagement_repo = AuditEngagementRepository(db)
    engagement = await engagement_repo.get_by_id(report.engagement_id)
    eng_title = engagement.title if engagement else str(report.engagement_id)
    eng_client = engagement.client_name if engagement else ""

    sections_html = ""
    for section_name, content in (report.sections or {}).items():
        heading = section_name.replace("_", " ").title()
        body = str(content).replace("\n", "<br>")
        sections_html += f"<section><h2>{heading}</h2><p>{body}</p></section>"

    generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{report.title} — DClaw Audit</title>
<style>
  body {{ font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; color: #1f2937; }}
  header {{ border-bottom: 3px solid #1f2937; padding-bottom: 16px; margin-bottom: 32px; }}
  h1 {{ font-size: 1.8rem; margin: 0 0 4px; }}
  .meta {{ color: #6b7280; font-size: 0.9rem; }}
  section {{ margin-bottom: 32px; }}
  h2 {{ font-size: 1.2rem; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }}
  .badge {{ display: inline-block; background: #1f2937; color: white; border-radius: 4px;
            padding: 2px 10px; font-size: 0.8rem; margin-top: 8px; }}
  footer {{ border-top: 1px solid #e5e7eb; margin-top: 48px; padding-top: 12px;
            color: #9ca3af; font-size: 0.8rem; }}
</style>
</head>
<body>
<header>
  <h1>{report.title}</h1>
  <div class="meta">Engagement: <strong>{eng_title}</strong> &nbsp;|&nbsp; Client: {eng_client}</div>
  <div class="meta">Status: <span class="badge">{report.status}</span></div>
  {f'<div class="meta">Overall Risk Rating: <strong>{report.generated_summary}</strong></div>' if report.generated_summary else ''}
</header>
{sections_html if sections_html else '<p><em>No sections generated yet.</em></p>'}
<footer>Generated by DClaw Audit &nbsp;|&nbsp; {generated_at}</footer>
</body>
</html>"""
    return HTMLResponse(content=html, headers={"Content-Disposition": f'attachment; filename="report-{report_id}.html"'})

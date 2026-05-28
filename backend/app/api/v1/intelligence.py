"""Audit Intelligence Layer (v1.3 §2.5) — analytics derived from existing data."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.audit_engagement import AuditEngagement
from app.models.control_test import ControlTest, ControlTestResult, ControlTestStatus
from app.models.evidence_request import EvidenceRequest
from app.models.finding import Finding, FindingStatus

router = APIRouter()


class RecurringControlFailure(BaseModel):
    control_id: str | None
    control_title: str
    total_tests: int
    failed_tests: int
    failure_rate: float


class OwnerResponsiveness(BaseModel):
    owner_name: str
    total_requests: int
    overdue_requests: int
    avg_days_open: float
    responsiveness_score: float


class CycleTimeBenchmark(BaseModel):
    engagement_id: str
    title: str
    status: str
    days_open: int
    findings_count: int
    open_findings: int


class IntelligenceSummary(BaseModel):
    recurring_control_failures: list[RecurringControlFailure]
    owner_responsiveness: list[OwnerResponsiveness]
    cycle_time_benchmarks: list[CycleTimeBenchmark]
    total_open_engagements: int
    avg_finding_age_days: float
    high_risk_engagement_count: int
    findings_trend_30d: int
    findings_trend_60d: int


@router.get("/intelligence/summary", response_model=IntelligenceSummary)
async def get_intelligence_summary(db: AsyncSession = Depends(get_db)):
    # Recurring control failures — fetch all completed tests and aggregate in Python
    all_test_rows = await db.execute(
        select(ControlTest).where(ControlTest.status == ControlTestStatus.completed)
    )
    all_tests = list(all_test_rows.scalars().all())
    test_groups: dict[tuple, dict] = {}
    for t in all_tests:
        key = (str(t.control_id) if t.control_id else None, t.title)
        if key not in test_groups:
            test_groups[key] = {"total": 0, "fails": 0}
        test_groups[key]["total"] += 1
        if t.overall_result == ControlTestResult.fail:
            test_groups[key]["fails"] += 1

    control_failures = []
    for (ctrl_id, title), counts in test_groups.items():
        total = counts["total"]
        fails = counts["fails"]
        rate = fails / total if total > 0 else 0.0
        if rate > 0:
            control_failures.append(
                RecurringControlFailure(
                    control_id=ctrl_id,
                    control_title=title,
                    total_tests=total,
                    failed_tests=fails,
                    failure_rate=round(rate, 3),
                )
            )
    control_failures.sort(key=lambda x: x.failure_rate, reverse=True)

    # Owner responsiveness (evidence request owners)
    request_rows = await db.execute(select(EvidenceRequest))
    all_requests = list(request_rows.scalars().all())
    owner_map: dict[str, dict] = {}
    today = date.today()
    for req in all_requests:
        owner = req.request_owner or "Unassigned"
        if owner not in owner_map:
            owner_map[owner] = {"total": 0, "overdue": 0, "days_list": []}
        owner_map[owner]["total"] += 1
        age = (today - req.created_at.date()).days
        owner_map[owner]["days_list"].append(age)
        if req.status.value == "overdue":
            owner_map[owner]["overdue"] += 1

    owner_responsiveness = []
    for owner, data in owner_map.items():
        avg_days = sum(data["days_list"]) / len(data["days_list"]) if data["days_list"] else 0
        overdue_rate = data["overdue"] / data["total"] if data["total"] > 0 else 0
        score = round(max(0.0, 1.0 - overdue_rate - (avg_days / 90)), 3)
        owner_responsiveness.append(
            OwnerResponsiveness(
                owner_name=owner,
                total_requests=data["total"],
                overdue_requests=data["overdue"],
                avg_days_open=round(avg_days, 1),
                responsiveness_score=score,
            )
        )
    owner_responsiveness.sort(key=lambda x: x.responsiveness_score)

    # Cycle time benchmarks
    eng_rows = await db.execute(
        select(AuditEngagement).where(
            AuditEngagement.status.in_(["planned", "in_progress", "reporting"])
        )
    )
    engagements = list(eng_rows.scalars().all())
    benchmarks = []
    for eng in engagements:
        days_open = (today - eng.created_at.date()).days
        finding_rows = await db.execute(
            select(func.count()).select_from(Finding).where(Finding.engagement_id == eng.id)
        )
        total_findings = finding_rows.scalar() or 0
        open_finding_rows = await db.execute(
            select(func.count())
            .select_from(Finding)
            .where(
                Finding.engagement_id == eng.id,
                Finding.status != FindingStatus.verified,
            )
        )
        open_findings = open_finding_rows.scalar() or 0
        benchmarks.append(
            CycleTimeBenchmark(
                engagement_id=str(eng.id),
                title=eng.title,
                status=eng.status.value,
                days_open=days_open,
                findings_count=total_findings,
                open_findings=open_findings,
            )
        )
    benchmarks.sort(key=lambda x: x.days_open, reverse=True)

    # Aggregate stats
    open_eng_count = len(engagements)
    high_risk_count_rows = await db.execute(
        select(func.count())
        .select_from(AuditEngagement)
        .where(AuditEngagement.risk_level.in_(["high", "critical"]))
    )
    high_risk_count = high_risk_count_rows.scalar() or 0

    # Finding average age
    active_finding_rows = await db.execute(
        select(Finding).where(Finding.status != FindingStatus.verified)
    )
    active_findings = list(active_finding_rows.scalars().all())
    avg_finding_age = 0.0
    if active_findings:
        ages = [(today - f.created_at.date()).days for f in active_findings]
        avg_finding_age = round(sum(ages) / len(ages), 1)

    # Findings trend
    cutoff_30 = today - timedelta(days=30)
    cutoff_60 = today - timedelta(days=60)
    trend_30_rows = await db.execute(
        select(func.count()).select_from(Finding).where(Finding.created_at >= cutoff_30)
    )
    trend_60_rows = await db.execute(
        select(func.count())
        .select_from(Finding)
        .where(Finding.created_at >= cutoff_60, Finding.created_at < cutoff_30)
    )
    findings_30d = trend_30_rows.scalar() or 0
    findings_60d = trend_60_rows.scalar() or 0

    return IntelligenceSummary(
        recurring_control_failures=control_failures[:10],
        owner_responsiveness=owner_responsiveness[:10],
        cycle_time_benchmarks=benchmarks[:10],
        total_open_engagements=open_eng_count,
        avg_finding_age_days=avg_finding_age,
        high_risk_engagement_count=high_risk_count,
        findings_trend_30d=findings_30d,
        findings_trend_60d=findings_60d,
    )

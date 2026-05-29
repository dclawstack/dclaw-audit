"""Demo seed / reset for the landing page.

Every entity written here is identifiable as demo data:
  • Engagement-scoped rows (findings, evidence requests, risk items, control
    tests, saved reports, signals, anomalies, activity) hang off a single
    DEMO engagement and are removed by deleting that engagement (FK cascade)
    plus the engagement_id-scoped rows that have no FK cascade.
  • Engagement-independent rows (controls, framework requirements, report
    template) carry a stable "DEMO " name prefix used as the delete predicate.

`reset_demo()` only ever deletes rows matching those markers, so flipping the
flag on against a populated instance cannot touch real data.

To REMOVE this feature entirely, delete the 3 things listed at the top of
backend/app/api/v1/demo.py.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.activity_event import ActivityEvent
from app.models.anomaly import AnomalyFlag, AnomalyFlagType, AnomalyTransaction
from app.models.audit_engagement import (
    AuditEngagement,
    EngagementStatus,
    RiskLevel,
)
from app.models.audit_signal import (
    AuditSignal,
    SignalSource,
    SignalStatus,
    SignalType,
)
from app.models.control import Control, FrameworkName
from app.models.control_mapping import ControlMapping, MappingCoverageStatus
from app.models.control_test import (
    ControlTest,
    ControlTestResult,
    ControlTestSample,
    ControlTestStatus,
    ControlTestType,
)
from app.models.evidence_request import EvidenceRequest, EvidenceRequestStatus
from app.models.finding import Finding, FindingSeverity, FindingStatus
from app.models.framework_requirement import FrameworkRequirement
from app.models.report import ReportTemplate, SavedReport, SavedReportStatus
from app.models.risk_item import RiskItem, RiskItemStatus

DEMO_PREFIX = "DEMO "
DEMO_ENGAGEMENT_TITLE = "DEMO SOX Q4 IT General Controls Review"


@dataclass
class DemoCredentials:
    email: str
    password: str
    note: str


@dataclass
class DemoStatus:
    enabled: bool
    seeded: bool
    engagement_id: str | None
    counts: dict[str, int]
    credentials: DemoCredentials | None = None


async def _find_engagement(db: AsyncSession) -> AuditEngagement | None:
    return (
        await db.execute(
            select(AuditEngagement).where(AuditEngagement.title == DEMO_ENGAGEMENT_TITLE)
        )
    ).scalar_one_or_none()


async def gather_status(db: AsyncSession, *, enabled: bool) -> DemoStatus:
    eng = await _find_engagement(db)
    if eng is None:
        return DemoStatus(enabled=enabled, seeded=False, engagement_id=None, counts={})
    counts = {
        "engagements": 1,
        "findings": len(
            (await db.execute(select(Finding.id).where(Finding.engagement_id == eng.id))).all()
        ),
        "evidence_requests": len(
            (
                await db.execute(
                    select(EvidenceRequest.id).where(EvidenceRequest.engagement_id == eng.id)
                )
            ).all()
        ),
        "risk_items": len(
            (await db.execute(select(RiskItem.id).where(RiskItem.engagement_id == eng.id))).all()
        ),
        "controls": len(
            (await db.execute(select(Control.id).where(Control.name.like(f"{DEMO_PREFIX}%")))).all()
        ),
        "control_tests": len(
            (
                await db.execute(
                    select(ControlTest.id).where(ControlTest.engagement_id == eng.id)
                )
            ).all()
        ),
        "signals": len(
            (
                await db.execute(
                    select(AuditSignal.id).where(AuditSignal.engagement_id == eng.id)
                )
            ).all()
        ),
        "anomalies": len(
            (
                await db.execute(
                    select(AnomalyTransaction.id).where(
                        AnomalyTransaction.engagement_id == eng.id
                    )
                )
            ).all()
        ),
    }
    return DemoStatus(
        enabled=enabled, seeded=True, engagement_id=str(eng.id), counts=counts
    )


def _credentials() -> DemoCredentials:
    return DemoCredentials(
        email=settings.demo_owner_email,
        password="(no login required)",
        note="DClaw Audit has no auth gate — open /dashboard directly to explore the seeded engagement.",
    )


async def seed_demo(db: AsyncSession) -> DemoStatus:
    """Idempotent: wipe any existing demo data, then seed a fresh set."""
    await reset_demo(db)
    now = datetime.now(timezone.utc)
    today = now.date()

    # ── Engagement ──────────────────────────────────────────────────────
    eng = AuditEngagement(
        title=DEMO_ENGAGEMENT_TITLE,
        client_name="Acme Financial Holdings",
        status=EngagementStatus.in_progress,
        risk_level=RiskLevel.high,
        owner_name="Avery Morgan",
        description="Annual SOX scoping of IT general controls covering access "
        "management, change management, and backup/recovery.",
        audit_period_start=today - timedelta(days=120),
        audit_period_end=today - timedelta(days=30),
    )
    db.add(eng)
    await db.flush()

    # ── Findings ────────────────────────────────────────────────────────
    db.add_all(
        [
            Finding(
                engagement_id=eng.id,
                title="Privileged access reviews incomplete",
                description="Quarterly privileged access certifications were not "
                "completed for the production ERP for two of three quarters.",
                severity=FindingSeverity.critical,
                status=FindingStatus.open,
                root_cause="HR offboarding is not synchronized with IT access provisioning.",
                recommendation="Implement automated SCIM-based access revocation within "
                "24 hours of termination.",
                remediation_plan="IT to deploy SCIM connector and quarterly recert workflow.",
                owner_name="Jordan Lee",
                due_date=today + timedelta(days=30),
            ),
            Finding(
                engagement_id=eng.id,
                title="Change tickets missing approver evidence",
                description="12% of sampled production changes lacked documented "
                "approval prior to deployment.",
                severity=FindingSeverity.high,
                status=FindingStatus.in_progress,
                root_cause="Emergency change path bypasses standard approval gate.",
                recommendation="Require retroactive approval within 48h for emergency changes.",
                owner_name="Sam Rivera",
                due_date=today + timedelta(days=45),
            ),
            Finding(
                engagement_id=eng.id,
                title="Backup restoration not tested in period",
                description="No evidence of a successful restore test during the audit period.",
                severity=FindingSeverity.medium,
                status=FindingStatus.remediated,
                root_cause="Restore tests scheduled but not executed due to staffing.",
                recommendation="Schedule and document a quarterly restore test.",
                owner_name="Casey Park",
                due_date=today - timedelta(days=5),
            ),
        ]
    )

    # ── Evidence requests ───────────────────────────────────────────────
    db.add_all(
        [
            EvidenceRequest(
                engagement_id=eng.id,
                title="Privileged access report (production ERP)",
                description="Export of all privileged accounts and last review date.",
                request_owner="Avery Morgan",
                due_date=today + timedelta(days=7),
                status=EvidenceRequestStatus.sent,
                source_system="SAP ERP",
            ),
            EvidenceRequest(
                engagement_id=eng.id,
                title="Change management ticket sample",
                description="25 randomly sampled production change tickets with approvals.",
                request_owner="Sam Rivera",
                due_date=today - timedelta(days=2),
                status=EvidenceRequestStatus.overdue,
                source_system="Jira",
            ),
            EvidenceRequest(
                engagement_id=eng.id,
                title="Backup restore test logs",
                description="Logs and sign-off from the most recent restore test.",
                request_owner="Casey Park",
                due_date=today + timedelta(days=14),
                status=EvidenceRequestStatus.received,
                source_system="Veeam",
            ),
        ]
    )

    # ── Risk items ──────────────────────────────────────────────────────
    db.add_all(
        [
            RiskItem(
                engagement_id=eng.id,
                title="Unauthorized access to financial systems",
                description="Stale privileged accounts could enable unauthorized "
                "transactions in the ERP.",
                category="Access Management",
                likelihood=4,
                impact=5,
                risk_score=20.0,
                residual_likelihood=2,
                residual_impact=5,
                residual_score=10.0,
                owner_name="Jordan Lee",
                status=RiskItemStatus.open,
                mitigation_notes="Automated deprovisioning to reduce likelihood.",
            ),
            RiskItem(
                engagement_id=eng.id,
                title="Unapproved production changes",
                description="Changes deployed without approval may introduce errors "
                "to financial reporting.",
                category="Change Management",
                likelihood=3,
                impact=4,
                risk_score=12.0,
                owner_name="Sam Rivera",
                status=RiskItemStatus.mitigated,
                mitigation_notes="Emergency change approval gate added.",
            ),
        ]
    )

    # ── Framework requirements + controls + mappings ────────────────────
    req_access = FrameworkRequirement(
        framework=FrameworkName.sox,
        requirement_code="DEMO ITGC-AC-1",
        title="Logical access is restricted to authorized personnel",
        description="Access to financial systems is granted, reviewed, and revoked appropriately.",
    )
    req_change = FrameworkRequirement(
        framework=FrameworkName.iso_27001,
        requirement_code="DEMO A.12.1.2",
        title="Change management",
        description="Changes to systems are controlled and documented.",
    )
    db.add_all([req_access, req_change])
    await db.flush()

    ctrl_access = Control(
        name="DEMO Quarterly privileged access review",
        description="Privileged access to the ERP is certified each quarter by control owners.",
        framework=FrameworkName.sox,
        control_owner="Jordan Lee",
        frequency="Quarterly",
        automated=False,
    )
    ctrl_change = Control(
        name="DEMO Change approval gate",
        description="Production changes require documented approval before deployment.",
        framework=FrameworkName.iso_27001,
        control_owner="Sam Rivera",
        frequency="Per change",
        automated=True,
    )
    ctrl_backup = Control(
        name="DEMO Backup restore testing",
        description="Backups are restored and validated on a recurring schedule.",
        framework=FrameworkName.nist,
        control_owner="Casey Park",
        frequency="Quarterly",
        automated=False,
    )
    db.add_all([ctrl_access, ctrl_change, ctrl_backup])
    await db.flush()

    db.add_all(
        [
            ControlMapping(
                control_id=ctrl_access.id,
                framework_requirement_id=req_access.id,
                coverage_status=MappingCoverageStatus.full,
                notes="Directly addresses access certification.",
            ),
            ControlMapping(
                control_id=ctrl_change.id,
                framework_requirement_id=req_change.id,
                coverage_status=MappingCoverageStatus.partial,
                notes="Covers approval but not post-deployment review.",
            ),
        ]
    )

    # ── Control tests (with samples) ────────────────────────────────────
    test = ControlTest(
        engagement_id=eng.id,
        control_id=ctrl_change.id,
        title="DEMO Change approval — sample of 25",
        test_type=ControlTestType.sample_based,
        scheduled_date=today - timedelta(days=20),
        completed_date=today - timedelta(days=12),
        status=ControlTestStatus.completed,
        overall_result=ControlTestResult.exception,
        sample_size=25,
        exceptions_found=3,
        test_objective="Verify each production change had documented approval.",
        test_procedure="Inspect ticket approval field for each sampled change.",
        owner_name="Sam Rivera",
        reviewer_name="Avery Morgan",
    )
    test.samples.append(
        ControlTestSample(
            item_reference="CHG-10421",
            item_description="DB index migration",
            result=ControlTestResult.pass_,
        )
    )
    test.samples.append(
        ControlTestSample(
            item_reference="CHG-10455",
            item_description="Emergency hotfix",
            result=ControlTestResult.exception,
            exception_notes="No approver recorded prior to deploy.",
        )
    )
    db.add(test)

    # ── Signals ─────────────────────────────────────────────────────────
    db.add_all(
        [
            AuditSignal(
                signal_source=SignalSource.iam,
                signal_type=SignalType.access_change,
                title="DEMO Terminated user retained ERP admin role",
                description="IAM detected an admin role still active 9 days after termination.",
                entity_ref="user:jsmith",
                severity="high",
                status=SignalStatus.escalated,
                engagement_id=eng.id,
            ),
            AuditSignal(
                signal_source=SignalSource.erp,
                signal_type=SignalType.threshold_breach,
                title="DEMO Manual journal entry above approval threshold",
                description="A $250k manual JE posted without secondary approval.",
                entity_ref="je:2024-0912",
                severity="medium",
                status=SignalStatus.new,
                engagement_id=eng.id,
            ),
        ]
    )

    # ── Anomalies (transaction + flag) ──────────────────────────────────
    txn = AnomalyTransaction(
        engagement_id=eng.id,
        transaction_date=today - timedelta(days=40),
        amount=249500.00,
        description="DEMO Large manual journal entry",
        account_code="6000",
        party_name="Acme Financial Holdings",
        source_system="SAP ERP",
        batch_id="DEMO-BATCH-001",
    )
    txn.flags.append(
        AnomalyFlag(
            flag_type=AnomalyFlagType.statistical,
            severity="high",
            description="Amount is a 3.2σ outlier for this account.",
            confidence_score=0.92,
        )
    )
    db.add(txn)

    # ── Report template + saved report ──────────────────────────────────
    template = ReportTemplate(
        name="DEMO Standard SOX Report",
        description="Executive summary, scope, findings, recommendations, conclusion.",
        sections=[
            "executive_summary",
            "scope",
            "findings",
            "recommendations",
            "conclusion",
        ],
        default_prompt="Summarize the engagement findings for an audit committee.",
    )
    db.add(template)
    await db.flush()

    db.add(
        SavedReport(
            engagement_id=eng.id,
            template_id=template.id,
            title="DEMO SOX Q4 ITGC — Draft Report",
            status=SavedReportStatus.draft,
            sections={
                "executive_summary": "Three findings identified; one critical relating "
                "to privileged access certification.",
            },
            generated_summary="Overall control environment is moderate with a critical "
            "access-management gap requiring prompt remediation.",
        )
    )

    # ── Activity events ─────────────────────────────────────────────────
    db.add_all(
        [
            ActivityEvent(
                engagement_id=eng.id,
                entity_type="engagement",
                action="created",
                actor_name="Avery Morgan",
                details="Demo engagement created.",
            ),
            ActivityEvent(
                engagement_id=eng.id,
                entity_type="finding",
                action="logged",
                actor_name="Jordan Lee",
                details="Critical privileged-access finding logged.",
            ),
        ]
    )

    await db.commit()
    snap = await gather_status(db, enabled=True)
    snap.credentials = _credentials()
    return snap


async def reset_demo(db: AsyncSession) -> DemoStatus:
    """Delete only rows whose markers identify them as demo data."""
    eng = await _find_engagement(db)
    if eng is not None:
        # engagement_id-scoped rows without a FK cascade from the engagement.
        for model in (ActivityEvent, AuditSignal):
            await db.execute(delete(model).where(model.engagement_id == eng.id))
        # Anomaly flags cascade from their transaction; delete the transactions.
        await db.execute(
            delete(AnomalyTransaction).where(AnomalyTransaction.engagement_id == eng.id)
        )
        # The rest (findings, evidence, risk, control tests, saved reports)
        # cascade via FK on engagement delete.
        await db.execute(
            delete(AuditEngagement).where(AuditEngagement.id == eng.id)
        )

    # Engagement-independent, prefix-scoped rows.
    await db.execute(delete(ReportTemplate).where(ReportTemplate.name.like(f"{DEMO_PREFIX}%")))
    # Control mappings cascade from controls and framework requirements.
    await db.execute(delete(Control).where(Control.name.like(f"{DEMO_PREFIX}%")))
    await db.execute(
        delete(FrameworkRequirement).where(
            FrameworkRequirement.requirement_code.like(f"{DEMO_PREFIX}%")
        )
    )
    await db.commit()
    return await gather_status(db, enabled=True)

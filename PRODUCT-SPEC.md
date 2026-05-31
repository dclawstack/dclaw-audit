# PRODUCT-SPEC: DClaw Audit

## Overview

**App Name:** DClaw Audit  
**Version:** 1.4 (May 2026)  
**Domain:** AI-native internal audit and compliance operations platform  
**Target Users:** Internal auditors, IT audit teams, compliance managers, audit directors  
**Design System:** One Convergence Vol. 01 — Dark `#1F2937` · Purple `#7030A0` · White `#FFFFFF` · Manrope/Inter/JetBrains Mono  
**Backend Port:** 8037 · **Frontend Port:** 3037

---

## Deployment Targets

| Target | Directory | URL |
|--------|-----------|-----|
| **Docker (local / K8s)** | `web/` (Next.js) + `backend/` (FastAPI) | http://localhost:3037 |
| **Backend API** | `backend/` | http://localhost:8037 · `/docs` for Swagger |
| **Vercel (cloud frontend)** | `web/` | Configured via `NEXT_PUBLIC_API_URL` |

---

## Core Entities

### AuditEngagement
```
AuditEngagement
├── id: UUID (PK)
├── title: str (required)
├── client_name: str (required)
├── status: enum ["planned", "in_progress", "reporting", "completed"] (default: "planned")
├── risk_level: enum ["low", "medium", "high", "critical"] (default: "medium")
├── owner_name: str (optional)
├── description: str (optional)
├── audit_period_start: date (optional)
├── audit_period_end: date (optional)
├── created_at: datetime
└── updated_at: datetime
```

### EvidenceRequest
```
EvidenceRequest
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── title: str (required)
├── description: str (optional)
├── request_owner: str (optional)
├── due_date: date (optional)
├── status: enum ["draft", "sent", "received", "overdue"] (default: "draft")
├── source_system: str (optional)  ← "Okta", "Salesforce", "SharePoint", etc.
├── created_at: datetime
└── updated_at: datetime
```

### EvidenceVersionLog
```
EvidenceVersionLog
├── id: UUID (PK)
├── evidence_request_id: UUID (FK → EvidenceRequest, ondelete=CASCADE)
├── action: enum ["created", "updated", "status_changed", "file_attached", "note_added", "reminder_sent"]
├── previous_value: str (optional)
├── new_value: str (optional)
├── actor_name: str (optional)
├── note: str (optional)
└── created_at: datetime
```

### EvidenceFile
```
EvidenceFile
├── id: UUID (PK)
├── evidence_request_id: UUID (FK → EvidenceRequest, ondelete=CASCADE)
├── filename: str (required)
├── file_path: str (optional)         ← MinIO object path
├── file_size: int (optional)
├── content_type: str (optional)
├── source_system: str (optional)
├── uploaded_by: str (optional)
├── version: int (default=1)
├── notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### Finding
```
Finding
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── title: str (required)
├── description: str (optional)
├── severity: enum ["low", "medium", "high", "critical"] (default: "medium")
├── status: enum ["open", "in_progress", "remediated", "verified"] (default: "open")
├── root_cause: str (optional)
├── recommendation: str (optional)
├── remediation_plan: str (optional)
├── owner_name: str (optional)
├── due_date: date (optional)
├── created_at: datetime
└── updated_at: datetime
```

### Control
```
Control
├── id: UUID (PK)
├── name: str (required)
├── description: str (optional)
├── framework: enum ["sox", "iso_27001", "nist", "pci_dss"] (optional)
├── control_owner: str (optional)
├── frequency: str (optional)   ← "Daily", "Quarterly", "Annual"
├── automated: bool (default: false)
├── created_at: datetime
└── updated_at: datetime
```

### FrameworkRequirement
```
FrameworkRequirement
├── id: UUID (PK)
├── framework: enum ["sox", "iso_27001", "nist", "pci_dss"]
├── requirement_code: str (required)   ← "CC6.1", "A.9.2.1", "AC-2", etc.
├── title: str (required)
├── description: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### ControlMapping
```
ControlMapping
├── id: UUID (PK)
├── control_id: UUID (FK → Control, ondelete=CASCADE)
├── framework_requirement_id: UUID (FK → FrameworkRequirement, ondelete=CASCADE)
├── coverage_status: enum ["full", "partial", "planned"] (default: "partial")
├── notes: str (optional)
├── created_at: datetime
└── updated_at: datetime

Unique constraint: (control_id, framework_requirement_id)
```

### RiskItem
```
RiskItem
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── title: str (required)
├── description: str (optional)
├── category: str (optional)            ← "Access Control", "Change Management", etc.
├── likelihood: int (1–5, default: 3)
├── impact: int (1–5, default: 3)
├── risk_score: float (likelihood × impact, default: 9.0)
├── residual_likelihood: int (optional)
├── residual_impact: int (optional)
├── residual_score: float (optional)
├── owner_name: str (optional)
├── status: enum ["open", "mitigated", "accepted"] (default: "open")
├── mitigation_notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### ControlTest
```
ControlTest
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── control_id: UUID (FK → Control, nullable)
├── title: str (required)
├── test_type: enum ["manual", "automated", "sample_based"]
├── scheduled_date: date (optional)
├── completed_date: date (optional)
├── status: enum ["planned", "in_progress", "completed", "exception"]
├── overall_result: enum ["pass", "fail", "exception", "not_applicable"] (optional)
├── sample_size: int (optional)
├── exceptions_found: int (optional)
├── test_objective: str (optional)
├── test_procedure: str (optional)
├── test_notes: str (optional)
├── owner_name: str (optional)
├── reviewer_name: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### ControlTestSample
```
ControlTestSample
├── id: UUID (PK)
├── test_id: UUID (FK → ControlTest, ondelete=CASCADE)
├── item_reference: str (required)   ← document/transaction reference
├── item_description: str (optional)
├── result: enum ["pass", "fail", "exception", "not_applicable"] (optional)
├── exception_notes: str (optional)
└── created_at: datetime
```

### Workpaper
```
Workpaper
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── title: str (required)
├── content: str (optional)            ← rich text or markdown body
├── status: enum ["draft", "in_review", "approved", "archived"]
├── preparer_name: str (optional)
├── reviewer_name: str (optional)
├── reviewed_at: datetime (optional)
├── approved_at: datetime (optional)
├── version: int (default: 1)
├── notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### RemediationPlan
```
RemediationPlan
├── id: UUID (PK)
├── finding_id: UUID (FK → Finding, ondelete=CASCADE)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── title: str (required)
├── action_items: str (optional)       ← structured action steps
├── owner_name: str (optional)
├── due_date: date (optional)
├── status: enum ["open", "in_progress", "completed", "overdue", "cancelled"]
├── progress_pct: int (0–100, default: 0)
├── ai_generated: bool (default: false)
├── notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### ReportTemplate
```
ReportTemplate
├── id: UUID (PK)
├── name: str (required)
├── description: str (optional)
├── sections: list[str]               ← ["executive_summary", "scope", "findings", ...]
├── default_prompt: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### SavedReport
```
SavedReport
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── template_id: UUID (FK → ReportTemplate)
├── title: str (required)
├── status: enum ["draft", "generating", "completed"]
├── sections: JSON                    ← {section_name: content_text}
├── generated_summary: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### AnomalyTransaction
```
AnomalyTransaction
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, nullable)
├── transaction_date: date (optional)
├── amount: float (optional)
├── description: str (optional)
├── account_code: str (optional)
├── party_name: str (optional)
├── source_system: str (optional)
├── batch_id: str (optional)
└── created_at: datetime
```

### AnomalyFlag
```
AnomalyFlag
├── id: UUID (PK)
├── transaction_id: UUID (FK → AnomalyTransaction, ondelete=CASCADE)
├── flag_type: enum ["statistical", "rule_based"]
├── severity: str
├── description: str (required)
├── confidence_score: float (optional, 0.0–1.0)
├── status: enum ["flagged", "reviewed", "cleared", "escalated"]
├── analyst_notes: str (optional)
├── reviewed_by: str (optional)
├── reviewed_at: datetime (optional)
└── created_at: datetime
```

### AuditSignal
```
AuditSignal
├── id: UUID (PK)
├── signal_source: enum ["erp", "iam", "ticketing", "cloud", "manual"]
├── signal_type: enum ["control_deviation", "access_change", "config_change",
│                      "threshold_breach", "anomaly"]
├── title: str (required)
├── description: str (optional)
├── entity_ref: str (optional)        ← system object reference
├── severity: str (required)
├── status: enum ["new", "reviewed", "dismissed", "escalated"]
├── engagement_id: UUID (FK → AuditEngagement, nullable)
├── finding_id: UUID (FK → Finding, nullable)
├── reviewed_by: str (optional)
├── reviewed_at: datetime (optional)
└── created_at: datetime
```

### ActivityEvent
```
ActivityEvent
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, nullable)
├── entity_type: str (required)    ← "finding", "evidence_request", etc.
├── entity_id: UUID (optional)
├── action: str (required)         ← "created", "updated", "status_changed"
├── actor_name: str (optional)
├── details: str (optional)
└── created_at: datetime
```

---

## Screens

### Screen 1: Landing (`/`)
- Marketing page: hero section, feature grid (12 capability cards), architecture overview, demo CTA
- Navigation links to all app sections
- GitHub repo link

### Screen 2: Dashboard (`/dashboard`)
- KPI cards: total engagements, in-progress count, critical-risk count, open findings
- Status breakdown: planned / in_progress / reporting / completed
- Risk breakdown: low / medium / high / critical
- Finding severity breakdown with aging buckets (0–30, 31–60, 61–90, 91+ days)
- Overdue evidence requests count
- Recent engagements, evidence requests, findings, and controls feeds
- AI Copilot sidebar for risk brainstorming and evidence drafting

### Screen 3: Controls & Framework Mapping (`/controls`)
- Control inventory table: name, framework badge, owner, frequency, automated indicator
- Framework filter (SOX / ISO 27001 / NIST / PCI-DSS)
- Gap analysis view: requirements without mapped controls, coverage status per requirement
- Control detail with mapped requirements list

### Screen 4: Risk Register (`/risk`)
- Risk items by engagement with likelihood × impact matrix
- Risk score badge (colour-coded: low / medium / high / critical)
- Residual risk after mitigation
- Status lifecycle: open → mitigated → accepted
- Inline edit: owner, mitigation notes, status update

### Screen 5: Audit Signals (`/signals`)
- Signal triage queue: source badge, type, severity, status
- Filter by source (ERP / IAM / cloud / ticketing) and status
- Review action: dismiss, escalate, link to engagement or finding
- Signal breakdown stats by source and type

### Screen 6: Anomaly Detection (`/anomalies`)
- Transaction import (bulk ingest) and individual transaction entry
- Anomaly flag queue with confidence score, flag type badge, severity
- Analyst review workflow: clear, escalate, add notes
- Filter by status (flagged / reviewed / cleared / escalated) and flag type

### Screen 7: Remediation Tracking (`/remediation`)
- Remediation plans per finding and engagement
- Progress bar with % completion, owner, due date, status
- AI-generate button: drafts plan from finding context
- Status lifecycle: open → in_progress → completed / overdue

### Screen 8: Report Builder (`/reports`)
- Template selector (pre-built or custom sections list)
- Saved reports per engagement with status (draft / generating / completed)
- AI generation: trigger report build from engagement data
- HTML export download for completed reports

### Screen 9: Workpapers (`/workpapers`)
- Workpaper list per engagement with status badge and version number
- Create / edit workpaper with rich content field
- Review and approval workflow: draft → in_review → approved → archived
- Preparer and reviewer assignment

### Screen 10: Control Testing (`/testing`)
- Test plan list per engagement with type badge and status
- Sample management: add items, record pass/fail/exception per sample
- Test completion: overall result, exceptions found count, reviewer sign-off
- Filter by test type (manual / automated / sample_based) and status

### Screen 11: Intelligence (`/intelligence`)
- Recurring control failures: control name, total tests, failure rate
- Owner responsiveness: requests assigned, overdue count, avg days open, responsiveness score
- Cycle time benchmarks: engagement duration, open vs total findings
- Summary KPIs: avg finding age, high-risk engagement count, 30-day and 60-day finding trends

---

## AI Feature Summary

| # | Endpoint | Trigger | Output |
|---|---------|---------|--------|
| 1 | `/ai/draft-evidence` | Button on engagement | Suggested evidence request list |
| 2 | `/ai/risk-copilot` | Button on engagement | Key risks, control gaps, test ideas |
| 3 | `/ai/draft-finding` | Observation text input | Structured finding: title, description, root cause, recommendation, severity |
| 4 | `/ai/generate-report` | Button on engagement | Executive summary, key observations, overall risk rating |
| 5 | `/ai/check-evidence-completeness` | Evidence review | Coverage gaps against engagement scope |
| 6 | `/ai/prioritize-findings` | Findings list | Risk-ranked finding order with rationale |
| 7 | `/ai/generate-remediation-plan` | Finding ID | Action items, owner suggestion, estimated timeline |
| 8 | `/saved-reports/generate` | Report template + engagement | Full AI-generated report sections |

All AI endpoints return `503 Service Unavailable` when no LLM provider is configured. Non-AI workflows are always available.

---

## API Endpoints (v1.4 — Complete)

```
# Health
GET    /health/                                              → {"status": "ok"}

# Dashboard
GET    /api/v1/dashboard/summary                            → KPI summary

# Engagements
GET    /api/v1/engagements                                  → List (filterable)
POST   /api/v1/engagements                                  → Create
GET    /api/v1/engagements/{id}                             → Detail
PATCH  /api/v1/engagements/{id}                             → Update
DELETE /api/v1/engagements/{id}                             → Delete (204)

# Evidence Requests
GET    /api/v1/evidence-requests                            → List (optional ?engagement_id=)
POST   /api/v1/evidence-requests                            → Create
GET    /api/v1/evidence-requests/{id}                       → Detail
PATCH  /api/v1/evidence-requests/{id}                       → Update status / fields
DELETE /api/v1/evidence-requests/{id}                       → Delete (204)
GET    /api/v1/evidence-requests/{id}/version-log           → Audit trail
POST   /api/v1/evidence-requests/{id}/version-log           → Append log entry

# Evidence Files
GET    /api/v1/evidence-files                               → List (optional ?evidence_request_id=)
POST   /api/v1/evidence-files/upload                        → Upload file to MinIO + create record
GET    /api/v1/evidence-files/{id}                          → Detail
DELETE /api/v1/evidence-files/{id}                          → Delete (204)

# Findings
GET    /api/v1/findings                                     → List (optional ?engagement_id=)
POST   /api/v1/findings                                     → Create
GET    /api/v1/findings/{id}                                → Detail
PATCH  /api/v1/findings/{id}                                → Update lifecycle / fields
DELETE /api/v1/findings/{id}                                → Delete (204)

# Controls
GET    /api/v1/controls                                     → List (optional ?framework=)
POST   /api/v1/controls                                     → Create
GET    /api/v1/controls/{id}                                → Detail
GET    /api/v1/controls/{id}/with-mappings                  → Detail + mapped requirements
DELETE /api/v1/controls/{id}                                → Delete (204)
GET    /api/v1/controls/gap-analysis                        → Requirements without full coverage

# Framework Requirements
GET    /api/v1/framework-requirements                       → List (optional ?framework=)
POST   /api/v1/framework-requirements                       → Create
GET    /api/v1/framework-requirements/{id}                  → Detail
GET    /api/v1/framework-requirements/{id}/with-mappings    → Detail + mapped controls
DELETE /api/v1/framework-requirements/{id}                  → Delete (204)

# Control Mappings
GET    /api/v1/control-mappings                             → List (optional ?control_id= ?framework_requirement_id=)
POST   /api/v1/control-mappings                             → Create
GET    /api/v1/control-mappings/{id}                        → Detail
DELETE /api/v1/control-mappings/{id}                        → Delete (204)

# Risk Register
GET    /api/v1/risk-items                                   → List (optional ?engagement_id= ?status=)
POST   /api/v1/risk-items                                   → Create
GET    /api/v1/risk-items/{id}                              → Detail
PATCH  /api/v1/risk-items/{id}                              → Update score / status
DELETE /api/v1/risk-items/{id}                              → Delete (204)

# Control Testing
GET    /api/v1/control-tests                                → List (optional ?engagement_id= ?control_id= ?status=)
POST   /api/v1/control-tests                                → Create
GET    /api/v1/control-tests/{id}                           → Detail with samples
PATCH  /api/v1/control-tests/{id}                           → Update result / status
DELETE /api/v1/control-tests/{id}                           → Delete (204)
GET    /api/v1/control-tests/{id}/samples                   → List samples
POST   /api/v1/control-tests/{id}/samples                   → Add sample

# Workpapers
GET    /api/v1/workpapers                                   → List (optional ?engagement_id= ?status=)
POST   /api/v1/workpapers                                   → Create
GET    /api/v1/workpapers/{id}                              → Detail
PATCH  /api/v1/workpapers/{id}                              → Update content / status
DELETE /api/v1/workpapers/{id}                              → Delete (204)

# Remediation Plans
GET    /api/v1/remediation-plans                            → List (optional ?engagement_id= ?finding_id= ?status=)
POST   /api/v1/remediation-plans                            → Create manually
POST   /api/v1/remediation-plans/ai-generate                → AI-draft from finding context
GET    /api/v1/remediation-plans/{id}                       → Detail
PATCH  /api/v1/remediation-plans/{id}                       → Update progress / status
DELETE /api/v1/remediation-plans/{id}                       → Delete (204)

# Anomaly Transactions & Flags
GET    /api/v1/anomaly-transactions                         → List (optional ?engagement_id= ?batch_id=)
POST   /api/v1/anomaly-transactions                         → Create single transaction
POST   /api/v1/anomaly-transactions/bulk-ingest             → Bulk import + optional detection
POST   /api/v1/anomaly-transactions/{id}/detect             → Run detection on single transaction
GET    /api/v1/anomaly-flags                                → List (optional ?status= ?flag_type=)
PATCH  /api/v1/anomaly-flags/{id}                           → Analyst review (status, notes)

# Audit Signals
GET    /api/v1/audit-signals                                → List (optional ?engagement_id= ?status= ?signal_source= ?signal_type=)
POST   /api/v1/audit-signals                                → Ingest signal
GET    /api/v1/audit-signals/{id}                           → Detail
PATCH  /api/v1/audit-signals/{id}                           → Update status / link to engagement or finding
DELETE /api/v1/audit-signals/{id}                           → Delete (204)
GET    /api/v1/audit-signals/stats/breakdown                → Count by source and type

# Activity Events
GET    /api/v1/activity-events                              → List (optional ?engagement_id= ?entity_type=)
POST   /api/v1/activity-events                              → Append event

# Intelligence
GET    /api/v1/intelligence/summary                         → Trends, responsiveness, cycle times

# Report Templates
GET    /api/v1/report-templates                             → List
POST   /api/v1/report-templates                             → Create
GET    /api/v1/report-templates/{id}                        → Detail
DELETE /api/v1/report-templates/{id}                        → Delete (204)

# Saved Reports
GET    /api/v1/saved-reports                                → List (optional ?engagement_id=)
POST   /api/v1/saved-reports                                → Create (draft)
POST   /api/v1/saved-reports/generate                       → Create + trigger AI generation
GET    /api/v1/saved-reports/{id}                           → Detail with template
PATCH  /api/v1/saved-reports/{id}                           → Update sections / status
DELETE /api/v1/saved-reports/{id}                           → Delete (204)
GET    /api/v1/saved-reports/{id}/export                    → HTML export

# AI Copilot
POST   /api/v1/ai/draft-evidence                            → Evidence request list for engagement
POST   /api/v1/ai/risk-copilot                              → Risks, controls, test ideas
POST   /api/v1/ai/draft-finding                             → Draft finding from observation text
POST   /api/v1/ai/generate-report                           → Executive summary from engagement
POST   /api/v1/ai/check-evidence-completeness               → Evidence gap analysis
POST   /api/v1/ai/prioritize-findings                       → Risk-ranked finding list
POST   /api/v1/ai/generate-remediation-plan                 → Draft remediation plan

# Demo
GET    /api/v1/demo/status                                   → Demo mode status
POST   /api/v1/demo/seed                                     → Load demo data
DELETE /api/v1/demo/reset                                    → Wipe demo data
```

---

## LLM Provider Architecture

```
OPENROUTER_API_KEY set?
  Yes → OpenRouter API → configured OPENROUTER_MODEL
  No  → OLLAMA_URL set?
          Yes → Ollama (local) → OLLAMA_MODEL (default: llama3.1)
          No  → raise AIServiceError → endpoint returns 503

All AI calls: try/except wrapper → endpoints return 503 if AI unavailable
Non-AI endpoints: always available regardless of LLM configuration
```

All LLM calls go through `backend/app/services/ai_service.py`. API routes never import provider SDKs directly.

---

## Non-Functional Requirements

| Requirement | Spec |
|-------------|------|
| **Persistence** | PostgreSQL 16 only — no in-memory mocks, no SQLite |
| **ORM** | Async SQLAlchemy 2.0 — `Mapped`, `mapped_column`, `relationship` |
| **Schemas** | Pydantic v2 with `model_config = ConfigDict(from_attributes=True)` |
| **Migrations** | Every schema change via Alembic — `alembic upgrade head` before first start |
| **Backend tests** | `pytest-asyncio` + `httpx.AsyncClient` + `ASGITransport`; DB override via `get_db` DI |
| **Auth** | Logto JWT with JWKS validation (`LOGTO_ENDPOINT`). `DISABLE_AUTH=true` in dev only. See `PLAN-v1.4.md` for production hardening requirements |
| **Design system** | One Convergence Vol. 01 — primary dark `#1F2937`, accent purple `#7030A0`, Manrope/Inter/JetBrains Mono |
| **Frontend** | Responsive; Tailwind CSS; shadcn/ui-style components; strict TypeScript |
| **Docker** | `docker compose up -d` — all services. Non-root containers |
| **Object storage** | MinIO — evidence file uploads to `dclaw-audit-files` bucket |
| **Cache** | Redis 7 — available for rate limiting and session caching |
| **Audit trail** | All entity mutations must be timestamped via `created_at`/`updated_at`; activity events for user-facing actions |
| **AI resilience** | All AI calls in try/except — endpoints return 503 if LLM unavailable; non-AI data always accessible |
| **AI outputs** | Findings and evidence suggestions must include confidence indicators |

---

## Known Open Defects (v1.4 — Target Fix)

| ID | Severity | Description | File |
|----|----------|-------------|------|
| TF-01 | Critical | `disable_auth: bool = True` is default — all 135 endpoints unauthenticated out of box | `backend/app/core/config.py:18` |
| TF-02 | Critical | JWT payload base64-decoded but signature never cryptographically verified | `backend/app/core/auth.py:36–79` |
| TF-03 | High | `fetchJson()` has no timeout — all API calls hang indefinitely under backend degradation | `web/src/lib/api.ts:14` |
| TF-04 | High | CORS `allow_origins=["*"]` with `allow_credentials=True` | `backend/app/api/main.py:27` |
| TF-05 | High | No rate limiting on any endpoint — `slowapi` absent from `requirements.txt` | `backend/app/api/main.py` |
| TF-06 | High | No observability — no Sentry, no `structlog`, no APM | `requirements.txt`, `web/package.json` |
| TF-07 | Medium | Frontend has zero tests — no `vitest` in `web/package.json` | `web/package.json` |
| TF-08 | Medium | Mutation score 27/100 — tests assert status codes, not computed values | `backend/tests/` |

See `PLAN-v1.4.md` for full remediation steps and implementation order.

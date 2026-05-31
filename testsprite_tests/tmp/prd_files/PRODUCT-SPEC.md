# PRODUCT-SPEC: DClaw Audit
> Version: 1.3 — updated 2026-05-28

## Overview

**App Name:** DClaw Audit  
**Domain:** Internal audit and compliance operations  
**Target Users:** Internal auditors, IT audit teams, compliance managers, audit directors

## Product Thesis

DClaw Audit is an **AI-native evidence-to-finding operating system** for internal audit teams. It turns fragmented evidence collection, control testing, and remediation follow-up into a single AI-assisted system of record — compressing audit cycle time without adding headcount.

## Beachhead Customer

Mid-market and upper mid-market companies with:
- lean internal audit teams (2–15 people)
- recurring SOX / operational / ITGC audits
- evidence spread across cloud apps, spreadsheets, and manual email requests
- strong need to reduce audit cycle time without adding headcount

## Core Entities

### AuditEngagement
```
AuditEngagement
├── id: UUID (PK)
├── title: str (required)
├── client_name: str (required)
├── status: enum ["planned", "in_progress", "reporting", "completed"]
├── risk_level: enum ["low", "medium", "high", "critical"]
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
├── status: enum ["draft", "sent", "received", "overdue"]
├── source_system: str (optional)
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
├── severity: enum ["low", "medium", "high", "critical"]
├── status: enum ["open", "in_progress", "remediated", "verified"]
├── root_cause: str (optional)
├── recommendation: str (optional)
├── remediation_plan: str (optional)
├── management_action_plan: str (optional)
├── owner_name: str (optional)
├── due_date: date (optional)
├── remediation_confidence_score: float (optional)  ← AI-scored
├── created_at: datetime
└── updated_at: datetime
```

### Control
```
Control
├── id: UUID (PK)
├── name: str (required)
├── description: str (optional)
├── framework: str (optional)
├── control_owner: str (optional)
├── frequency: str (optional)
├── automated: bool
├── created_at: datetime
└── updated_at: datetime
```

### Risk
```
Risk
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, ondelete=CASCADE)
├── title: str (required)
├── description: str (optional)
├── likelihood: enum ["low", "medium", "high"]
├── impact: enum ["low", "medium", "high"]
├── inherent_risk_score: float (computed)
├── owner_name: str (optional)
├── status: enum ["identified", "assessed", "mitigated", "accepted"]
├── related_control_ids: list[UUID] (optional)
├── created_at: datetime
└── updated_at: datetime
```

### Framework
```
Framework
├── id: UUID (PK)
├── name: str (required)            ← "SOX", "ISO 27001", "NIST", "PCI-DSS"
├── description: str (optional)
├── version: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### FrameworkRequirement
```
FrameworkRequirement
├── id: UUID (PK)
├── framework_id: UUID (FK → Framework)
├── code: str (required)            ← "CC6.1", "A.9.1.1", etc.
├── title: str (required)
├── description: str (optional)
└── created_at: datetime
```

### ControlMapping
```
ControlMapping
├── id: UUID (PK)
├── control_id: UUID (FK → Control)
├── requirement_id: UUID (FK → FrameworkRequirement)
└── created_at: datetime
```

### EvidenceFile
```
EvidenceFile
├── id: UUID (PK)
├── request_id: UUID (FK → EvidenceRequest, ondelete=CASCADE)
├── filename: str (required)
├── source_system: str (optional)
├── upload_url: str (optional)
├── version: int (default=1)
├── uploaded_by: str (optional)
├── provenance_notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### ControlTestResult
```
ControlTestResult
├── id: UUID (PK)
├── control_id: UUID (FK → Control)
├── engagement_id: UUID (FK → AuditEngagement)
├── test_date: date (required)
├── result: enum ["pass", "fail", "exception", "not_tested"]
├── sample_size: int (optional)
├── exception_count: int (optional)
├── notes: str (optional)
├── tester_name: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

### AuditSignal
```
AuditSignal
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement, nullable)
├── source_system: str (required)    ← "ERP", "IAM", "cloud", "ticketing"
├── signal_type: str (required)      ← "access_change", "config_drift", etc.
├── severity: enum ["low", "medium", "high", "critical"]
├── description: str (optional)
├── raw_payload: JSON (optional)
├── status: enum ["new", "reviewed", "escalated", "dismissed"]
├── created_at: datetime
└── updated_at: datetime
```

### Anomaly
```
Anomaly
├── id: UUID (PK)
├── engagement_id: UUID (FK → AuditEngagement)
├── detection_method: enum ["rule", "statistical", "cluster"]
├── description: str (required)
├── transaction_ref: str (optional)
├── amount: float (optional)
├── risk_score: float (optional)
├── status: enum ["flagged", "reviewed", "confirmed", "dismissed"]
├── analyst_notes: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

## User Stories / Screens

### Screen 1: Audit Dashboard
- Summary cards: total engagements, in-progress, critical-risk, overdue requests
- Recent engagements feed
- Status and risk breakdown
- Open finding counts by severity
- Quick action: create engagement

### Screen 2: Engagements
- Table/list of audit engagements
- Create engagement form
- Filter by status, owner, and risk
- View recent activity per engagement

### Screen 3: Evidence Requests
- Create and track evidence requests by engagement
- Request status board: draft / sent / received / overdue
- Due dates and request owners
- Link requests to findings and controls
- Evidence file versioning and provenance view

### Screen 4: Findings
- Finding register by engagement
- Severity and remediation lifecycle tracking
- Recommendation, remediation plan, management action plan, and owner assignment
- AI-scored remediation confidence
- Aging and verification workflow

### Screen 5: Controls & Framework Mapping
- Control inventory
- Framework alignment across SOX / ISO 27001 / NIST / PCI-DSS
- Gap view for uncovered requirements
- Control test history and pass/fail trend

### Screen 6: Risk Planning Workspace
- Risk register per engagement
- Inheritable risk scores (likelihood × impact)
- Scoped control coverage recommendations
- Planner UX for converting risks into test plans

### Screen 7: Evidence Vault
- Upload metadata and source references
- Version history per evidence file
- Evidence linked to requests, controls, tests, and findings
- Provenance and citation fields for AI outputs

### Screen 8: Report Builder
- Structured sections derived from live engagement data
- Finding summaries by severity, owner, framework, and remediation status
- Export-ready narratives
- AI-drafted report sections with citation links

### Screen 9: Team Workflow & Accountability
- Request owners and reviewer assignments
- Due date / SLA indicators
- Activity timeline
- Notifications backbone

### Screen 10: AI Copilot Panel
- Risk brainstorming from engagement context
- Draft evidence request lists
- Draft findings with evidence citations
- Summarize control testing results
- Confidence and source reference explanations

### Screen 11: Anomaly Detection
- Transaction ingestion and review queue
- Rule-based + statistical outlier flags
- Cluster-based anomaly grouping
- Analyst review and feedback loop

### Screen 12: Audit Intelligence
- Cross-engagement trend detection
- Recurring control failure tracking
- Control owner responsiveness analytics
- Cycle time benchmarking across audit types

## AI Features

- **AI request drafting:** Generate evidence request lists based on audit scope and risk areas
- **Risk copilot:** Suggest key risks, controls, and test ideas for an engagement
- **Finding drafting:** Convert structured evidence and exceptions into draft findings with citations
- **Control test summarization:** Summarize test results and highlight exceptions with source references
- **Remediation scoring:** Score management action plan confidence and flag stale remediation
- **Anomaly detection:** Flag unusual transactions or outliers for substantive testing using rule-based and statistical methods
- **Continuous audit signals:** Ingest and triage signals from ERP, IAM, cloud, and ticketing systems
- **Report generation:** Draft audit report sections from engagement status, findings, and remediation plans
- **Audit intelligence:** Surface cross-engagement trends, recurring failures, and cycle time benchmarks

## API Endpoints

```
GET    /health/                                → Service health

# Engagements
GET    /api/v1/engagements                    → List audit engagements
POST   /api/v1/engagements                    → Create audit engagement
GET    /api/v1/engagements/{id}               → Get audit engagement detail
PATCH  /api/v1/engagements/{id}               → Update audit engagement
DELETE /api/v1/engagements/{id}               → Delete audit engagement

# Evidence Requests
GET    /api/v1/evidence-requests              → List evidence requests
POST   /api/v1/evidence-requests              → Create evidence request
GET    /api/v1/evidence-requests/{id}         → Get evidence request detail
PATCH  /api/v1/evidence-requests/{id}         → Update evidence request
DELETE /api/v1/evidence-requests/{id}         → Delete evidence request

# Evidence Files
GET    /api/v1/evidence-files                 → List evidence files
POST   /api/v1/evidence-files                 → Upload evidence file metadata
GET    /api/v1/evidence-files/{id}            → Get evidence file detail
DELETE /api/v1/evidence-files/{id}            → Delete evidence file

# Findings
GET    /api/v1/findings                       → List findings
POST   /api/v1/findings                       → Create finding
GET    /api/v1/findings/{id}                  → Get finding detail
PATCH  /api/v1/findings/{id}                  → Update finding lifecycle / fields
DELETE /api/v1/findings/{id}                  → Delete finding

# Controls & Framework Mapping
GET    /api/v1/controls                       → List controls
POST   /api/v1/controls                       → Create control
GET    /api/v1/controls/{id}                  → Get control detail
PATCH  /api/v1/controls/{id}                  → Update control
DELETE /api/v1/controls/{id}                  → Delete control
GET    /api/v1/frameworks                     → List frameworks
POST   /api/v1/frameworks                     → Create framework
GET    /api/v1/frameworks/{id}/requirements   → List requirements for a framework
POST   /api/v1/control-mappings               → Map control to framework requirement
DELETE /api/v1/control-mappings/{id}          → Remove mapping

# Risk Register
GET    /api/v1/risks                          → List risks
POST   /api/v1/risks                          → Create risk
GET    /api/v1/risks/{id}                     → Get risk detail
PATCH  /api/v1/risks/{id}                     → Update risk
DELETE /api/v1/risks/{id}                     → Delete risk

# Control Testing
GET    /api/v1/control-test-results           → List test results
POST   /api/v1/control-test-results           → Record test result
GET    /api/v1/control-test-results/{id}      → Get test result detail
PATCH  /api/v1/control-test-results/{id}      → Update test result

# Anomaly Detection
GET    /api/v1/anomalies                      → List anomalies
POST   /api/v1/anomalies/detect               → Run anomaly detection on ingested data
PATCH  /api/v1/anomalies/{id}                 → Update anomaly review status

# Audit Signals
GET    /api/v1/signals                        → List audit signals
POST   /api/v1/signals                        → Ingest audit signal
PATCH  /api/v1/signals/{id}                   → Update signal status

# Dashboard & Reporting
GET    /api/v1/dashboard/summary              → Dashboard metrics
GET    /api/v1/reports/{engagement_id}        → Structured report data for an engagement

# AI Copilot
POST   /api/v1/ai/draft-requests             → Generate evidence request list
POST   /api/v1/ai/draft-finding              → Draft finding from evidence
POST   /api/v1/ai/suggest-risks              → Suggest risks for engagement
POST   /api/v1/ai/summarize-tests            → Summarize control test results
POST   /api/v1/ai/score-remediation          → Score remediation confidence
```

## Feature Roadmap

| Complexity | Item | Description |
|---|---|---|
| 0 | Platform alignment | Port/identity/Docker consistency |
| 0 | AuditEngagement CRUD | Persistent engagement entity, migration, tests |
| 0 | Dashboard metrics | Live summary stats from PostgreSQL |
| 0 | Evidence request workflow | EvidenceRequest entity with status lifecycle |
| 0 | Product docs | Correct PRODUCT-SPEC, README, entity docs |
| 1 | Risk planning workspace | Risk register, risk scoring, planner UX |
| 1 | Control library + framework mapping | SOX / ISO 27001 / NIST / PCI-DSS starter |
| 1 | Evidence vault | Upload metadata, versioning, provenance |
| 1 | Findings + remediation lifecycle | MAP, due dates, owners, verification |
| 1 | Report builder | Structured sections, exportable narratives |
| 1 | Team workflow | Owners, reviewers, SLAs, activity timeline |
| 2 | AI copilot (grounded outputs) | Request drafting, finding drafting, citations |
| 2 | Anomaly detection | Rule + statistical + cluster-based flagging |
| 2 | Continuous audit connectors | ERP / IAM / cloud / ticketing ingestion |
| 2 | Control testing automation | Scheduled tests, sample selection, exceptions |
| 2 | Audit intelligence layer | Cross-engagement trends, cycle benchmarking |

## Non-Functional Requirements

- PostgreSQL-backed persistence only (no SQLite, no mock data in primary flows)
- Async SQLAlchemy + repository pattern
- Pydantic v2 schemas with `from_attributes=True`
- Alembic migration for every new model/table
- Backend test coverage for all new routes
- Responsive Next.js frontend using scaffold UI components
- Docker / Compose config aligned with backend `8037` and frontend `3037`
- Default database: `dclaw_audit`
- AI outputs must include confidence indicators and source citations (explainability)
- Audit trail integrity: all entity mutations are timestamped

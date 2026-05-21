# PRODUCT-SPEC: DClaw Audit

## Overview

**App Name:** DClaw Audit  
**Domain:** Internal audit and compliance operations  
**Target Users:** Internal auditors, IT audit teams, compliance managers, audit directors

## Product Thesis

DClaw Audit helps audit teams complete recurring audits faster by turning fragmented evidence collection, engagement tracking, and remediation follow-up into a single AI-ready system of record.

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
├── framework: str (optional)
├── control_owner: str (optional)
├── frequency: str (optional)
├── automated: bool
├── created_at: datetime
└── updated_at: datetime
```

## User Stories / Screens

### Screen 1: Audit Dashboard
- Summary cards: total engagements, in-progress engagements, critical-risk engagements, overdue requests
- Recent engagements feed
- Status and risk breakdown
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

### Screen 4: Findings
- Finding register by engagement
- Severity and remediation lifecycle tracking
- Recommendation, remediation plan, and owner assignment
- Aging and verification workflow

### Screen 5: Controls & Framework Mapping
- Control inventory
- Framework alignment across SOX / ISO 27001 / NIST / PCI-DSS
- Gap view for uncovered requirements

## AI Features

- **AI request drafting:** Generate evidence request lists based on audit scope and risk areas
- **Risk copilot:** Suggest key risks, controls, and test ideas for an engagement
- **Finding drafting:** Convert structured evidence and exceptions into draft findings with citations
- **Anomaly detection:** Flag unusual transactions or outliers for substantive testing
- **Report generation:** Draft audit report sections from engagement status, findings, and remediation plans

## API Endpoints (initial slice)

```
GET    /health/                          → Service health
GET    /api/v1/engagements              → List audit engagements
POST   /api/v1/engagements              → Create audit engagement
GET    /api/v1/engagements/{id}         → Get audit engagement detail
DELETE /api/v1/engagements/{id}         → Delete audit engagement
GET    /api/v1/evidence-requests        → List evidence requests
POST   /api/v1/evidence-requests        → Create evidence request
GET    /api/v1/evidence-requests/{id}   → Get evidence request detail
DELETE /api/v1/evidence-requests/{id}   → Delete evidence request
GET    /api/v1/findings                 → List findings
POST   /api/v1/findings                 → Create finding
GET    /api/v1/findings/{id}            → Get finding detail
PATCH  /api/v1/findings/{id}            → Update finding lifecycle / fields
DELETE /api/v1/findings/{id}            → Delete finding
GET    /api/v1/dashboard/summary        → Dashboard metrics
```

## Non-Functional Requirements

- PostgreSQL-backed persistence only
- Async SQLAlchemy + repository pattern
- Pydantic v2 schemas with `from_attributes=True`
- Alembic migration for every new model/table
- Backend test coverage for all new routes
- Responsive Next.js frontend using scaffold UI components
- Docker / Compose config aligned with backend `8037` and frontend `3037`

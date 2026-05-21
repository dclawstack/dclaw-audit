# DClaw Audit — Plan v1.3

> Created: 2026-05-16
> Source inputs: `AGENTS.md`, `PLAN-v1.2.md`, `README.md`, `PRODUCT-SPEC.md`, current backend/frontend scaffold state

## 1. Executive Summary

The repository is not yet a credible audit SaaS product. It is still a partially customized scaffold with major inconsistencies:

- the app identity is `DClaw Audit`, but multiple files still say `DClaw App`
- required ports in `AGENTS.md` are `8037`/`3037`, but the running scaffold uses `8125`/`3039`
- the current backend exposes mock/random audit data, which violates the architecture rule of **NO MOCK DATA**
- `PRODUCT-SPEC.md` is still a CRM template and does not describe the audit domain
- there are no real audit domain models, repositories, migrations, or v1 API routes wired into the app
- the frontend is mostly placeholder UI with untyped API stubs
- the current product does not yet address a true hair-on-fire workflow for internal audit teams

## 2. Current-State Audit

### 2.1 What exists today

- FastAPI app with lifespan initialization
- SQLAlchemy async engine and `DeclarativeBase`
- Alembic scaffolding
- Next.js app router frontend
- Docker / Compose / Helm scaffold
- health endpoint and one health test
- generic repository base class

### 2.2 Critical gaps

1. **Domain mismatch**
   - `PRODUCT-SPEC.md` is for CRM, not audit
   - no canonical audit entities exist in code

2. **Architecture violations**
   - `backend/app/api/v1/audit.py` returns random in-memory data
   - no repository-backed audit workflows

3. **Go-to-market weakness**
   - current feature story is generic and demo-level
   - no clear wedge into internal audit, compliance, or continuous assurance teams

4. **Execution readiness gaps**
   - ports/config are not aligned with `AGENTS.md`
   - frontend API wrapper still uses broad `any` types
   - no meaningful CRUD or dashboard tests
   - no migration for domain data

## 3. YC Gap Analysis

To look like a high-potential YC company, DClaw Audit must be more than “audit management software with some AI.” It needs a sharper painkiller and a stronger compounding moat.

### 3.1 What YC reviewers would likely look for

- a painful, expensive workflow with clear buyers
- speed advantage over incumbents like AuditBoard / Workiva / TeamMate
- early evidence of product depth, not just surface dashboards
- clear path to workflow lock-in and data network effects
- technical leverage where AI meaningfully compresses labor

### 3.2 Where the current product falls short

#### A. Hair-on-fire problem definition is weak
Current roadmap mentions audit features, but not the strongest pain:

- evidence collection is fragmented across email, tickets, cloud drives, spreadsheets, and screenshots
- audit teams waste time chasing owners and reconciling evidence versions
- audit planning, testing, and reporting are slow because workpapers are disconnected from source systems
- management action plans and remediation follow-up are manual and stale

**Needed shift:** position DClaw Audit as an **AI-native evidence-to-finding operating system** for internal audit teams.

#### B. No clear moat yet
Current state has no durable advantage.

**Potential moat sources:**
- evidence graph linking systems, controls, requests, owners, findings, and audit history
- structured control-testing corpus that improves AI drafting and anomaly detection
- workflow telemetry showing which teams, controls, and requests create the most audit drag
- integrations into ERP, ticketing, cloud, and identity systems

#### C. AI is not yet credible
AI Copilot in v1.2 is framed as a chat feature. That is not enough.

**Needed shift:** AI should produce concrete outputs tied to workflow:
- generate request lists
- suggest risks and control tests
- summarize evidence deltas
- draft findings with citations
- score remediation confidence

#### D. Enterprise readiness is underdeveloped
A serious audit product needs:
- audit trail integrity
- versioned evidence
- ownership and due dates
- role-based access patterns
- framework mapping and exportable reporting
- explainability for AI-generated recommendations

## 4. Product Strategy v1.3

### 4.1 Positioning

**DClaw Audit helps internal audit and compliance teams complete audits faster by turning fragmented evidence collection, control testing, and finding remediation into a single AI-assisted system of record.**

### 4.2 Beachhead customer

Mid-market and upper mid-market companies with:
- lean internal audit teams
- recurring SOX / operational / ITGC audits
- evidence spread across cloud apps, spreadsheets, and manual requests
- strong need to reduce audit cycle time without adding headcount

### 4.3 Core product thesis

If DClaw Audit can:
1. centralize evidence requests,
2. structure controls and testing,
3. turn evidence into draft findings and reports,
4. and continuously track remediation,

then it can become the default operating layer for recurring audits and continuous assurance.

## 5. Roadmap — Complexity-Based Prioritization

Numbering scheme:
- **0** = low complexity / foundational / quick wins
- **1** = medium complexity / core differentiators
- **2** = high complexity / advanced AI + deep workflows

---

## 0. Foundational Roadmap

### 0.1 Platform alignment and scaffold hardening
**Goal:** make the repo actually match DClaw Audit standards.

Scope:
- rename placeholder app identity to `DClaw Audit`
- align ports to backend `8037` and frontend `3037`
- align default database to `dclaw_audit`
- remove unused placeholder text and API stubs
- ensure Docker/Compose/env consistency
- make frontend metadata and landing page audit-specific

Success criteria:
- all visible app identity and port settings are consistent
- `docker compose config` is valid
- no obvious scaffold placeholders remain in runtime-critical files

### 0.2 Real audit engagement domain
**Goal:** replace mock audit data with persistent core entities.

Scope:
- `AuditEngagement` model
- repository-backed CRUD endpoints
- Pydantic v2 schemas
- engagement list/detail/create/delete tests
- Alembic migration

Recommended initial fields:
- id
- title
- client_name
- status
- risk_level
- owner_name
- audit_period_start
- audit_period_end
- created_at
- updated_at

Success criteria:
- no random/mock trail generation in the primary audit flow
- users can create and list real engagements from PostgreSQL

### 0.3 Foundational dashboard metrics
**Goal:** create a real homepage/dashboard with summary stats.

Scope:
- total engagements
- status breakdown
- risk breakdown
- recent engagements
- typed frontend API bindings

Success criteria:
- frontend renders live backend data
- dashboard is useful even before AI features exist

### 0.4 Audit request workflow skeleton
**Goal:** introduce the start of the real painkiller: evidence requests.

Scope:
- `EvidenceRequest` model
- status lifecycle (`draft`, `sent`, `received`, `overdue`)
- link requests to engagement
- basic dashboard counts for open and overdue requests

Why this matters:
Evidence chasing is one of the strongest hair-on-fire wedges in audit.

### 0.5 Correct product documents
**Goal:** eliminate domain confusion.

Scope:
- replace CRM product spec with audit product spec
- document canonical entities and user flows
- align README with actual app behavior

---

## 1. Core Differentiators

### 1.1 Risk-based audit planning workspace
- risk register per engagement
- inheritable risk scores
- scoped control coverage recommendations
- planner UX for converting risks into tests

### 1.2 Control library + framework mapping
- `Control`, `Framework`, `FrameworkRequirement`, `ControlMapping`
- support SOX, ISO 27001, NIST, PCI-DSS starter mappings
- show gaps and duplicate control coverage

### 1.3 Evidence vault and provenance
- upload metadata + source references
- version history
- evidence linked to requests, controls, tests, and findings
- provenance/citation fields for AI outputs

### 1.4 Findings and remediation lifecycle
- finding severity / root cause / recommendation
- management action plan
- due dates and owners
- remediation verification workflow

### 1.5 Report builder
- structured sections derived from engagement data
- export-ready narratives
- finding summaries by severity, owner, framework, and remediation status

### 1.6 Team workflow and accountability
- request owners
- reviewer fields
- due dates / SLA indicators
- activity timeline and notifications backbone

---

## 2. Advanced / AI-Heavy Roadmap

### 2.1 AI audit copilot with grounded outputs
- risk brainstorming from engagement context
- draft evidence request lists
- draft findings with evidence citations
- summarize control testing results
- explain confidence and source references

### 2.2 AI anomaly detection for substantive testing
- transaction ingestion pipeline
- rule-based + statistical outlier detection
- cluster-based anomaly grouping
- analyst review and feedback loop

### 2.3 Continuous auditing connectors
- ingest signals from ERP, IAM, ticketing, cloud audit logs
- recurring control checks
- deviations trigger issues or suggested requests

### 2.4 Control testing automation
- scheduled test execution definitions
- sample selection engine
- test result history
- exception handling and retesting workflow

### 2.5 Audit intelligence layer
- cross-engagement trend detection
- recurring control failures
- control owner responsiveness analytics
- cycle time benchmarking across audit types

## 6. Recommended Build Order

### Sprint A
- 0.1 Platform alignment and scaffold hardening
- 0.2 Real audit engagement domain
- 0.3 Foundational dashboard metrics

### Sprint B
- 0.4 Audit request workflow skeleton
- 0.5 Correct product documents
- 1.4 Findings and remediation lifecycle (initial slice)

### Sprint C
- 1.1 Risk-based audit planning workspace
- 1.2 Control library + framework mapping
- 1.3 Evidence vault and provenance

### Sprint D
- 1.5 Report builder
- 2.1 AI copilot with grounded outputs
- 2.4 Control testing automation

## 7. Phase 3 Execution Notes

### Database decision
The user request suggested SQLite initialization, but **this repo is architecture-locked to PostgreSQL** in `AGENTS.md`.

Therefore v1.3 execution will use:
- PostgreSQL for app and tests
- SQLAlchemy async + `asyncpg`
- Alembic migrations for schema changes

SQLite will **not** be introduced because that would violate the repo’s architecture rules.

## 8. Immediate Implementation Target

I will begin with the following complexity-0 slice:

1. **0.1** Align app identity, ports, env defaults, Docker/Compose settings
2. **0.2** Implement persistent `AuditEngagement` CRUD in backend
3. **0.3** Add dashboard summary endpoint and typed frontend dashboard consumption
4. Add backend tests for new repository-backed endpoints

## 9. Definition of Done for v1.3 initial slice

- no primary feature path uses mock data
- backend exposes real `/api/v1` audit endpoints
- frontend dashboard is typed and backed by live API responses
- ports/config match `AGENTS.md`
- migration exists for new tables
- tests cover the new endpoints

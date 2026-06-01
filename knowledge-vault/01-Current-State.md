# Current State

_Last synced: 2026-06-01 · HEAD: `daab5ca4`_

## Summary
DClaw Audit has a substantially implemented audit SaaS platform with a consolidated frontend, full One Convergence design system, and a detailed v1.4 plan incorporating TestForge engineering findings.

## Frontend Consolidation (2026-05-30)
- **`frontend/` directory deleted** — all frontend code now lives in `web/`
- `web/` serves both Vercel (`dclaw-audit-web` project) and Docker/Helm (port 3037, `output: standalone`)
- `web/Dockerfile` builds the image; `docker-compose.yml` `frontend` service points to `./web`
- Helm image name kept as `dclaw-audit-frontend` to avoid registry rename
- One Convergence design: purple `#7030A0`, Raleway/Poppins/Open Sans, pill buttons, light surfaces

## Completed Features

### Backend (FastAPI)
- `AuditEngagement` CRUD + dashboard summary endpoint
- `EvidenceRequest` CRUD + version log
- `Finding` full lifecycle (open → in_progress → remediated → verified), PATCH, severity
- `RemediationPlan` CRUD + AI generation endpoint
- `WorkpaperItem` CRUD, status workflow, preparer/reviewer tracking
- `Control` + control tests + samples, results, exceptions (SOX/ISO/NIST/PCI-DSS mapping)
- `AnomalyTransaction` bulk ingest, statistical/rule-based flagging, review workflow
- `AuditSignal` ingestion (ERP/IAM/cloud), triage workflow
- Intelligence summary + DORA-style metrics + cycle time endpoints
- `ReportTemplate` + saved reports, AI generation, export URL
- `RiskItem` CRUD + AI risk-copilot endpoint
- AI copilot endpoints (`/api/v1/ai/*`)
- Auth middleware (JWT stub; signature verification **NOT YET DONE** — see TF-02)
- Alembic migrations for all models
- 32 test files, 160 pytest cases (integration coverage)

### Frontend (`web/src/`)
- Landing page with hero, features, Roadmap section, AI copilot section (One Convergence)
- `/dashboard` — typed live API calls, summary cards
- `/risk` — risk planning workspace
- `/testing` — control testing page
- `/anomalies` — anomaly detection + review
- `/signals` — signal ingestion + triage
- `/intelligence` — audit intelligence + DORA metrics
- `/controls` — control library + framework mapping
- `/workpapers` — workpaper management
- `/remediation` — remediation plan management
- `/reports` — report builder + AI generation
- `AICopilotSidebar` component (wired; LLM key required for full use)
- `DemoControls` component

### Infra / CI
- `docker-compose.yml`, `helm/`, `.github/workflows/ci.yml`, `claude-code-review.yml`
- `testsprite_tests/` — Testsprite frontend test plan
- `testforge/` — TestForge analysis + tier analysis

## Current Gaps (from PLAN-v1.4.md + TestForge)

| ID | Gap | Priority |
|----|-----|---------|
| TF-01 | `disable_auth=True` is the default — all endpoints public | P0 |
| TF-02 | JWT signature never cryptographically verified | P0 |
| TF-03 | No `AbortController` timeout in `fetchJson` | P0 |
| TF-04 | CORS wildcard `["*"]` with credentials enabled | P0 |
| TF-05 | No rate limiting (`slowapi` absent) | P1 |
| TF-06 | No observability (Sentry, OpenTelemetry absent) | P1 |
| TF-07 | Zero frontend tests (no vitest/jest in `web/package.json`) | P1 |
| — | `dclaw-manifest.json` missing — DPanel registration blocked | P2 |
| — | MinIO upload not confirmed wired despite config presence | P0.3 |

## Source of Truth Docs
- `AGENTS.md`
- `PLAN-v1.4.md` (active plan, supersedes v1.2 and v1.3)
- `PRODUCT-SPEC.md`
- `REVISED-PRD.md`
- `testforge/test_analysis.md`

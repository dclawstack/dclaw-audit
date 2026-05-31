# DClaw Audit

AI-native internal audit platform. Manage engagements, collect evidence, test controls, detect anomalies, and generate reports — all in one system of record.

**API docs:** http://localhost:8037/docs (after `docker compose up`)

---

## What's Inside

| Area | Features |
|------|---------|
| **Engagements** | Full lifecycle CRUD — planned → in_progress → reporting → completed; risk level, owner, audit period |
| **Evidence** | Request tracking with status board, version log, file upload (MinIO), overdue visibility |
| **Findings** | Severity lifecycle (open → remediated → verified), root cause, recommendation, owner, aging |
| **Controls & Frameworks** | SOX / ISO 27001 / NIST / PCI-DSS mapping, gap analysis, control-to-requirement coverage |
| **Risk Register** | Likelihood × impact scoring, residual risk, mitigation notes, status lifecycle |
| **Control Testing** | Test plans, sample selection, pass/fail results, exceptions, reviewer workflow |
| **Workpapers** | Digital workpaper with draft → in_review → approved → archived lifecycle |
| **Remediation Plans** | AI-generated or manual, owner assignment, progress %, status tracking |
| **Anomaly Detection** | Bulk transaction ingestion, rule-based + statistical flags, analyst review queue |
| **Audit Signals** | ERP / IAM / cloud / ticketing signal ingestion, triage, escalation |
| **Intelligence** | Recurring control failure trends, owner responsiveness analytics, cycle time benchmarks |
| **Reports** | Template-based saved reports, AI-generated sections, HTML export |
| **AI Copilot** | Draft evidence requests, brainstorm risks, draft findings, generate remediation plans, prioritize findings, check evidence completeness |
| **Dashboard** | Live KPIs: engagements by status/risk, open findings by severity, aging buckets, overdue evidence |
| **Activity Feed** | Timestamped audit trail for all entity mutations |
| **Demo Mode** | Seed / reset demo data via API for demos and testing |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ · App Router · Tailwind CSS · shadcn/ui components |
| Backend | FastAPI · Pydantic v2 · SQLAlchemy 2.0 (async) · asyncpg |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Object Storage | MinIO (evidence file uploads) |
| AI | OpenRouter (primary) · Ollama (local fallback) — via `ai_service.py` |
| Auth | Logto JWT validation (`LOGTO_ENDPOINT`) — bypassed in dev |
| Deployment | Docker + docker-compose (local / K8s) |
| K8s | Helm chart in `helm/` |

---

## Quick Start (Docker)

### 1. Clone and configure

```bash
git clone https://github.com/dclawstack/dclaw-audit.git
cd dclaw-audit
cp .env.example .env
```

Edit `.env` — set at least one AI key:

```bash
# Option A: OpenRouter (recommended)
OPENROUTER_API_KEY=your-key-here

# Option B: Local Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

Get an OpenRouter key: [openrouter.ai/keys](https://openrouter.ai/keys)

### 2. Start services

```bash
docker compose up --build -d
```

This starts PostgreSQL, Redis, MinIO, the FastAPI backend, and the Next.js frontend.

### 3. Run migrations

```bash
docker compose exec backend alembic upgrade head
```

### 4. (Optional) Seed demo data

```bash
curl -X POST http://localhost:8037/api/v1/demo/seed
```

### 5. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3037 |
| Backend API | http://localhost:8037 |
| Swagger docs | http://localhost:8037/docs |
| MinIO console | http://localhost:9001 (user: `minioadmin`, pw: `minioadmin`) |
| PostgreSQL | `localhost:5435` (user: `postgres`, pw: `postgres`, db: `dclaw_audit`) |
| Redis | `localhost:6379` |

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL, Redis, and MinIO first, then:
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_audit \
REDIS_URL=redis://localhost:6379/0 \
DISABLE_AUTH=true \
  uvicorn app.api.main:app --reload --port 8037
```

Run migrations:
```bash
alembic upgrade head
```

Run tests:
```bash
pytest backend/tests/ -v
```

### Frontend

```bash
cd web
npm install
NEXT_PUBLIC_API_URL=http://localhost:8037 npm run dev
# → http://localhost:3037
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL asyncpg connection string |
| `REDIS_URL` | No | Redis URL (default: `redis://localhost:6379/0`) |
| `OPENROUTER_API_KEY` | One of | OpenRouter key — takes priority over Ollama |
| `OPENROUTER_MODEL` | No | Override OpenRouter model (default: `meta-llama/llama-3.1-8b-instruct`) |
| `OLLAMA_URL` | One of | Local Ollama endpoint (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | No | Ollama model name (default: `llama3.1`) |
| `DISABLE_AUTH` | No | Set `true` to bypass JWT auth in dev (default: `true`) |
| `LOGTO_ENDPOINT` | No | Logto tenant URL — required when `DISABLE_AUTH=false` |
| `LOGTO_AUDIENCE` | No | Logto API audience identifier |
| `SECRET_KEY` | Prod | JWT signing key — **must** be set in production |
| `MINIO_ENDPOINT` | No | MinIO host (default: `localhost:9000`) |
| `MINIO_ACCESS_KEY` | No | MinIO access key (default: `minioadmin`) |
| `MINIO_SECRET_KEY` | No | MinIO secret key (default: `minioadmin`) |
| `MINIO_BUCKET` | No | MinIO bucket name (default: `dclaw-audit-files`) |
| `APP_ENV` | No | `dev` or `production` (default: `dev`) |
| `NEXT_PUBLIC_API_URL` | Yes (frontend) | Backend URL baked at Next.js build time |

---

## API Reference

All endpoints prefixed with `/api/v1`. Full interactive docs at `/docs`.

```
GET  /health/                                    → {"status": "ok"}

# Dashboard
GET  /api/v1/dashboard/summary                   → KPI summary

# Engagements
GET|POST     /api/v1/engagements
GET|PATCH|DELETE /api/v1/engagements/{id}

# Evidence Requests
GET|POST     /api/v1/evidence-requests
GET|PATCH|DELETE /api/v1/evidence-requests/{id}
GET|POST     /api/v1/evidence-requests/{id}/version-log

# Evidence Files
GET|POST     /api/v1/evidence-files
GET|DELETE   /api/v1/evidence-files/{id}
POST         /api/v1/evidence-files/upload       → MinIO upload + metadata

# Findings
GET|POST     /api/v1/findings
GET|PATCH|DELETE /api/v1/findings/{id}

# Controls & Framework Mapping
GET|POST     /api/v1/controls
GET|DELETE   /api/v1/controls/{id}
GET          /api/v1/controls/{id}/with-mappings
GET          /api/v1/controls/gap-analysis       → Coverage gaps per framework
GET|POST     /api/v1/framework-requirements
GET|DELETE   /api/v1/framework-requirements/{id}
GET|POST     /api/v1/control-mappings
GET|DELETE   /api/v1/control-mappings/{id}

# Risk Register
GET|POST     /api/v1/risk-items
GET|PATCH|DELETE /api/v1/risk-items/{id}

# Control Testing
GET|POST     /api/v1/control-tests
GET|PATCH|DELETE /api/v1/control-tests/{id}
GET|POST     /api/v1/control-tests/{id}/samples

# Workpapers
GET|POST     /api/v1/workpapers
GET|PATCH|DELETE /api/v1/workpapers/{id}

# Remediation Plans
GET|POST     /api/v1/remediation-plans
POST         /api/v1/remediation-plans/ai-generate → AI-drafted plan from finding
GET|PATCH|DELETE /api/v1/remediation-plans/{id}

# Anomaly Detection
GET|POST     /api/v1/anomaly-transactions
POST         /api/v1/anomaly-transactions/bulk-ingest
POST         /api/v1/anomaly-transactions/{id}/detect
GET          /api/v1/anomaly-flags
PATCH        /api/v1/anomaly-flags/{id}          → Analyst review

# Audit Signals
GET|POST     /api/v1/audit-signals
GET|PATCH|DELETE /api/v1/audit-signals/{id}
GET          /api/v1/audit-signals/stats/breakdown

# Activity Events
GET|POST     /api/v1/activity-events

# Intelligence
GET          /api/v1/intelligence/summary        → Trends, responsiveness, cycle times

# Reports
GET|POST     /api/v1/report-templates
GET|DELETE   /api/v1/report-templates/{id}
GET|POST     /api/v1/saved-reports
POST         /api/v1/saved-reports/generate      → AI-generated report sections
GET|PATCH|DELETE /api/v1/saved-reports/{id}
GET          /api/v1/saved-reports/{id}/export   → HTML export

# AI Copilot
POST /api/v1/ai/draft-evidence                   → Evidence request list for engagement
POST /api/v1/ai/risk-copilot                     → Key risks, controls, and test ideas
POST /api/v1/ai/draft-finding                    → Draft finding from observation text
POST /api/v1/ai/generate-report                  → Executive summary from engagement data
POST /api/v1/ai/check-evidence-completeness      → Gap analysis on collected evidence
POST /api/v1/ai/prioritize-findings              → Risk-ranked finding list
POST /api/v1/ai/generate-remediation-plan        → AI remediation plan from finding

# Demo
GET          /api/v1/demo/status
POST         /api/v1/demo/seed
DELETE       /api/v1/demo/reset
```

---

## AI Architecture

All LLM calls go through `backend/app/services/ai_service.py`. Routes never import AI providers directly.

**Provider selection order:**
1. `OPENROUTER_API_KEY` → OpenRouter → configured model
2. `OLLAMA_URL` → Ollama (local, for dev)
3. Neither set → `503 Service Unavailable` (AI endpoints return this; non-AI endpoints unaffected)

**7 AI features:**

| # | Endpoint | Trigger | Purpose |
|---|---------|---------|---------|
| 1 | `/ai/draft-evidence` | Button click | Generate evidence request list from audit scope |
| 2 | `/ai/risk-copilot` | Button click | Brainstorm risks, controls, and test ideas |
| 3 | `/ai/draft-finding` | Observation text | Draft structured finding with severity |
| 4 | `/ai/generate-report` | Button click | AI executive summary from engagement data |
| 5 | `/ai/check-evidence-completeness` | Button click | Flag missing evidence against engagement scope |
| 6 | `/ai/prioritize-findings` | Button click | Rank open findings by risk priority |
| 7 | `/ai/generate-remediation-plan` | Finding ID | Draft remediation plan with action items |

AI endpoints return `503` when no provider is configured — non-AI workflows are unaffected.

---

## Project Structure

```
dclaw-audit/
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py       App factory, CORS, auth middleware, router wiring
│   │   │   ├── routes/       health.py
│   │   │   └── v1/           audit, ai, anomalies, risk, activity, signals,
│   │   │                     intelligence, testing, workpapers, remediation,
│   │   │                     report, demo
│   │   ├── core/             config.py, database.py, auth.py, utils.py
│   │   ├── models/           16 SQLAlchemy models (see PRODUCT-SPEC.md)
│   │   └── services/         ai_service.py, demo.py
│   ├── alembic/              Database migrations
│   ├── tests/                pytest-asyncio test suite (32 files, 160 cases)
│   └── requirements.txt
│
├── web/                      Next.js 14 app (Docker + Vercel)
│   └── src/
│       ├── app/
│       │   ├── page.tsx          Landing page
│       │   ├── dashboard/        KPI cards, engagement metrics, finding aging
│       │   ├── controls/         Control library + framework gap analysis
│       │   ├── risk/             Risk register + scoring matrix
│       │   ├── signals/          Audit signal triage
│       │   ├── anomalies/        Transaction anomaly review queue
│       │   ├── remediation/      Remediation plan tracking
│       │   ├── reports/          Report builder + AI generation
│       │   ├── workpapers/       Digital workpaper management
│       │   ├── testing/          Control test plans and results
│       │   └── intelligence/     Cross-engagement analytics
│       ├── components/           AICopilotSidebar, DemoControls, shadcn/ui
│       └── lib/
│           ├── api.ts            Typed API client (30+ functions)
│           └── utils.ts          cn() and utilities
│
├── helm/                     Kubernetes Helm chart
├── docs/                     Getting started and reference docs
├── Infographics/             Architecture and workflow diagrams (Mermaid)
├── slides/                   Presentation deck content
├── testforge/                TestForge audit results and analysis
├── PLAN-v1.4.md              Current roadmap and implementation plan
├── PRODUCT-SPEC.md           Domain models, API spec, screen specs
├── REVISED-PRD.md            Product requirements document v2.3
└── docker-compose.yml        Local development stack (Postgres + Redis + MinIO)
```

---

## Ports

| Service | Port |
|---------|------|
| Frontend | 3037 |
| Backend (API) | 8037 |
| PostgreSQL (Docker) | 5435 (host) → 5432 (container) |
| Redis | 6379 |
| MinIO API | 9000 |
| MinIO Console | 9001 |

---

## Deployment

### Kubernetes (full stack)

```bash
helm install dclaw-audit ./helm -f helm/values.yaml
```

Requires: CloudNativePG operator, a PostgreSQL cluster, Redis, MinIO, and K8s Secrets for `OPENROUTER_API_KEY`, `DATABASE_URL`, `SECRET_KEY`.

### Vercel (frontend / `web/`)

```bash
cd web
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` in Vercel project environment variables to your deployed backend URL.

---

## What's Next

See `PLAN-v1.4.md` for the full roadmap. Current priorities:

1. **Security Sprint (P0)** — flip `DISABLE_AUTH` default, implement JWT signature verification, add request timeout, restrict CORS
2. **Reliability Sprint (P1)** — Sentry observability, `structlog` JSON logging, `slowapi` rate limiting
3. **Test coverage** — frontend vitest setup, backend mutation score from 27% → 50%+
4. **MinIO file upload** — wire evidence file upload endpoint to MinIO bucket
5. **Continuous Auditing (P2)** — real-time control deviation monitoring

---

## Repo Guidance

- Architecture rules: `AGENTS.md`
- Current roadmap: `PLAN-v1.4.md`
- Product definition: `PRODUCT-SPEC.md`
- PRD: `REVISED-PRD.md`
- TestForge audit: `testforge/test_analysis.md`

# DClaw Audit

AI-ready internal audit and compliance workflow software built on the DClaw stack.

## What it does today

DClaw Audit now supports a real PostgreSQL-backed audit workflow foundation:

- audit engagement CRUD
- evidence request tracking with overdue visibility
- finding and remediation lifecycle tracking
- dashboard summary metrics for engagements, requests, findings, severity, and aging
- typed Next.js frontend consuming live FastAPI endpoints
- async SQLAlchemy repositories and Alembic migrations

## Stack

- **Backend:** FastAPI + async SQLAlchemy + PostgreSQL
- **Frontend:** Next.js 14 App Router + Tailwind CSS
- **API base path:** `/api/v1`
- **Backend port:** `8037`
- **Frontend port:** `3037`
- **Database:** `dclaw_audit`

## Current domain models

- `AuditEngagement`
- `EvidenceRequest`
- `Finding`

See `PRODUCT-SPEC.md` for the current canonical product and entity definitions.

## Local development

### Prerequisites

- Python 3.11+
- Node 20+
- PostgreSQL on `localhost:5432`

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.api.main:app --reload --port 8037
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8037 npm run dev -- --port 3037
```

### Docker

```bash
docker compose up --build
```

## Tests and validation

### Backend tests

```bash
python3 -m pytest -q backend/tests
```

### Frontend production build

```bash
cd frontend
npm run build
```

## Current API surface

- `GET /api/v1/engagements`
- `POST /api/v1/engagements`
- `GET /api/v1/engagements/{id}`
- `DELETE /api/v1/engagements/{id}`
- `GET /api/v1/evidence-requests`
- `POST /api/v1/evidence-requests`
- `GET /api/v1/evidence-requests/{id}`
- `DELETE /api/v1/evidence-requests/{id}`
- `GET /api/v1/findings`
- `POST /api/v1/findings`
- `GET /api/v1/findings/{id}`
- `PATCH /api/v1/findings/{id}`
- `DELETE /api/v1/findings/{id}`
- `GET /api/v1/dashboard/summary`

## Repo guidance

- Architecture rules: `AGENTS.md`
- Roadmap: `PLAN-v1.2.md`, `plan_v1.3.md`
- Product definition: `PRODUCT-SPEC.md`
- Human knowledge layer: `knowledge-vault/`
- Graph layer: `graphify-out/`

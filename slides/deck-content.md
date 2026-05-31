# DClaw Audit — Presentation Deck Content

> Source content for slide deck regeneration.
> Version: 1.4 · Updated: 2026-05-31
> Design system: One Convergence Vol. 01 · Dark `#1F2937` · Purple `#7030A0` · Manrope display

---

## Slide 1 — Cover

**Title:** DClaw Audit

**Tagline:** AI-native internal audit. From risk to report.

**Visual:** Dark `#1F2937` hero, app screenshot grid at right  
**Sub-copy:** Evidence collection, control testing, anomaly detection, and AI-assisted findings — in one system of record.

---

## Slide 2 — The Problem

**Headline:** Internal audit teams run on spreadsheets and email

**Three pain points (icon + one-liner each):**

- 📋 **Evidence chaos** — requests scattered across email threads, SharePoint folders, and sticky notes; no version tracking
- 🔍 **Finding lag** — exceptions surface weeks after fieldwork because drafting is manual and slow
- 📊 **No intelligence** — recurring control failures go unnoticed because data lives in per-engagement silos

**Bottom line:** AuditBoard costs enterprise prices. TeamMate runs on-premise. Nothing in the mid-market was built AI-first — or connects evidence → findings → remediation → report in a single workflow.

---

## Slide 3 — The Solution

**Headline:** One system from engagement kickoff to board report

**Visual:** App screenshot grid (3×3) — Dashboard, Controls, AI Copilot sidebar

**Three differentiators:**
1. AI that drafts evidence requests, findings, and remediation plans in seconds — grounded in engagement context
2. Anomaly detection on transaction data before findings are even written
3. Cross-engagement intelligence: recurring failures, owner responsiveness, cycle time benchmarks

---

## Slide 4 — Product Overview (Screen Map)

**Layout:** Hub-and-spoke diagram, feature areas radiating from Dashboard

| Section | Key Value |
|---------|-----------|
| Dashboard | Live KPIs: engagements by status/risk, findings by severity and age, overdue evidence |
| Controls | SOX / ISO 27001 / NIST / PCI-DSS mapping, gap analysis, coverage tracking |
| Risk Register | Likelihood × impact scoring, residual risk, mitigation workflow |
| Anomaly Detection | Bulk transaction ingestion, rule + statistical flags, analyst review queue |
| Audit Signals | ERP / IAM / cloud / ticketing signal triage and escalation |
| Workpapers | Digital workpapers — draft → review → approved → archived |
| Control Testing | Sample-based and automated tests, exception tracking |
| Remediation | AI-generated plans, progress tracking, owner accountability |
| Reports | Template-based AI reports, HTML export |
| Intelligence | Cross-engagement trends, owner analytics, cycle time benchmarks |
| AI Copilot | Sidebar available on every page — draft, brainstorm, prioritize |

---

## Slide 5 — AI Feature Showcase

**Headline:** 7 AI features. Every one triggered by real work, not a demo button.

| # | Feature | How it triggers | Output |
|---|---------|----------------|--------|
| 01 | Evidence Request Drafting | "Draft Evidence" button on engagement | Suggested request list by audit scope |
| 02 | Risk Copilot | "Risk Copilot" button | Key risks, control gaps, test ideas |
| 03 | Finding Drafting | Observation text → "Draft Finding" | Structured finding: title, root cause, severity |
| 04 | Remediation Plan Generation | Finding ID → "Generate Plan" | Action items, owner suggestion, timeline |
| 05 | Evidence Completeness Check | "Check Completeness" button | Flagged gaps against engagement scope |
| 06 | Finding Prioritization | "Prioritize" button on finding list | Risk-ranked order with rationale |
| 07 | Report Generation | Template + engagement → "Generate" | AI-written executive summary and observations |

**Resilience:** All AI endpoints return data without AI if the LLM provider is unavailable. Non-AI workflows are always on.

---

## Slide 6 — Anomaly Detection & Signals

**Headline:** Catch problems before they become findings.

**Left — Anomaly Detection:**
- Bulk import financial transactions (any source, any format via bulk ingest)
- Rule-based + statistical detection runs automatically
- Confidence-scored flags in an analyst review queue
- Analyst workflow: clear, escalate, add notes — feeds directly into findings

**Right — Audit Signals:**
- Ingest signals from ERP, IAM, cloud platforms, and ticketing systems
- Signal triage: new → reviewed → dismissed / escalated
- Link escalated signals directly to engagements or findings
- Signal breakdown by source and type — spot systemic patterns fast

**Net result:** Pre-fieldwork intelligence means auditors arrive with context, not blank notebooks.

---

## Slide 7 — Control Testing & Compliance Mapping

**Headline:** Controls tested. Frameworks covered. Gaps visible.

**Left — Control Testing:**
- Define test plans per engagement: manual, automated, or sample-based
- Sample management: add items, record pass/fail/exception per sample
- Exception tracking → automatic finding creation flow
- Reviewer sign-off workflow before test completion

**Right — Framework Mapping:**
- SOX · ISO 27001 · NIST CSF · PCI-DSS control libraries
- Map each control to one or more framework requirements
- Coverage status: full / partial / planned per requirement
- Gap analysis endpoint: requirements with no full-coverage control flagged instantly

---

## Slide 8 — Technical Architecture

**Headline:** Production-grade stack. Nothing exotic.

```
Browser / Next.js 14 App Router (Port 3037)
        ↓
FastAPI backend (Port 8037)
├── JWT auth middleware (Logto · DISABLE_AUTH for dev)
├── 14 API route modules  →  135 endpoints
│   └── Services layer
│       └── ai_service.py  ← unified LLM gateway
│           ├── OpenRouter (primary)
│           └── Ollama / local (dev fallback)
├── Repository layer → PostgreSQL 16 (16 tables)
├── Redis 7  ← rate limiting / caching
└── MinIO    ← evidence file storage
```

**Stack badges (two rows):**
Row 1: Next.js 14 · FastAPI · PostgreSQL 16 · SQLAlchemy 2.0  
Row 2: Pydantic v2 · Redis 7 · MinIO · Alembic · Docker · Helm

---

## Slide 9 — Deployment Options

**Headline:** Local in 3 commands. Kubernetes ready.

**Option A — Docker (local / CI):**
```bash
cp .env.example .env              # add OPENROUTER_API_KEY
docker compose up --build -d      # Postgres + Redis + MinIO + API + Frontend
docker compose exec backend alembic upgrade head
# → http://localhost:3037
```

**Option B — Kubernetes (production):**
```bash
helm install dclaw-audit ./helm -f helm/values.yaml
# CloudNativePG + K8s Secrets for OPENROUTER_API_KEY, DATABASE_URL, SECRET_KEY
```

**Option C — Vercel (cloud frontend):**
```bash
cd web && vercel --prod
# Set NEXT_PUBLIC_API_URL to deployed backend
```

---

## Slide 10 — Intelligence Layer

**Headline:** Audit data that thinks across engagements.

**Three intelligence views from `/api/v1/intelligence/summary`:**

**Recurring Control Failures**
- Which controls fail most often across all engagements?
- Shows total tests, failed tests, and failure rate per control
- Identifies systemic weaknesses vs one-off exceptions

**Owner Responsiveness**
- Which evidence request owners are slowest to respond?
- Average days open, overdue count, and responsiveness score per owner
- Drives accountability conversations with stakeholders

**Cycle Time Benchmarks**
- How long do engagements stay open?
- How many findings are still open vs total findings?
- Days open per engagement — normalised for comparison

---

## Slide 11 — Demo Data

**Seeded via:** `POST /api/v1/demo/seed`  
**Reset via:** `DELETE /api/v1/demo/reset`

**Seeded entities (representative demo):**
- Multiple audit engagements across status lifecycle (planned → completed)
- Evidence requests with mixed statuses — some overdue
- Findings at each severity level with remediation plans
- Control library with SOX + ISO 27001 mappings and deliberate gaps
- Anomaly transactions with flagged outliers for analyst review
- Audit signals from ERP and IAM sources
- Workpapers in various stages of review

**Designed to showcase:**
- Gap analysis (controls with missing requirements)
- Anomaly review queue (flagged transactions ready for analysis)
- Intelligence trends (recurring failures visible across seeded engagements)
- AI Copilot (works best with seeded engagement context)

---

## Slide 12 — Roadmap

**Headline:** Shipped: full P0/P1 feature set. Next: hardening → continuous auditing.

**Phase 1 — Security & Reliability Hardening (Now)**
- Security: flip auth default, implement JWT signature verification, CORS restriction
- Reliability: Sentry observability, `structlog` logging, `slowapi` rate limiting
- Test coverage: frontend vitest, backend mutation score 27% → 50%+

**Phase 2 — Platform Depth (Next 4–6 weeks)**
- MinIO evidence file upload fully wired end-to-end
- Product analytics (PostHog) for feature adoption tracking
- `dclaw-manifest.json` for DPanel registration
- Accessibility pass (61/100 → 80+)

**Phase 3 — Agentic Auditing (Following quarter)**
- Continuous auditing: real-time control deviation monitoring with automated alerts
- Fraud detection: pattern-based investigation workflow
- Bank / ERP connector: streaming ingestion via Temporal.io
- Benchmarking: anonymised cross-tenant control failure comparisons

---

## Slide 13 — Call to Action / Links

**Headline:** Full audit workflow. Running in minutes.

| Resource | Link |
|----------|------|
| GitHub | https://github.com/dclawstack/dclaw-audit |
| API docs | http://localhost:8037/docs |
| Roadmap | `PLAN-v1.4.md` |
| Product spec | `PRODUCT-SPEC.md` |
| Architecture diagrams | `Infographics/architecture-diagram.md` |

**Quick start:**
```bash
git clone https://github.com/dclawstack/dclaw-audit
cp .env.example .env   # add your OpenRouter key
docker compose up --build -d
docker compose exec backend alembic upgrade head
curl -X POST http://localhost:8037/api/v1/demo/seed
# → http://localhost:3037
```

---

## Design Notes (for deck builder)

**Colours:**
- Primary dark: `#1F2937` (gray-800 — identity colour)
- Accent purple: `#7030A0`
- Background: `#FFFFFF`
- Positive/pass: `#10B981` (emerald)
- Negative/fail: `#EF4444` (red)
- Warning/exception: `#F59E0B` (amber)
- Low-risk: `#6B7280` (gray-500)

**Fonts:**
- Display headings: Manrope 700
- Body: Inter 400/500
- Code snippets: JetBrains Mono

**Corner radius:** 2px (sharp — One Convergence design system)

**Status badge palette:**
- planned: gray · in_progress: blue · reporting: amber · completed: green
- critical: red · high: orange · medium: amber · low: gray
- flagged: red · reviewed: blue · cleared: green · escalated: purple

**Chart palette:**
- Engagements: `#7030A0` (purple)
- Findings: `#EF4444` (red)
- Resolved: `#10B981` (emerald)
- Risk score: heatmap from `#10B981` (low) → `#EF4444` (critical)

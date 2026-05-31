# DClaw Audit — Implementation Plan v1.4

> **Supersedes:** PLAN-v1.2.md  
> **Aligned with:** REVISED-PRD v2.3  
> **Informed by:** TestForge analysis `testforge/test_analysis.md` (run `gen_mpts0irp`, 2026-05-31)  
> **Date:** 2026-05-31

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.2 | 2026-05-16 | Initial feature roadmap, P0–P2 features, 8-week schedule |
| v1.4 | 2026-05-31 | Security hardening sprint added as pre-condition; JWT gap, CORS, timeout, observability, rate limiting, frontend test infra extracted from TestForge failure analysis and front-loaded into roadmap |

> Note: v1.3 was skipped — this plan incorporates changes from both the PRD v2.3 gap review and the TestForge engineering audit simultaneously.

---

## Pre-Flight Checklist

- [ ] `web/package-lock.json` committed after any `npm install`
- [ ] `web/next-env.d.ts` exists and committed
- [ ] `docker-compose.yml` healthchecks correct and passing
- [ ] `web/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] `DISABLE_AUTH=false` set in all non-dev `.env` files and K8s Secrets
- [ ] `backend/requirements.txt` includes `python-jose[cryptography]` and `slowapi`
- [ ] No hardcoded secrets — `secret_key` not using default `"change-me-in-production"`
- [ ] `frontend/public/dclaw-manifest.json` created for DPanel registration
- [ ] Sentry DSN wired in both backend and frontend before first production deploy

---

## 1. Current State Assessment

### 1.1 Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| `web/` (Next.js 14) | ✅ | App Router, Tailwind, shadcn/ui, One Convergence design |
| `backend/` (FastAPI) | ✅ | SQLAlchemy 2.0, Pydantic v2, asyncpg |
| `backend/tests/` | ✅ | 32 files, 160 pytest cases — integration coverage |
| `web/` tests | ❌ | Zero test files; no test runner in `package.json` |
| `alembic/` | ✅ | Migrations present |
| `docker-compose.yml` | ✅ | Local dev stack |
| `helm/` | ✅ | K8s deployment manifests |
| `.github/workflows/` | ✅ | CI/CD present |
| `dclaw-manifest.json` | ❌ | Missing — DPanel registration blocked |
| Observability (APM/errors) | ❌ | No Sentry, OpenTelemetry, or equivalent |
| Auth (production-grade) | ❌ | `disable_auth=True` by default; JWT not signature-verified |
| Rate limiting | ❌ | No middleware present |
| Product analytics | ❌ | No PostHog/Segment/Amplitude |

### 1.2 Feature Maturity

| Tier | Status |
|------|--------|
| P0 Foundation (CRUD, findings, evidence, controls) | Partially implemented |
| P1 Platform (remediation, workpapers, anomalies, signals, intelligence) | Partially implemented |
| P2 Vertical (continuous auditing, fraud detection, benchmarking) | Not started |

### 1.3 Test Coverage Summary (TestForge)

| Dimension | Score | Action Needed |
|-----------|-------|---------------|
| Security | 0/100 (all false positives — see §2) | Reconfigure scanner; fix real auth issues |
| Mutation | 27/100 | Improve assertion specificity in backend tests |
| Unit Tests | 67/100 | Add frontend test runner; increase backend coverage |
| DORA | 25/100 | Add observability; wire test framework to CI |
| Accessibility | 61/100 | Address ARIA gaps in JSX components |
| Dead Code | 57/100 | Audit unused exports in `web/src/` |
| Property-Based | 50/100 | Add hypothesis tests for risk scoring and scoring utilities |

---

## 2. TestForge Validated Findings

> The following are **confirmed product-level defects** extracted from `testforge/test_analysis.md`. Items excluded: the 554 XSS findings (all false positives against `web/node_modules/object-hash` — scanner treats a stream `write()` helper as an XSS DOM sink; no HTML rendering context exists); Kubernetes N/A and Load N/A (scanner blind spots, not product defects); Tier-2 synthetic test results (tests validate inline stubs, not live application code, and their pass/fail status is not meaningful for product quality).

---

### [CRITICAL] TF-01 — Auth Disabled by Default in All Environments

**File:** `backend/app/core/config.py:18`

**Observed behavior:** `disable_auth: bool = True` is the hardcoded default. Any deployment where `DISABLE_AUTH=false` is not explicitly set in `.env` or K8s Secrets ships with all 135 API endpoints publicly accessible. The `AuthMiddleware` and `get_current_user` dependency both short-circuit to an admin stub when this flag is true.

**Product impact:** Critical data exposure risk. All audit engagements, findings, evidence requests, workpapers, and anomaly data are readable and writable without credentials. Audit trails (activity events) can be forged. The flag's intent as a dev convenience has leaked into the production default.

**Affected files:** `config.py:18`, `auth.py:50–51`, `auth.py:92–95`

**Remediation:**
1. Change default to `disable_auth: bool = False` in `config.py`.
2. Add `DISABLE_AUTH=true` to `.env.example` and `docker-compose.yml` (dev only).
3. Add a startup assertion: if `disable_auth is True` and `app_env != "dev"`, raise `RuntimeError` on startup rather than silently serving unauthenticated data.

**Priority:** P0 — must fix before any non-local deployment.

---

### [CRITICAL] TF-02 — JWT Signature Is Never Cryptographically Verified

**File:** `backend/app/core/auth.py:36–79`

**Observed behavior:** `_decode_jwt_payload()` performs only base64 decoding of the JWT payload. JWKS keys are fetched and cached (`_fetch_jwks`, lines 24–33) but are never used to verify the token's cryptographic signature. The `get_current_user` dependency checks `exp` and `aud` claims, but both are trivially forgeable without signature verification. `python-jose[cryptography]` is absent from `requirements.txt`.

**Product impact:** With `DISABLE_AUTH=false`, any user who knows the expected `aud` value can craft a JWT with arbitrary claims (e.g., `"roles": ["admin"]`), sign it with any key, and pass all auth checks. Full privilege escalation is possible without valid Logto credentials.

**Affected files:** `auth.py:36–79`, `requirements.txt`

**Remediation:**
1. Add `python-jose[cryptography]>=3.3.0` to `requirements.txt`.
2. Replace `_decode_jwt_payload` with `jose.jwt.decode()` using the fetched JWKS:
   ```python
   from jose import jwt, JWTError
   payload = jwt.decode(
       token, keys,
       algorithms=["RS256", "ES256"],
       audience=settings.logto_audience or None,
   )
   ```
3. Remove the bare base64 decode helper entirely once above is in place.
4. Update backend tests in `tests/conftest.py` to generate properly signed test JWTs when `DISABLE_AUTH=false`.

**Priority:** P0 — must fix before any non-local deployment.

---

### [HIGH] TF-03 — No Request Timeout in Frontend API Client

**File:** `web/src/lib/api.ts:12–32`

**Observed behavior:** `fetchJson<T>()` wraps all 30+ API calls with bare `fetch()` — no `AbortController`, no `signal`, no timeout. Under backend slowness or connection saturation (the predicted bottleneck is the DB connection pool per the Agentic analysis), all outstanding API calls accumulate as hanging promises with no rejection.

**Product impact:** UI freezes silently. Dashboard, findings, evidence, workpaper, and anomaly pages all stall with no loading timeout, no error message, no retry. User sees a spinner indefinitely.

**Affected files:** `web/src/lib/api.ts:14` (all 30+ callers inherit the same path)

**Remediation:**
```typescript
const DEFAULT_TIMEOUT_MS = 15_000;

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
    // ... existing body
  } finally {
    clearTimeout(timer);
  }
}
```
Zero interface change at call sites. Callers needing custom timeouts can pass `signal` via `options`.

**Priority:** P0 — reliability regression on every page under any backend degradation.

---

### [HIGH] TF-04 — CORS Wildcard with Credentials Enabled

**File:** `backend/app/api/main.py:26–31`

**Observed behavior:** `allow_origins=["*"]` combined with `allow_credentials=True`. Per CORS spec, browsers reject this combination for credentialed requests — but the intent is to allow any origin. In practice once auth is enabled, this allows any web page a user is browsing to make authenticated cross-origin requests to the API using the user's credentials.

**Product impact:** CSRF-equivalent exposure — malicious third-party pages can exfiltrate audit data or forge findings/evidence in the name of an authenticated user.

**Affected files:** `backend/app/api/main.py:26–31`, `backend/app/core/config.py`

**Remediation:**
1. Add `allowed_origins: list[str] = ["http://localhost:3037"]` to `config.py`.
2. Change `allow_origins=["*"]` to `allow_origins=settings.allowed_origins`.
3. Document production value in `.env.example` and Helm `values.yaml`.

**Priority:** P0 — fix alongside TF-01 and TF-02 in the same security sprint.

---

### [HIGH] TF-05 — No Auth Endpoint Rate Limiting

**File:** `backend/app/api/main.py`, `backend/requirements.txt`

**Observed behavior:** `slowapi`, `fastapi-limiter`, and any rate-limiting library are absent. No middleware registers per-IP or per-user attempt budgets anywhere in the application. All 135 endpoints — including any future `/auth/token` or `/auth/refresh` — accept unlimited requests.

**Product impact:** Brute-force attacks on auth endpoints; AI agent token-refresh storms that produce 2× load amplification (flagged in Agentic analysis); potential DoS via unauthenticated bulk-ingest endpoint (`/api/v1/anomaly-transactions/bulk-ingest`).

**Affected files:** `requirements.txt`, `backend/app/api/main.py`

**Remediation:**
1. Add `slowapi>=0.1.9` to `requirements.txt`.
2. Register `Limiter` in `main.py` with `key_func=get_remote_address`.
3. Apply `@limiter.limit("5/minute")` to any auth/token endpoints.
4. Apply `@limiter.limit("60/minute")` to AI endpoints (`/api/v1/ai/*`) — highest per-agent call volume.
5. Apply `@limiter.limit("10/minute")` to the bulk-ingest endpoint.

**Priority:** P1 — needed before any public or multi-user deployment.

---

### [HIGH] TF-06 — No Observability Stack (Crashes Are Silent)

**Observed behavior:** Neither `backend/requirements.txt` nor `web/package.json` include Sentry, OpenTelemetry, Datadog, or any equivalent. Unhandled FastAPI exceptions surface as generic 500 responses with no correlation ID, no stack trace in a monitoring system, no alert.

**Product impact:** MTTR is undefined — there is no mechanism to detect incidents before users report them. DORA score of 25/100 is driven primarily by this gap.

**Affected files:** `backend/requirements.txt`, `web/package.json`, `backend/app/api/main.py`, `web/src/app/layout.tsx`

**Remediation:**
1. Add `sentry-sdk[fastapi]>=1.40.0` to `requirements.txt`.
2. Add `"@sentry/nextjs": "^8"` to `web/package.json`.
3. Initialize in `main.py`: `sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1)`.
4. Add `SENTRY_DSN` to `.env.example` and K8s Secrets template.
5. Add structured JSON logging via `structlog` (already required by PRD Python Rules §4.1 — `no print()`).

**Priority:** P1 — blocks MTTR and incident response capability.

---

### [MEDIUM] TF-07 — Frontend Has Zero Tests

**Observed behavior:** `web/package.json` has no `vitest`, `jest`, or `playwright`. The TestForge Tier-2 tests are synthetic scaffolds (they write and test their own inline implementations — they do not import or exercise any file in `web/src/`). Frontend regression is currently undetectable.

**Product impact:** Any refactor to `fetchJson`, API type contracts, or UI component logic has no safety net. The 27/100 mutation score is exclusively a backend metric; the frontend mutation score is undefined.

**Affected files:** `web/package.json`

**Remediation:**
1. Add `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event` as dev dependencies.
2. Minimum initial test targets:
   - `web/src/lib/api.ts` — `fetchJson` error handling, 204 return behavior, timeout abort
   - `web/src/lib/utils.ts` — utility function contracts
   - One component smoke test confirming the dashboard renders without crashing
3. Add `"test": "vitest run"` to `package.json` scripts and wire into CI.

**Priority:** P1 — prerequisite to improving DORA and mutation scores.

---

### [MEDIUM] TF-08 — Mutation Score 27/100 (Backend Tests Assert Status, Not Values)

**Observed behavior:** 34,599 mutants generated; 9,341 killed (27%). Backend tests in `test_audit.py` are integration-style and assertion-heavy on HTTP status codes and top-level field presence, but mutations to computed values (severity calculations, risk score derivations, status transition logic) survive.

**Product impact:** Logic regressions in risk scoring, finding lifecycle transitions, and anomaly flag severity calculations will not be caught by the test suite before they reach production.

**Affected files:** `backend/tests/test_audit.py` and all test files

**Remediation:**
1. Add value-specific assertions to existing tests: `assert finding["severity"] == "high"` is not sufficient if severity derivation is tested — assert the exact computed value changes when inputs change.
2. Add dedicated unit tests for: `risk_score = likelihood × impact` calculation (currently no test for this), finding status transition guards (open → remediated without in_progress should be blocked or allowed — is this intentional?), anomaly flag confidence score bounds.
3. Target: raise mutation score to ≥50% before v1.4 ships.

**Priority:** P2 — improves regression safety over time; not a blocking defect.

---

### [MEDIUM] TF-09 — Missing Edge Case Tests for Boundary Conditions

**Observed behavior:** 52 potential edge cases identified by TestForge. The following are confirmed absent from `backend/tests/test_audit.py` and represent real failure modes:

1. `PATCH /api/v1/findings/{id}` with unknown ID — should 404, not 500
2. `POST /api/v1/engagements` with missing required fields — confirm 422 error messages do not leak schema internals
3. `GET /api/v1/dashboard/summary` with zero data — confirm all numerics default to `0`, `recent_*` to `[]`, not `null`
4. Concurrent `POST /api/v1/anomaly-transactions/bulk-ingest` — test idempotency under duplicate `batch_id`
5. `fetchJson` 204 response on non-DELETE call — `api.ts:27–29` returns `undefined as T`; callers may null-deref

**Priority:** P2 — quality improvement, not blocking.

---

### [LOW] TF-10 — TestForge Scanner Excludes node_modules

**Observed behavior:** The scanner ingested `web/node_modules/` (7,771 files analyzed) and flagged 554 findings there, drowning out genuine application findings. The Security score of 0/100 is entirely driven by this noise.

**Product impact:** False confidence — the 0/100 Security score is alarming but meaningless. Real application-code security issues (TF-01 through TF-04) are not surfaced by the scanner's Python/Go analysis path.

**Remediation:** Add `web/node_modules/` and `web/.next/` to TestForge scanner exclusion config before next scan.

**Priority:** Low — configuration fix, no code change.

---

## 3. Feature Roadmap (Updated)

### P0 — Foundation (Demo-Ready, Must Ship)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| P0.0 | **Security & Reliability Hardening** | ❌ Not done | TF-01 through TF-04 (auth, JWT, CORS, timeout) — new; must precede all feature work |
| P0.1 | **AI Audit Copilot** | Partial | Backend AI endpoints exist; frontend copilot sidebar exists; LLM key required for full test |
| P0.2 | **Audit Planning / Risk-Based Scoping** | Partial | Risk items, engagement CRUD implemented; AI risk-copilot endpoint exists |
| P0.3 | **Evidence Management** | Partial | Evidence request CRUD + version log done; file upload (MinIO) not confirmed wired |
| P0.4 | **Finding Tracking** | ✅ | Full lifecycle (open → remediated → verified), PATCH, severity — done |

### P1 — Platform (v1.1–1.2)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| P1.0 | **Observability + Rate Limiting** | ❌ Not done | TF-05 and TF-06 — Sentry, structlog, slowapi |
| P1.1 | **Remediation Management** | ✅ | Remediation plan CRUD + AI generation done |
| P1.2 | **Audit Analytics / Intelligence** | ✅ | Intelligence summary, DORA-style metrics, cycle time done |
| P1.3 | **Workpaper Management** | ✅ | CRUD, status workflow, preparer/reviewer done |
| P1.4 | **Control Testing Automation** | ✅ | Control tests + samples, results, exceptions done |
| P1.5 | **Anomaly Detection** | ✅ | Bulk ingest, statistical/rule-based flags, review workflow done |
| P1.6 | **Audit Signals** | ✅ | Signal ingestion (ERP/IAM/cloud), triage workflow done |
| P1.7 | **Compliance Framework Mapping** | ✅ | SOX/ISO/NIST/PCI-DSS mapping + gap analysis done |
| P1.8 | **Report Generation** | ✅ | Templates, saved reports, AI generation, export URL done |
| P1.9 | **Frontend Test Infrastructure** | ❌ Not done | TF-07 — vitest + @testing-library/react; zero frontend tests |
| P1.10 | **Product Analytics** | ❌ Not done | TF (Vision) — PostHog or equivalent; user journey telemetry absent |

### P2 — Vertical / Scale (v1.3+)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| P2.1 | **Continuous Auditing** | Not started | Real-time control monitoring |
| P2.2 | **Fraud Detection** | Not started | Pattern detection + investigation workflow |
| P2.3 | **Benchmarking** | Not started | Industry peer comparison |
| P2.4 | **Executive Reporting** | Not started | Board-ready reports, narrative optimization |
| P2.5 | **DPanel Manifest** | ❌ Not done | `frontend/public/dclaw-manifest.json` missing (PRD §3 gap) |

---

## 4. Implementation Priority & Updated Schedule

> Previous plan: 8 weeks, feature-first. Updated: insert a 2-week Security & Reliability Sprint before feature work continues. Net schedule extends by 2 weeks.

### Week 1 — Security Sprint (P0.0, TF-01 through TF-04)

**Goal: No production deployment until this is complete.**

| Task | File(s) | Owner Signal |
|------|---------|-------------|
| Flip `disable_auth` default to `False`; add startup guard | `config.py:18`, `auth.py` | Blocks all prod deploys |
| Implement JWT signature verification via `python-jose` | `auth.py:36–79`, `requirements.txt` | Replaces bare base64 decode |
| Update `tests/conftest.py` to sign test tokens | `backend/tests/conftest.py` | Unblocks test suite after auth fix |
| Add `AbortController` timeout to `fetchJson` | `web/src/lib/api.ts:14` | 15s default, zero API surface change |
| Restrict CORS to explicit origin list via config | `main.py:26–31`, `config.py` | Add to `.env.example` |

### Week 2 — Reliability Sprint (P1.0, TF-05 through TF-06)

| Task | File(s) | Owner Signal |
|------|---------|-------------|
| Add `sentry-sdk[fastapi]` + initialize in `main.py` | `requirements.txt`, `main.py` | Crash visibility from day 1 |
| Add `@sentry/nextjs` + `sentry.client.config.ts` | `web/package.json`, `web/` | Frontend error tracking |
| Add `structlog` JSON logging throughout backend | `requirements.txt`, all service files | Replace any `print()` calls |
| Add `slowapi` with per-IP limits on AI + future auth routes | `requirements.txt`, `main.py` | 5/min auth, 60/min AI |
| Add `vitest` + first 3 frontend unit tests | `web/package.json`, `web/src/lib/api.test.ts` | Unblocks frontend mutation scoring |

### Week 3–4 — AI Audit Copilot + Risk Planning (P0.1, P0.2)

Existing backend endpoints exist (`/api/v1/ai/*`, `/api/v1/risk-items`). Focus:
- Confirm AICopilotSidebar wires to all page contexts (not just dashboard)
- LLM fallback to local Ollama when `openrouter_api_key` is empty (PRD §9)
- Evidence analysis pipeline (RAG over evidence vault, PRD §9)
- Risk matrix visualization on frontend risk page

### Week 5–6 — Evidence Management + Finding Tracking Polish (P0.3, P0.4)

Existing CRUD is done. Focus:
- Wire MinIO file upload endpoint; confirm `upload_dir` and `minio_bucket` config
- Evidence completeness checking (AI validation per PRD P0.3)
- Finding aging reports and overdue surfacing on dashboard
- Version log display in evidence request detail view

### Week 7–8 — Mutation Score + Edge Cases (TF-08, TF-09)

| Task | Target |
|------|--------|
| Add value-specific assertions to `test_audit.py` | Raise mutation score from 27% → ≥50% |
| Add 404/422/empty-state edge case tests | TF-09 items 1–4 |
| Fix `fetchJson` 204 on non-DELETE (TF-09 item 5) | `api.ts:27–29` |
| Add `hypothesis` property-based tests for risk scoring | `backend/tests/test_risk_scoring.py` |

### Week 9–10 — Platform Completeness (P1.9, P1.10, P2.5)

| Task | Notes |
|------|-------|
| Add PostHog (or equivalent) to frontend | Track: signup, first engagement created, first finding, report exported, anomaly reviewed |
| Create `frontend/public/dclaw-manifest.json` | Unblocks DPanel registration (PRD §3 gap) |
| Accessibility audit pass | Address 37 flagged issues (61/100 score); focus ARIA labels on modal dialogs, form inputs |
| Dead code cleanup in `web/src/` | 57/100 dead code score — audit unused exports |

### Week 11–12 — P2 Vertical Features

P2.1 Continuous Auditing (real-time control deviation alerts), P2.2 Fraud Detection patterns. Architecture for both likely requires Temporal.io (PRD §4 stack) for durable workflows — evaluate before committing.

---

## 5. Sacred Architecture Constraints (Non-Negotiable, from PRD §4)

| Layer | Required | Current Status |
|-------|----------|----------------|
| Auth | Logto + JWT validation | ❌ JWT not verified (TF-02) |
| Monitoring | Prometheus + Grafana | ❌ Not wired |
| Logging | `structlog` JSON | ❌ Using `print()` in places |
| Rate Limiting | Per-endpoint (slowapi/Redis) | ❌ Absent (TF-05) |
| Error Tracking | Sentry minimum | ❌ Absent (TF-06) |
| Object Storage | MinIO | ⚠️ Configured but not confirmed wired for uploads |
| CORS | Explicit origin list, never wildcard | ❌ Wildcard (TF-04) |
| Secrets | `.env.example` + K8s Secrets, no hardcoded | ❌ `secret_key` defaults to `"change-me-in-production"` |

---

## 6. Definition of Done (v1.4 Ship Gate)

A build is **not production-deployable** until all of the following pass:

- [ ] `DISABLE_AUTH=false` is default; startup guard raises on `app_env=production` + `disable_auth=True`
- [ ] JWT tokens are signature-verified via `python-jose` + JWKS
- [ ] `fetchJson` has 15-second abort timeout
- [ ] CORS `allow_origins` is not `["*"]`; value sourced from config
- [ ] Sentry initialized in both backend and frontend
- [ ] `slowapi` registered; AI and bulk-ingest endpoints rate-limited
- [ ] All backend tests pass with `DISABLE_AUTH=false`
- [ ] At least 3 frontend unit tests passing via `vitest`
- [ ] `dclaw-manifest.json` present at `frontend/public/dclaw-manifest.json`
- [ ] No `print()` calls in backend — `structlog` only
- [ ] `secret_key` has no default value (must be set via env)

---

## 7. Risks & Watch Items

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| JWT fix breaks test suite (conftest doesn't issue signed tokens) | High | Address in Week 1 — update conftest simultaneously with auth.py |
| Logto not configured in staging → `disable_auth=True` temptation returns | Medium | Startup guard (§ TF-01 remediation) is the enforcement mechanism |
| MinIO file upload not functional despite config presence | Medium | Spike in Week 5 before building UI — don't build upload UI against an untested backend |
| Temporal.io adoption for P2 features adds significant complexity | Medium | Defer decision to Week 10 — validate with a spike before committing |
| Accessibility score (61/100) requires design review, not just code changes | Low | Schedule a design pass in Week 9 before implementing fixes |

---

*Plan version: 1.4 · Based on PRD v2.3 · TestForge run `gen_mpts0irp` · 2026-05-31*

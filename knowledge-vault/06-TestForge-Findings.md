# TestForge Findings

_Run ID: `gen_mpts0irp` · Date: 2026-05-31 · Source: `testforge/test_analysis.md`_

## Score Summary

| Dimension | Score | Status |
|-----------|-------|--------|
| Security | 0/100 | False positives (scanner hit node_modules) — not real |
| Mutation | 27/100 | Backend only; frontend undefined |
| Unit Tests | 67/100 | Backend good; frontend has zero tests |
| DORA | 25/100 | No observability — MTTR undefined |
| Accessibility | 61/100 | ARIA gaps in JSX modal/form components |
| Dead Code | 57/100 | Unused exports in `web/src/` |
| Property-Based | 50/100 | No hypothesis tests for risk/scoring |

## Confirmed Defects (sorted by priority)

### [CRITICAL] TF-01 — Auth Disabled by Default
- **File:** `backend/app/core/config.py:18`
- **Issue:** `disable_auth: bool = True` — every endpoint is public unless explicitly overridden
- **Fix:** Change default to `False`; add startup guard; set `DISABLE_AUTH=true` in `.env.example` only

### [CRITICAL] TF-02 — JWT Signature Never Verified
- **File:** `backend/app/core/auth.py:36–79`
- **Issue:** JWKS fetched but never used — only base64 decode; any forged JWT passes
- **Fix:** `jose.jwt.decode()` with JWKS keys + `RS256`/`ES256`; add `python-jose[cryptography]` to `requirements.txt`

### [HIGH] TF-03 — No Request Timeout in `fetchJson`
- **File:** `web/src/lib/api.ts:14`
- **Issue:** Bare `fetch()` — UI freezes indefinitely under backend slowness
- **Fix:** `AbortController` + 15s `setTimeout`; zero interface change at call sites

### [HIGH] TF-04 — CORS Wildcard + Credentials
- **File:** `backend/app/api/main.py:26–31`
- **Issue:** `allow_origins=["*"]` + `allow_credentials=True` — CSRF-equivalent exposure
- **Fix:** `allowed_origins: list[str]` in config; never wildcard when credentials enabled

### [HIGH] TF-05 — No Rate Limiting
- **File:** `backend/app/api/main.py`, `requirements.txt`
- **Issue:** `slowapi` absent; all 135 endpoints unlimited; AI endpoints vulnerable to agent storms
- **Fix:** `slowapi` with 5/min on auth, 60/min on AI, 10/min on bulk-ingest

### [HIGH] TF-06 — No Observability
- **Files:** `requirements.txt`, `web/package.json`
- **Issue:** No Sentry, OpenTelemetry, structlog — crashes are silent
- **Fix:** `sentry-sdk[fastapi]` + `@sentry/nextjs` + `structlog` JSON logging

### [MEDIUM] TF-07 — Zero Frontend Tests
- **File:** `web/package.json`
- **Issue:** No vitest/jest; frontend mutation score undefined; no safety net
- **Fix:** Add vitest + @testing-library/react; target api.ts, utils.ts, dashboard smoke test

### [MEDIUM] TF-08 — Mutation Score 27/100
- **Issue:** 34,599 mutants; only 9,341 killed — tests assert status codes, not computed values
- **Fix:** Value-specific assertions; unit tests for risk_score = likelihood × impact; target ≥50%

### [MEDIUM] TF-09 — Missing Edge Case Tests
- Key missing: PATCH finding with unknown ID → 404; POST engagement with missing fields → 422; GET summary with zero data → all zeros not null; `fetchJson` 204 on non-DELETE (returns `undefined as T`)

### [LOW] TF-10 — Scanner Includes node_modules
- **Issue:** 554 false positives from `web/node_modules/`; Security score of 0/100 is noise
- **Fix:** Add `web/node_modules/` and `web/.next/` to TestForge scanner exclusions

## Notes on False Positives
The 0/100 Security score is **not real** — scanner flagged a stream `write()` helper in `object-hash` (inside `node_modules`) as an XSS DOM sink. Real application-level security issues are TF-01 through TF-04, none of which were surfaced by the scanner.

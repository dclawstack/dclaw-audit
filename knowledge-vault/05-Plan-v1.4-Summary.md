# Plan v1.4 Summary

_Full plan: `PLAN-v1.4.md` · Date: 2026-05-31 · Supersedes PLAN-v1.2.md and plan_v1.3.md_

## Why v1.4 Exists
PLAN-v1.4 was created after two simultaneous inputs:
1. PRD v2.3 gap review (workpapers, remediation, evidence upload, auth, AI enhancements)
2. TestForge engineering audit (`testforge/test_analysis.md`) — surfaced critical security and reliability defects

## Schedule (12 Weeks)

| Weeks | Focus | Key Items |
|-------|-------|-----------|
| 1 | Security Sprint (P0) | Fix auth default, JWT sig verify, CORS, fetchJson timeout |
| 2 | Reliability Sprint (P1) | Sentry, structlog, slowapi, vitest setup |
| 3–4 | AI Copilot + Risk Planning | Wire AICopilotSidebar to all pages, LLM fallback, RAG |
| 5–6 | Evidence + Finding Polish | MinIO upload wire, evidence completeness AI, aging reports |
| 7–8 | Mutation + Edge Cases | Raise mutation score 27% → ≥50%, fix fetchJson 204 bug |
| 9–10 | Platform Completeness | PostHog, dclaw-manifest.json, accessibility, dead code |
| 11–12 | P2 Vertical Features | Continuous auditing (Temporal.io), fraud detection patterns |

## P0 Blockers (nothing ships without these)
- TF-01: `disable_auth=False` as default + startup guard
- TF-02: JWT signature verification via `python-jose[cryptography]`
- TF-03: `AbortController` 15s timeout in `fetchJson` (`web/src/lib/api.ts:14`)
- TF-04: CORS restricted to explicit origin list (not `["*"]`)

## Feature Status (as of HEAD `daab5ca4`)

**P0 Foundation**
- P0.0 Security & Reliability Hardening — ❌ Not done
- P0.1 AI Audit Copilot — Partial (backend done; LLM key required)
- P0.2 Risk-Based Scoping — Partial (CRUD done; AI risk-copilot exists)
- P0.3 Evidence Management — Partial (CRUD + version log; MinIO upload unconfirmed)
- P0.4 Finding Tracking — ✅ Full lifecycle done

**P1 Platform**
- P1.0 Observability + Rate Limiting — ❌ Not done
- P1.1–P1.8 (Remediation, Analytics, Workpapers, Controls, Anomalies, Signals, Compliance, Reports) — ✅ All done
- P1.9 Frontend Tests — ❌ Not done
- P1.10 Product Analytics — ❌ Not done

**P2 Vertical** — not started

## Definition of Done (v1.4 Ship Gate)
All of the following must pass before any production deployment:
- `DISABLE_AUTH=false` is default; startup guard active
- JWT signature-verified via `python-jose` + JWKS
- `fetchJson` has 15s abort timeout
- CORS not wildcard
- Sentry initialized in both backend and frontend
- `slowapi` registered
- All backend tests pass with `DISABLE_AUTH=false`
- ≥3 frontend unit tests via vitest
- `dclaw-manifest.json` present
- No `print()` in backend
- `secret_key` has no default value

## Key Files
- Full plan: `PLAN-v1.4.md`
- TestForge analysis: `testforge/test_analysis.md`
- PRD: `REVISED-PRD.md`
- Agents guide: `AGENTS.md`

# DClaw Audit Knowledge Vault

## Purpose
This Obsidian vault tracks product strategy, implementation progress, architecture decisions, and graph-based code understanding for the `dclaw-audit` repository.

## Core Notes
- [[01-Current-State]]
- [[02-Roadmap-v1.3]] _(superseded — see [[05-Plan-v1.4-Summary]])_
- [[03-Architecture-Constraints]]
- [[04-Graphify-Workflow]]
- [[05-Plan-v1.4-Summary]]
- [[06-TestForge-Findings]]

## Repo Facts
- Backend: FastAPI (SQLAlchemy 2.0, Pydantic v2, asyncpg)
- Frontend: Next.js 14 App Router — **`web/`** only (`frontend/` deleted as of 2026-05-30)
- Database: PostgreSQL
- Backend Port: 8037
- Frontend Port: 3037
- Base API Path: `/api/v1`
- Design System: **One Convergence (OC)** — purple `#7030A0`, Raleway/Poppins/Open Sans fonts
- Vercel project: `dclaw-audit-web` (root dir = `web/`)

## Source of Truth Docs
- `AGENTS.md`
- `PLAN-v1.4.md` _(active — supersedes PLAN-v1.2.md and plan_v1.3.md)_
- `PRODUCT-SPEC.md`
- `REVISED-PRD.md`
- `testforge/test_analysis.md`

## Working Rule
Treat this vault as the human-readable layer and `graphify-out/` as the machine-readable graph layer.

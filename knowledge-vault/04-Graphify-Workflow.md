# Graphify Workflow

## Current Graph Stats (2026-06-01 · commit `daab5ca4`)
- **175 files · ~97,642 words**
- **1862 nodes · 3135 edges · 156 communities** (123 shown, 33 thin omitted)
- Extraction: 79% EXTRACTED · 21% INFERRED · 646 inferred edges (avg confidence 0.58)

## God Nodes (most connected abstractions)
1. `fetchJson()` — 63 edges (API client — all 30+ API calls flow through here)
2. `Select` — 51 edges (SQLAlchemy Select — central to all repository queries)
3. `Base` — 44 edges (SQLAlchemy DeclarativeBase)
4. `AIService` — 40 edges (AI copilot service — cloud + local Ollama)
5. `DemoCredentials` / `DemoStatus` — 33 edges each (demo seed layer)
6. `BaseRepository` — 32 edges
7. `AuditEngagementRepository` — 29 edges
8. `FindingRepository` — 28 edges
9. `cn()` — 27 edges (shadcn/ui utility)

## Outputs
Graphify writes outputs to `graphify-out/`:
- `graph.json`
- `graph.html`
- `GRAPH_REPORT.md`
- `manifest.json` (file hash cache for incremental updates)

## Recommended Usage
- Run `graphify update .` from repo root after code changes (no API cost — AST-only)
- Rebuild full graph (`graphify .`) only when `.graphifyignore` changes or manifest is corrupted
- Read `graphify-out/GRAPH_REPORT.md` before broad codebase searches

## What to Ignore
`.graphifyignore` excludes: `.git/`, `.github/`, `.venv/`, `knowledge-vault/`, `graphify-out/`,
`web/node_modules/`, `web/.next/`, `backend/__pycache__/`, `backend/.pytest_cache/`

## Typical Questions
- What are the core modules and god nodes?
- Which files are most central to audit workflows?
- What architectural clusters exist between backend, frontend, and docs?
- Where do configuration mismatches show up?
- Which inferred edges need verification? (646 total — start with `Select`, `Base`, `AIService`)

# Graph Report - dclaw-audit  (2026-05-16)

## Corpus Check
- 87 files · ~22,178 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 643 nodes · 818 edges · 62 communities (49 shown, 13 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 117 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62c1c2a4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 61|Community 61]]

## God Nodes (most connected - your core abstractions)
1. `FindingRepository` - 24 edges
2. `Select` - 19 edges
3. `AuditEngagementRepository` - 18 edges
4. `EvidenceRequestRepository` - 17 edges
5. `BaseRepository` - 16 edges
6. `compilerOptions` - 15 edges
7. `cn()` - 15 edges
8. `DClaw Audit — Plan v1.3` - 13 edges
9. `Base` - 12 edges
10. `dependencies` - 12 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  frontend/src/lib/utils.ts → frontend/package.json
- `list_engagements()` --calls--> `AuditEngagementRepository`  [INFERRED]
  backend/app/api/v1/audit.py → backend/app/repositories/audit_engagement_repository.py
- `create_engagement()` --calls--> `AuditEngagementRepository`  [INFERRED]
  backend/app/api/v1/audit.py → backend/app/repositories/audit_engagement_repository.py
- `list_evidence_requests()` --calls--> `EvidenceRequestRepository`  [INFERRED]
  backend/app/api/v1/audit.py → backend/app/repositories/evidence_request_repository.py
- `get_evidence_request()` --calls--> `EvidenceRequestRepository`  [INFERRED]
  backend/app/api/v1/audit.py → backend/app/repositories/evidence_request_repository.py

## Communities (62 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (61): DashboardPage(), FINDING_SEVERITY_OPTIONS, FINDING_STATUS_OPTIONS, formatLabel(), INITIAL_ENGAGEMENT_FORM, INITIAL_FINDING_FORM, INITIAL_FORM, INITIAL_REQUEST_FORM (+53 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): 0.1 Platform alignment and scaffold hardening, 0.2 Real audit engagement domain, 0.3 Foundational dashboard metrics, 0.4 Audit request workflow skeleton, 0.5 Correct product documents, 0. Foundational Roadmap, 1.1 Risk-based audit planning workspace, 1.2 Control library + framework mapping (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (39): 1A. Clone the Scaffold Template, 1B. Customize the Placeholders, 1C. Write Your PRODUCT-SPEC.md, 1D. Push to GitHub, 3A. Pull All Branches, 3B. Merge Everything, 3C. Test Locally, 3D. Push to GitHub (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (21): AuditEngagementRepository, BaseRepository, Generic async CRUD repository.      Subclass per entity:         class UserRepos, Generic async CRUD repository.      Subclass per entity:         class UserRepos, EvidenceRequestRepository, FindingRepository, Select, create_engagement() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (29): app_id, nav, title, version, dependencies, autoprefixer, class-variance-authority, clsx (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): Table, TableBody, TableCell, TableHead, TableHeader, TableRow

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (31): Base, BaseModel, DeclarativeBase, Enum, AuditDashboardSummary, AuditEngagement, AuditEngagementListResponse, EngagementStatus (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): AI Features, API Endpoints (initial slice), AuditEngagement, code:block1 (AuditEngagement), code:block2 (EvidenceRequest), code:block3 (Finding), code:block4 (Control), code:block5 (GET    /health/                          → Service health) (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (22): Anti-Patterns Checklist (Before Pushing), code:block1 (┌───────────────────────────────────────────────────────────), code:bash (git clone https://github.com/dclawstack/dclaw-scaffold.git d), code:bash (git checkout main), code:bash (docker compose up -d), code:bash (git push origin main), DClaw Stack — Scaling Playbook, Long-Term: Shared Libraries (Phase 2) (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.1
Nodes (20): 10. Audit Analytics Dashboard, 11. External Auditor Collaboration, 12. AI-Controlled Substantive Testing, 1. AI Audit Copilot (Risk Analyst), 2. Risk-Based Audit Planning, 3. Evidence Collection & Management, 4. Finding & Recommendation Tracking, 5. AI Anomaly Detection in Data (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (16): Agent Prompt Templates, code:block1 (You are the Backend Architect for a DClaw vertical SaaS app.), code:block2 (You are the Frontend Builder for a DClaw vertical SaaS app.), code:block3 (You are the DevOps Engineer for a DClaw vertical SaaS app.), code:block4 (You are the QA Engineer for a DClaw vertical SaaS app.), code:block5 (You are a Feature Developer for {APP_NAME}.), code:block6 (You are the Project Lead for building {APP_NAME}.), For Autonomous Agents (No Human in the Loop) (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (14): Anti-Patterns — NEVER DO, App Identity, Architecture Lock — DO NOT CHANGE, Backend, code:block1 (Audit/), Database Rules, DClaw App — Agent Development Guide, Directory Structure (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (12): Are you a new app not on the list?, Are you packaging your app for an end-user install?, code:block1 (postgresql+asyncpg://dclaw:dclaw@dclaw-<app>-db-rw:5432/dcla), code:bash (kubectl exec -n dclaw deploy/postgres -- \), code:bash (# postgres pod is up), code:bash (kubectl delete -f ~/DClaw-Stack/dclaw-platform/services/post), PATCH 2026-05-15 — Shared hub postgres (durable + auto-init), Reverse (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (30): Backend, Backend tests, code:bash (cd backend), code:bash (cd frontend), code:bash (docker compose up --build), code:bash (python3 -m pytest -q backend/tests), code:bash (cd frontend), Critical Rules for Agents (+22 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (12): API Reference, App-Specific Endpoints, Authentication, Base URL, code:block1 (https://audit.yourdomain.com/api), code:bash (curl -H "Authorization: Bearer $TOKEN"   https://audit.yourd), code:http (GET /health), code:json ({"status": "ok"}) (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (11): Can I run DClaw Audit without Kubernetes?, code:bash (kubectl patch dclawapp audit --type merge -p '{"spec":{"vers), code:yaml (spec:), code:yaml (spec:), code:bash (cd dclaw-audit/frontend && npm run dev), Frequently Asked Questions, General, How do I back up my data? (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (7): Architecture, Backend, code:block1 (┌─────────────┐     ┌─────────────┐     ┌─────────────┐), Components, Frontend, Infrastructure, Overview

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (7): App won't start, code:bash (# Check logs), code:bash (kubectl get clusters -n dclaw-audit), code:bash (kubectl get secret dclaw-audit-db-credentials -n dclaw-audit), Common Issues, Database connection errors, Frontend can't reach backend

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (6): Backend, code:yaml (spec:), Configuration, Environment Variables, Frontend, Kubernetes Resources

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): code:bash (# Apply the DClawApp CRD), code:bash (kubectl get pods -n dclaw-audit), Installation, Verify, Via DPanel, Via kubectl

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): 1. Governance Workflows, 2. Team Collaboration, 3. Reporting & Analytics, Industry Examples, Primary Use Cases, Use Cases

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): Active patches, Active Scaffold Patches, Conventions, Retired patches, See also

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): Best Practices, Data Management, Performance, Security, Upgrades

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (5): Compliance Frameworks, Getting Started with DClaw Audit, Prerequisites, Quick Links, What is DClaw Audit?

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (5): Next Steps, Quickstart, Step 1: Open the App, Step 2: First Use, Step 3: Configure Settings

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (4): DClaw Audit, Overview, Quick Links, Support

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (4): Added, Changelog, Notes, v0.1.0 — Initial Release

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (4): Long Term (2027+), Medium Term (Q3-Q4 2026), Roadmap, Short Term (Q2 2026)

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (4): code:bash (# Check app pods), Quick Diagnostics, Sections, Troubleshooting

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): BaseSettings, get_settings(), Settings

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (3): Ports, Stack, Technology Stack

### Community 40 - "Community 40"
Cohesion: 0.5
Nodes (3): Current Version, Releases, Sections

## Knowledge Gaps
- **289 isolated node(s):** `Return a naive UTC datetime (no tzinfo).      PostgreSQL TIMESTAMP WITHOUT TIME`, `Generic async CRUD repository.      Subclass per entity:         class UserRepos`, `create evidence requests  Revision ID: 20260516_0002 Revises: 20260516_0001 Crea`, `create findings  Revision ID: 20260516_0003 Revises: 20260516_0002 Create Date:`, `create audit engagements  Revision ID: 20260516_0001 Revises:  Create Date: 2026` (+284 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `FindingRepository` (e.g. with `Finding` and `FindingSeverity`) actually correct?**
  _`FindingRepository` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Select` (e.g. with `.list_requests()` and `.list_recent()`) actually correct?**
  _`Select` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `AuditEngagementRepository` (e.g. with `AuditEngagement` and `BaseRepository`) actually correct?**
  _`AuditEngagementRepository` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `EvidenceRequestRepository` (e.g. with `EvidenceRequest` and `EvidenceRequestStatus`) actually correct?**
  _`EvidenceRequestRepository` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `BaseRepository` (e.g. with `EvidenceRequestRepository` and `FindingRepository`) actually correct?**
  _`BaseRepository` has 6 INFERRED edges - model-reasoned connections that need verification._
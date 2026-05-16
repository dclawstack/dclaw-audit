# DClaw Audit — v1.2 Feature Roadmap

> 📘 **REVISED PRD v2.3 available:** See `REVISED-PRD.md` for complete gap analysis, current state, and full feature roadmap.


> Based on: Y Combinator vertical SaaS principles, trending GitHub repos (auditboard, workiva), AI product research (SAP Audit Management, ACL, TeamMate, AuditBoard)

## Pre-Flight Checklist

- [ ] `frontend/package-lock.json` committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [ ] Audit engagement CRUD
- [ ] Finding/issue tracking
- [ ] Basic reporting
- [ ] Control mapping
- [ ] Real backend CRUD (no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have (Ship in v1.0, demo-ready)

#### 1. AI Audit Copilot (Risk Analyst)
**Description:** AI assistant that analyzes evidence, suggests risk areas, and drafts findings. "Analyze these GL transactions for anomalies."
- **AI Angle:** Anomaly detection + pattern analysis + finding generation.
- **Backend:** `/api/v1/ai/audit-chat` endpoint. Evidence analysis pipeline.
- **Frontend:** Chat panel with evidence upload and analysis results.
- **Files:** `backend/app/services/audit_ai.py`, `frontend/src/components/audit-copilot.tsx`

#### 2. Risk-Based Audit Planning
**Description:** AI-assisted risk assessment to scope audits. Automated control testing planning.
- **Backend:** Risk scoring engine. Control mapping.
- **Frontend:** Risk matrix visualization. Audit scope builder.
- **Files:** `backend/app/services/risk_assessment.py`

#### 3. Evidence Collection & Management
**Description:** Upload, organize, and link evidence to controls and findings. Version tracking.
- **Backend:** Evidence vault with audit trail.
- **Frontend:** Evidence library with search and filters.
- **Files:** `backend/app/services/evidence.py`

#### 4. Finding & Recommendation Tracking
**Description:** Track findings through lifecycle: open → in progress → remediated → verified.
- **Backend:** Finding workflow with status transitions.
- **Frontend:** Finding dashboard with aging reports.
- **Files:** `frontend/src/app/findings/dashboard.tsx`

### P1 — Should Have (v1.1–1.2)

#### 5. AI Anomaly Detection in Data
**Description:** AI analyzes financial/operational data to flag anomalies, outliers, and suspicious patterns.
- **AI Angle:** Statistical + ML anomaly detection on transaction data.
- **Backend:** Anomaly detection pipeline.
- **Frontend:** Anomaly report with drill-down.

#### 6. Control Testing Automation
**Description:** Automate control tests with data sampling, execution, and result documentation.
- **Backend:** Test automation engine with scheduling.
- **Frontend:** Test builder and results dashboard.

#### 7. Audit Report Generation
**Description:** Auto-generate audit reports from findings, evidence, and narratives.
- **AI Angle:** LLM report drafting from structured data.
- **Backend:** Report template engine.
- **Frontend:** Report builder with preview.

#### 8. Compliance Framework Mapping
**Description:** Map controls to multiple frameworks (SOX, PCI-DSS, ISO 27001, NIST).
- **Backend:** Framework mapping with gap analysis.
- **Frontend:** Framework overlay visualization.

### P2 — Could Have (v1.3+)

#### 9. Continuous Auditing
**Description:** Real-time monitoring of controls with automated alerts on deviations.

#### 10. Audit Analytics Dashboard
**Description:** Historical audit data analysis, trend identification, and predictive risk scoring.

#### 11. External Auditor Collaboration
**Description:** Secure workspace for external auditors with controlled access.

#### 12. AI-Controlled Substantive Testing
**Description:** AI designs and executes substantive tests based on risk assessment.

---

## Implementation Priority

1. **Week 1–2:** AI Audit Copilot (P0.1) + Risk-Based Planning (P0.2)
2. **Week 3–4:** Evidence Collection (P0.3) + Finding Tracking (P0.4)
3. **Week 5–6:** Anomaly Detection (P1.5) + Control Testing (P1.6)
4. **Week 7–8:** Report Generation (P1.7) + Framework Mapping (P1.8)

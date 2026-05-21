# Current State

## Summary
DClaw Audit has moved from generic scaffold state toward a real audit SaaS foundation.

## Completed So Far
- Runtime config aligned to DClaw Audit
- Ports corrected to `8037` / `3037`
- Product spec rewritten for audit domain
- Persistent `AuditEngagement` model added
- Evidence request workflow skeleton added
- Findings + remediation lifecycle slice added
- CRUD + dashboard summary endpoints added
- Frontend dashboard switched to typed live API calls
- Backend tests added and passing

## Current Backend Domain
- `AuditEngagement`
  - title
  - client_name
  - status
  - risk_level
  - owner_name
  - description
  - audit period dates
- `EvidenceRequest`
  - engagement_id
  - title
  - request_owner
  - due_date
  - status
  - source_system
- `Finding`
  - engagement_id
  - title
  - description
  - severity
  - status
  - root_cause
  - recommendation
  - remediation_plan
  - owner_name
  - due_date

## Current Gaps
- Controls/framework mapping not implemented yet
- AI copilot not grounded to evidence yet
- Evidence provenance/version history not implemented yet

## Source of Truth Docs
- `AGENTS.md`
- `PLAN-v1.2.md`
- `plan_v1.3.md`
- `PRODUCT-SPEC.md`

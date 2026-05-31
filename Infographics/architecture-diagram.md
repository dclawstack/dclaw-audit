# DClaw Audit — Architecture Diagrams

> Source diagrams for infographic regeneration. Rendered with Mermaid.
> Version: 1.4 · Updated: 2026-05-31

---

## 1. System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        B[Browser / App]
    end

    subgraph Frontend["Frontend (Next.js 14+ · Port 3037)"]
        LP[Landing /]
        DB[Dashboard /dashboard]
        CTL[Controls /controls]
        RSK[Risk /risk]
        SIG[Signals /signals]
        ANO[Anomalies /anomalies]
        RMD[Remediation /remediation]
        RPT[Reports /reports]
        WP[Workpapers /workpapers]
        TST[Testing /testing]
        INT[Intelligence /intelligence]
        COP[AI Copilot Sidebar]
    end

    subgraph Backend["Backend (FastAPI · Port 8037)"]
        API[API Router /api/v1]
        AUTH[Auth Middleware\nLogto JWT / DISABLE_AUTH]
        subgraph Services["Services Layer"]
            AIS[ai_service.py\nLLM gateway]
            DMS[demo.py]
        end
        subgraph Routes["14 Route Modules"]
            R1[audit — engagements\nevidence · findings\ncontrols · mappings]
            R2[risk · anomalies\nsignals · activity\nintelligence · testing]
            R3[workpapers · remediation\nreport · ai · demo]
        end
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL 16\ndclaw_audit\n16 tables)]
        RD[(Redis 7\nrate limit / cache)]
        MN[(MinIO\nevidence files)]
    end

    subgraph AI["AI Providers"]
        OR[OpenRouter\nprimary]
        OL[Ollama\nlocal fallback]
    end

    B --> Frontend
    Frontend --> API
    API --> AUTH
    AUTH --> Routes
    Routes --> Services
    Routes --> PG
    Services --> AIS
    AIS --> OR
    AIS --> OL
    Routes --> MN
    Backend --> RD
```

---

## 2. Audit Workflow — End-to-End Flow

```mermaid
sequenceDiagram
    participant AU as Auditor
    participant FE as Frontend
    participant BE as FastAPI
    participant AI as AI Service
    participant DB as PostgreSQL

    AU->>FE: Create Engagement
    FE->>BE: POST /api/v1/engagements
    BE->>DB: INSERT audit_engagements
    DB-->>BE: engagement record
    BE-->>FE: AuditEngagement

    AU->>FE: AI Copilot — draft evidence requests
    FE->>BE: POST /api/v1/ai/draft-evidence
    BE->>AI: LLM: generate evidence list for scope
    AI-->>BE: [evidence request suggestions]
    BE-->>FE: DraftEvidenceResponse

    AU->>FE: Create evidence requests from suggestions
    FE->>BE: POST /api/v1/evidence-requests (×N)
    BE->>DB: INSERT evidence_requests
    BE->>DB: INSERT activity_events

    AU->>FE: Record finding from exception
    FE->>BE: POST /api/v1/ai/draft-finding {observation}
    BE->>AI: LLM: structure finding
    AI-->>BE: {title, description, root_cause, recommendation, severity}
    BE-->>FE: DraftFindingResponse

    AU->>FE: Save finding + generate remediation
    FE->>BE: POST /api/v1/remediation-plans/ai-generate
    BE->>AI: LLM: draft remediation plan
    AI-->>BE: {action_items, owner_name, estimated_days}
    BE-->>FE: RemediationPlan

    AU->>FE: Generate report
    FE->>BE: POST /api/v1/saved-reports/generate
    BE->>AI: LLM: synthesize executive summary
    AI-->>BE: {executive_summary, key_observations, risk_rating}
    BE->>DB: INSERT saved_reports
    BE-->>FE: SavedReport (status: completed)
    FE->>AU: Export HTML report
```

---

## 3. AI Provider Selection

```mermaid
flowchart TD
    S[AI Request] --> A{OPENROUTER_API_KEY\nset?}
    A -->|Yes| OR[OpenRouter API\nconfigured OPENROUTER_MODEL]
    A -->|No| B{OLLAMA_URL\nset?}
    B -->|Yes| OL[Ollama\nOLLAMA_MODEL default: llama3.1]
    B -->|No| ERR[503 Service Unavailable\nAI feature unavailable]

    OR --> R[LLM Response]
    OL --> R
    R --> TC[try/except wrapper]
    TC -->|Success| D[Return AI result]
    TC -->|Failure| E[503 — data without AI]

    style ERR fill:#EF4444,color:#fff
    style D fill:#10B981,color:#fff
    style E fill:#F59E0B,color:#fff
```

---

## 4. Data Model — Entity Relationships

```mermaid
erDiagram
    AuditEngagement {
        UUID id PK
        string title
        string client_name
        enum status
        enum risk_level
        string owner_name
        date audit_period_start
        date audit_period_end
    }

    EvidenceRequest {
        UUID id PK
        UUID engagement_id FK
        string title
        enum status
        date due_date
        string source_system
    }

    EvidenceVersionLog {
        UUID id PK
        UUID evidence_request_id FK
        enum action
        string actor_name
        datetime created_at
    }

    EvidenceFile {
        UUID id PK
        UUID evidence_request_id FK
        string filename
        string file_path
        int version
    }

    Finding {
        UUID id PK
        UUID engagement_id FK
        string title
        enum severity
        enum status
        string root_cause
    }

    RemediationPlan {
        UUID id PK
        UUID finding_id FK
        UUID engagement_id FK
        string title
        enum status
        int progress_pct
        bool ai_generated
    }

    Control {
        UUID id PK
        string name
        enum framework
        bool automated
    }

    FrameworkRequirement {
        UUID id PK
        enum framework
        string requirement_code
        string title
    }

    ControlMapping {
        UUID id PK
        UUID control_id FK
        UUID framework_requirement_id FK
        enum coverage_status
    }

    ControlTest {
        UUID id PK
        UUID engagement_id FK
        UUID control_id FK
        string title
        enum test_type
        enum status
        enum overall_result
    }

    ControlTestSample {
        UUID id PK
        UUID test_id FK
        string item_reference
        enum result
    }

    RiskItem {
        UUID id PK
        UUID engagement_id FK
        string title
        int likelihood
        int impact
        float risk_score
        enum status
    }

    Workpaper {
        UUID id PK
        UUID engagement_id FK
        string title
        enum status
        int version
    }

    AnomalyTransaction {
        UUID id PK
        UUID engagement_id FK
        float amount
        string batch_id
    }

    AnomalyFlag {
        UUID id PK
        UUID transaction_id FK
        enum flag_type
        float confidence_score
        enum status
    }

    AuditSignal {
        UUID id PK
        enum signal_source
        enum signal_type
        string severity
        enum status
    }

    ActivityEvent {
        UUID id PK
        UUID engagement_id FK
        string entity_type
        string action
        datetime created_at
    }

    AuditEngagement ||--o{ EvidenceRequest : "has requests"
    AuditEngagement ||--o{ Finding : "has findings"
    AuditEngagement ||--o{ RiskItem : "has risks"
    AuditEngagement ||--o{ ControlTest : "has tests"
    AuditEngagement ||--o{ Workpaper : "has workpapers"
    AuditEngagement ||--o{ RemediationPlan : "has plans"
    AuditEngagement ||--o{ AnomalyTransaction : "has transactions"
    AuditEngagement ||--o{ ActivityEvent : "has activity"

    EvidenceRequest ||--o{ EvidenceVersionLog : "has log"
    EvidenceRequest ||--o{ EvidenceFile : "has files"

    Finding ||--o{ RemediationPlan : "has plans"

    Control ||--o{ ControlMapping : "has mappings"
    Control ||--o{ ControlTest : "tested by"
    FrameworkRequirement ||--o{ ControlMapping : "mapped via"

    ControlTest ||--o{ ControlTestSample : "has samples"
    AnomalyTransaction ||--o{ AnomalyFlag : "has flags"
```

---

## 5. Control Testing Pipeline

```mermaid
flowchart LR
    subgraph Plan["Test Planning"]
        CT[Create ControlTest\ntype: manual / automated\n/ sample_based]
        SA[Define test_objective\ntest_procedure\nsample_size]
    end

    subgraph Execute["Test Execution"]
        SM[Add ControlTestSample\nitems per sample]
        RR[Record result per sample\npass / fail / exception]
    end

    subgraph Review["Review & Close"]
        EX[Count exceptions_found]
        OR[Set overall_result\npass / fail / exception]
        RV[Reviewer sign-off\nreviewer_name]
        CO[status: completed]
    end

    subgraph Output["Finding Generation"]
        FI[Create Finding\nfrom exceptions]
        RP[AI: generate-remediation-plan]
    end

    CT --> SA --> SM --> RR --> EX --> OR --> RV --> CO
    CO -->|exceptions exist| FI --> RP
```

---

## 6. Anomaly Detection Pipeline

```mermaid
flowchart TD
    subgraph Ingest["Data Ingestion"]
        BI[POST /anomaly-transactions\n/bulk-ingest\nbatch_id + transactions]
        SI[POST /anomaly-transactions\nsingle transaction]
    end

    subgraph Detect["Detection Engine"]
        RB[Rule-Based\nthreshold / pattern checks]
        ST[Statistical\nz-score / outlier detection]
        CF[confidence_score 0.0–1.0]
    end

    subgraph Flag["Flag Creation"]
        FL[AnomalyFlag\nflag_type: rule_based / statistical\nstatus: flagged]
    end

    subgraph Review["Analyst Review"]
        AN[Analyst reviews flag\nPATCH /anomaly-flags/{id}]
        CL[status: cleared]
        ES[status: escalated]
        RV[status: reviewed + notes]
    end

    BI --> RB
    BI --> ST
    SI --> RB
    SI --> ST
    RB --> CF --> FL
    ST --> CF
    FL --> AN
    AN --> CL
    AN --> ES
    AN --> RV
```

---

## 7. Docker Compose Service Map

```mermaid
graph LR
    subgraph dc["docker compose up"]
        PG[(postgres:16-alpine\nPort 5435:5432\ndclaw_audit DB)]
        RD[(redis:7-alpine\nPort 6379)]
        MN[(minio:latest\nPort 9000 API\nPort 9001 Console)]
        BE[backend\npython:3.11-slim\nPort 8037\nnon-root]
        FE[frontend / web\nnode:20-alpine\nPort 3037]
    end

    FE -->|NEXT_PUBLIC_API_URL| BE
    BE -->|DATABASE_URL| PG
    BE -->|REDIS_URL| RD
    BE -->|MINIO_ENDPOINT| MN
    PG -.->|healthcheck| BE
    RD -.->|healthcheck| BE
    MN -.->|healthcheck| BE
    BE -.->|healthcheck| FE
```

---

## 8. Screen Navigation Map

```mermaid
graph TD
    LAND[Landing /]
    DASH[Dashboard /dashboard]
    CTL[Controls /controls]
    RSK[Risk /risk]
    SIG[Signals /signals]
    ANO[Anomalies /anomalies]
    RMD[Remediation /remediation]
    RPT[Reports /reports]
    WP[Workpapers /workpapers]
    TST[Testing /testing]
    INT[Intelligence /intelligence]

    LAND --> DASH
    LAND --> CTL
    LAND --> RSK
    LAND --> SIG
    LAND --> ANO
    LAND --> RMD
    LAND --> RPT
    LAND --> WP
    LAND --> TST
    LAND --> INT

    DASH -->|AI: Draft Evidence| DASH
    DASH -->|AI: Risk Copilot| DASH
    DASH -->|AI: Draft Finding| DASH

    CTL -->|Gap Analysis| CTL
    RSK -->|AI: Risk Copilot| RSK

    ANO -->|Bulk Ingest| ANO
    ANO -->|Analyst Review| ANO

    RPT -->|AI: Generate Report| RPT
    RPT -->|HTML Export| RPT

    RMD -->|AI: Generate Plan| RMD

    TST -->|Sample Management| TST
    TST -->|→ Finding| RSK
```

---

## 9. Intelligence Layer — Analytics Sources

```mermaid
flowchart LR
    subgraph Sources["Data Sources (cross-engagement)"]
        CT[ControlTest results\n{pass, fail, exception}]
        ER[EvidenceRequest\noverdues + response times]
        FI[Finding\naging + status]
        EG[AuditEngagement\ncycle times]
    end

    subgraph Compute["Intelligence Aggregations"]
        RC[Recurring Control Failures\nfailure_rate per control]
        OR[Owner Responsiveness\navg days open, overdue %]
        CB[Cycle Time Benchmarks\ndays open per engagement]
        KP[KPI Trends\n30d / 60d finding counts]
    end

    subgraph Output["GET /intelligence/summary"]
        IS[IntelligenceSummary\nrecurring_control_failures\nowner_responsiveness\ncycle_time_benchmarks\nfindings_trend_30d/60d]
    end

    CT --> RC
    ER --> OR
    FI --> CB
    FI --> KP
    EG --> CB
    RC --> IS
    OR --> IS
    CB --> IS
    KP --> IS
```

---

## 10. AI Feature Cost Map

| Feature | Endpoint | Model Tier | Cache |
|---------|---------|-----------|-------|
| Draft evidence requests | `/ai/draft-evidence` | Standard | None |
| Risk copilot | `/ai/risk-copilot` | Standard | None |
| Draft finding | `/ai/draft-finding` | Standard | None |
| Generate report | `/ai/generate-report` | Standard | None |
| Evidence completeness check | `/ai/check-evidence-completeness` | Standard | None |
| Prioritize findings | `/ai/prioritize-findings` | Standard | None |
| Generate remediation plan | `/ai/generate-remediation-plan` | Standard | None |
| Saved report generation | `/saved-reports/generate` | Standard | SavedReport DB record |

All calls through `ai_service.py`. All wrapped in try/except — 503 on provider failure.

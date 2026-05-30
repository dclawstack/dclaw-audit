const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(`API error ${response.status}: ${error}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export type FrameworkName = "sox" | "iso_27001" | "nist" | "pci_dss";
export type MappingCoverageStatus = "full" | "partial" | "planned";
export type EngagementStatus = "planned" | "in_progress" | "reporting" | "completed";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type EvidenceRequestStatus = "draft" | "sent" | "received" | "overdue";
export type FindingSeverity = "low" | "medium" | "high" | "critical";
export type FindingStatus = "open" | "in_progress" | "remediated" | "verified";

export interface AuditEngagement {
  id: string;
  title: string;
  client_name: string;
  status: EngagementStatus;
  risk_level: RiskLevel;
  owner_name: string | null;
  description: string | null;
  audit_period_start: string | null;
  audit_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRequest {
  id: string;
  engagement_id: string;
  title: string;
  description: string | null;
  request_owner: string | null;
  due_date: string | null;
  status: EvidenceRequestStatus;
  source_system: string | null;
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: string;
  engagement_id: string;
  title: string;
  description: string | null;
  severity: FindingSeverity;
  status: FindingStatus;
  root_cause: string | null;
  recommendation: string | null;
  remediation_plan: string | null;
  owner_name: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Control {
  id: string;
  name: string;
  description: string | null;
  framework: FrameworkName | null;
  control_owner: string | null;
  frequency: string | null;
  automated: boolean;
  created_at: string;
  updated_at: string;
}

export interface FrameworkRequirement {
  id: string;
  framework: FrameworkName;
  requirement_code: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ControlMapping {
  id: string;
  control_id: string;
  framework_requirement_id: string;
  coverage_status: MappingCoverageStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEngagementListResponse {
  items: AuditEngagement[];
  total: number;
}

export interface EvidenceRequestListResponse {
  items: EvidenceRequest[];
  total: number;
}

export interface FindingListResponse {
  items: Finding[];
  total: number;
}

export interface ControlListResponse {
  items: Control[];
  total: number;
}

export interface FrameworkRequirementListResponse {
  items: FrameworkRequirement[];
  total: number;
}

export interface ControlMappingListResponse {
  items: ControlMapping[];
  total: number;
}

export interface AuditDashboardSummary {
  total_engagements: number;
  status_breakdown: Record<string, number>;
  risk_breakdown: Record<string, number>;
  open_requests: number;
  overdue_requests: number;
  total_findings: number;
  open_findings: number;
  overdue_findings: number;
  finding_severity_breakdown: Record<string, number>;
  finding_status_breakdown: Record<string, number>;
  finding_aging_buckets: Record<string, number>;
  total_controls: number;
  total_framework_requirements: number;
  framework_breakdown: Record<string, number>;
  recent_engagements: AuditEngagement[];
  recent_evidence_requests: EvidenceRequest[];
  recent_findings: Finding[];
  recent_controls: Control[];
}

export interface CreateAuditEngagementPayload {
  title: string;
  client_name: string;
  status?: EngagementStatus;
  risk_level?: RiskLevel;
  owner_name?: string;
  description?: string;
  audit_period_start?: string;
  audit_period_end?: string;
}

export interface CreateEvidenceRequestPayload {
  engagement_id: string;
  title: string;
  description?: string;
  request_owner?: string;
  due_date?: string;
  status?: EvidenceRequestStatus;
  source_system?: string;
}

export interface CreateFindingPayload {
  engagement_id: string;
  title: string;
  description?: string;
  severity?: FindingSeverity;
  status?: FindingStatus;
  root_cause?: string;
  recommendation?: string;
  remediation_plan?: string;
  owner_name?: string;
  due_date?: string;
}

export interface UpdateFindingPayload {
  title?: string;
  description?: string;
  severity?: FindingSeverity;
  status?: FindingStatus;
  root_cause?: string;
  recommendation?: string;
  remediation_plan?: string;
  owner_name?: string;
  due_date?: string;
}

export interface CreateControlPayload {
  name: string;
  description?: string;
  framework?: FrameworkName;
  control_owner?: string;
  frequency?: string;
  automated?: boolean;
}

export interface CreateFrameworkRequirementPayload {
  framework: FrameworkName;
  requirement_code: string;
  title: string;
  description?: string;
}

export interface CreateControlMappingPayload {
  control_id: string;
  framework_requirement_id: string;
  coverage_status?: MappingCoverageStatus;
  notes?: string;
}

export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

export async function listEngagements() {
  return fetchJson<AuditEngagementListResponse>("/api/v1/engagements");
}

export async function createEngagement(payload: CreateAuditEngagementPayload) {
  return fetchJson<AuditEngagement>("/api/v1/engagements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listEvidenceRequests(engagementId?: string) {
  const suffix = engagementId ? `?engagement_id=${engagementId}` : "";
  return fetchJson<EvidenceRequestListResponse>(`/api/v1/evidence-requests${suffix}`);
}

export async function createEvidenceRequest(payload: CreateEvidenceRequestPayload) {
  return fetchJson<EvidenceRequest>("/api/v1/evidence-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listFindings(engagementId?: string) {
  const suffix = engagementId ? `?engagement_id=${engagementId}` : "";
  return fetchJson<FindingListResponse>(`/api/v1/findings${suffix}`);
}

export async function createFinding(payload: CreateFindingPayload) {
  return fetchJson<Finding>("/api/v1/findings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFinding(findingId: string, payload: UpdateFindingPayload) {
  return fetchJson<Finding>(`/api/v1/findings/${findingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getDashboardSummary() {
  return fetchJson<AuditDashboardSummary>("/api/v1/dashboard/summary");
}

// Controls & Frameworks
export async function listControls(framework?: FrameworkName) {
  const suffix = framework ? `?framework=${framework}` : "";
  return fetchJson<ControlListResponse>(`/api/v1/controls${suffix}`);
}

export async function createControl(payload: CreateControlPayload) {
  return fetchJson<Control>("/api/v1/controls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteControl(controlId: string) {
  return fetchJson<void>(`/api/v1/controls/${controlId}`, { method: "DELETE" });
}

export async function listFrameworkRequirements(framework?: FrameworkName) {
  const suffix = framework ? `?framework=${framework}` : "";
  return fetchJson<FrameworkRequirementListResponse>(`/api/v1/framework-requirements${suffix}`);
}

export async function createFrameworkRequirement(payload: CreateFrameworkRequirementPayload) {
  return fetchJson<FrameworkRequirement>("/api/v1/framework-requirements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteFrameworkRequirement(requirementId: string) {
  return fetchJson<void>(`/api/v1/framework-requirements/${requirementId}`, { method: "DELETE" });
}

export async function listControlMappings(controlId?: string, requirementId?: string) {
  const params = new URLSearchParams();
  if (controlId) params.append("control_id", controlId);
  if (requirementId) params.append("framework_requirement_id", requirementId);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<ControlMappingListResponse>(`/api/v1/control-mappings${suffix}`);
}

export async function createControlMapping(payload: CreateControlMappingPayload) {
  return fetchJson<ControlMapping>("/api/v1/control-mappings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteControlMapping(mappingId: string) {
  return fetchJson<void>(`/api/v1/control-mappings/${mappingId}`, { method: "DELETE" });
}

export async function getGapAnalysis(framework?: FrameworkName) {
  const suffix = framework ? `?framework=${framework}` : "";
  return fetchJson<{ framework_requirement: FrameworkRequirement; mapped_controls: Control[]; coverage_status: MappingCoverageStatus | null }[]>(
    `/api/v1/controls/gap-analysis${suffix}`
  );
}

export async function getEvidenceVersionLogs(evidenceRequestId: string) {
  return fetchJson<EvidenceVersionLogListResponse>(
    `/api/v1/evidence-requests/${evidenceRequestId}/version-log`
  );
}

export async function createEvidenceVersionLog(
  evidenceRequestId: string,
  payload: {
    action: EvidenceVersionLog["action"];
    previous_value?: string;
    new_value?: string;
    actor_name?: string;
    note?: string;
  }
) {
  return fetchJson<EvidenceVersionLog>(
    `/api/v1/evidence-requests/${evidenceRequestId}/version-log`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export interface DraftEvidenceResponse {
  evidence_requests: { title: string; description?: string; request_owner?: string; source_system?: string }[];
}

export interface EvidenceVersionLog {
  id: string;
  evidence_request_id: string;
  action: "created" | "updated" | "status_changed" | "file_attached" | "note_added" | "reminder_sent";
  previous_value: string | null;
  new_value: string | null;
  actor_name: string | null;
  note: string | null;
  created_at: string;
}

export interface EvidenceVersionLogListResponse {
  items: EvidenceVersionLog[];
  total: number;
}

export interface RiskCopilotResponse {
  risks: string[];
  controls: string[];
  test_ideas: string[];
}

export interface DraftFindingResponse {
  title: string;
  description: string;
  root_cause: string;
  recommendation: string;
  severity: string;
}

export interface ReportResponse {
  executive_summary: string;
  key_observations: string[];
  overall_risk_rating: string;
}

export async function aiDraftEvidenceRequests(engagementId: string) {
  return fetchJson<DraftEvidenceResponse>("/api/v1/ai/draft-evidence", {
    method: "POST",
    body: JSON.stringify({ engagement_id: engagementId }),
  });
}

export async function aiRiskCopilot(engagementId: string) {
  return fetchJson<RiskCopilotResponse>("/api/v1/ai/risk-copilot", {
    method: "POST",
    body: JSON.stringify({ engagement_id: engagementId }),
  });
}

export async function aiDraftFinding(engagementId: string, observation: string) {
  return fetchJson<DraftFindingResponse>("/api/v1/ai/draft-finding", {
    method: "POST",
    body: JSON.stringify({ engagement_id: engagementId, observation }),
  });
}

export async function aiGenerateReport(engagementId: string) {
  return fetchJson<ReportResponse>("/api/v1/ai/generate-report", {
    method: "POST",
    body: JSON.stringify({ engagement_id: engagementId }),
  });
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  sections: string[];
  default_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedReport {
  id: string;
  engagement_id: string;
  template_id: string;
  title: string;
  status: "draft" | "generating" | "completed";
  sections: Record<string, string>;
  generated_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedReportWithTemplate extends SavedReport {
  template: ReportTemplate;
}

export interface ReportTemplateListResponse {
  items: ReportTemplate[];
  total: number;
}

export interface SavedReportListResponse {
  items: SavedReport[];
  total: number;
}

export async function listReportTemplates() {
  return fetchJson<ReportTemplateListResponse>("/api/v1/report-templates");
}

export async function createReportTemplate(payload: { name: string; description?: string; sections: string[]; default_prompt?: string }) {
  return fetchJson<ReportTemplate>("/api/v1/report-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listSavedReports(engagementId?: string) {
  const suffix = engagementId ? `?engagement_id=${engagementId}` : "";
  return fetchJson<SavedReportListResponse>(`/api/v1/saved-reports${suffix}`);
}

export async function createSavedReport(payload: { engagement_id: string; template_id: string; title: string }) {
  return fetchJson<SavedReport>("/api/v1/saved-reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateReport(payload: { engagement_id: string; template_id: string; title: string }) {
  return fetchJson<SavedReport>("/api/v1/saved-reports/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSavedReport(reportId: string, payload: { title?: string; status?: string; sections?: Record<string, string>; generated_summary?: string }) {
  return fetchJson<SavedReport>(`/api/v1/saved-reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSavedReport(reportId: string) {
  return fetchJson<void>(`/api/v1/saved-reports/${reportId}`, { method: "DELETE" });
}

// ─── Risk Items (v1.3 §1.1) ─────────────────────────────────────────────────

export type RiskItemStatus = "open" | "mitigated" | "accepted";

export interface RiskItem {
  id: string;
  engagement_id: string;
  title: string;
  description: string | null;
  category: string | null;
  likelihood: number;
  impact: number;
  risk_score: number;
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null;
  owner_name: string | null;
  status: RiskItemStatus;
  mitigation_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskItemListResponse {
  items: RiskItem[];
  total: number;
}

export interface CreateRiskItemPayload {
  engagement_id: string;
  title: string;
  description?: string;
  category?: string;
  likelihood?: number;
  impact?: number;
  residual_likelihood?: number;
  residual_impact?: number;
  owner_name?: string;
  status?: RiskItemStatus;
  mitigation_notes?: string;
}

export interface UpdateRiskItemPayload {
  title?: string;
  description?: string;
  category?: string;
  likelihood?: number;
  impact?: number;
  residual_likelihood?: number;
  residual_impact?: number;
  owner_name?: string;
  status?: RiskItemStatus;
  mitigation_notes?: string;
}

export async function listRiskItems(engagementId?: string, status?: RiskItemStatus) {
  const params = new URLSearchParams();
  if (engagementId) params.append("engagement_id", engagementId);
  if (status) params.append("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<RiskItemListResponse>(`/api/v1/risk-items${suffix}`);
}

export async function createRiskItem(payload: CreateRiskItemPayload) {
  return fetchJson<RiskItem>("/api/v1/risk-items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRiskItem(itemId: string, payload: UpdateRiskItemPayload) {
  return fetchJson<RiskItem>(`/api/v1/risk-items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteRiskItem(itemId: string) {
  return fetchJson<void>(`/api/v1/risk-items/${itemId}`, { method: "DELETE" });
}

// ─── Activity Events (v1.3 §1.6) ────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  engagement_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  actor_name: string | null;
  details: string | null;
  created_at: string;
}

export interface ActivityEventListResponse {
  items: ActivityEvent[];
  total: number;
}

export async function listActivityEvents(engagementId?: string, entityType?: string) {
  const params = new URLSearchParams();
  if (engagementId) params.append("engagement_id", engagementId);
  if (entityType) params.append("entity_type", entityType);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<ActivityEventListResponse>(`/api/v1/activity-events${suffix}`);
}

export async function createActivityEvent(payload: {
  engagement_id?: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  actor_name?: string;
  details?: string;
}) {
  return fetchJson<ActivityEvent>("/api/v1/activity-events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Anomaly Detection (v1.3 §2.2) ──────────────────────────────────────────

export type AnomalyFlagType = "statistical" | "rule_based";
export type AnomalyFlagStatus = "flagged" | "reviewed" | "cleared" | "escalated";

export interface AnomalyFlag {
  id: string;
  transaction_id: string;
  flag_type: AnomalyFlagType;
  severity: string;
  description: string;
  confidence_score: number | null;
  status: AnomalyFlagStatus;
  analyst_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface AnomalyTransaction {
  id: string;
  engagement_id: string | null;
  transaction_date: string | null;
  amount: number | null;
  description: string | null;
  account_code: string | null;
  party_name: string | null;
  source_system: string | null;
  batch_id: string | null;
  created_at: string;
  flags: AnomalyFlag[];
}

export interface AnomalyTransactionListResponse {
  items: AnomalyTransaction[];
  total: number;
}

export interface AnomalyFlagListResponse {
  items: AnomalyFlag[];
  total: number;
}

export interface BulkIngestPayload {
  transactions: {
    engagement_id?: string;
    transaction_date?: string;
    amount?: number;
    description?: string;
    account_code?: string;
    party_name?: string;
    source_system?: string;
    batch_id?: string;
  }[];
  run_detection?: boolean;
}

export interface BulkIngestResponse {
  ingested: number;
  flags_created: number;
}

export async function listAnomalyTransactions(engagementId?: string, batchId?: string) {
  const params = new URLSearchParams();
  if (engagementId) params.append("engagement_id", engagementId);
  if (batchId) params.append("batch_id", batchId);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<AnomalyTransactionListResponse>(`/api/v1/anomaly-transactions${suffix}`);
}

export async function bulkIngestTransactions(payload: BulkIngestPayload) {
  return fetchJson<BulkIngestResponse>("/api/v1/anomaly-transactions/bulk-ingest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAnomalyFlags(status?: AnomalyFlagStatus, flagType?: AnomalyFlagType) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (flagType) params.append("flag_type", flagType);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<AnomalyFlagListResponse>(`/api/v1/anomaly-flags${suffix}`);
}

export async function reviewAnomalyFlag(flagId: string, payload: { status?: AnomalyFlagStatus; analyst_notes?: string; reviewed_by?: string }) {
  return fetchJson<AnomalyFlag>(`/api/v1/anomaly-flags/${flagId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Control Tests (v1.3 §2.4) ───────────────────────────────────────────────

export type ControlTestType = "manual" | "automated" | "sample_based";
export type ControlTestStatus = "planned" | "in_progress" | "completed" | "exception";
export type ControlTestResult = "pass" | "fail" | "exception" | "not_applicable";

export interface ControlTestSample {
  id: string;
  test_id: string;
  item_reference: string;
  item_description: string | null;
  result: ControlTestResult | null;
  exception_notes: string | null;
  created_at: string;
}

export interface ControlTest {
  id: string;
  engagement_id: string;
  control_id: string | null;
  title: string;
  test_type: ControlTestType;
  scheduled_date: string | null;
  completed_date: string | null;
  status: ControlTestStatus;
  overall_result: ControlTestResult | null;
  sample_size: number | null;
  exceptions_found: number | null;
  test_objective: string | null;
  test_procedure: string | null;
  test_notes: string | null;
  owner_name: string | null;
  reviewer_name: string | null;
  created_at: string;
  updated_at: string;
  samples: ControlTestSample[];
}

export interface ControlTestListResponse {
  items: ControlTest[];
  total: number;
}

export interface CreateControlTestPayload {
  engagement_id: string;
  control_id?: string;
  title: string;
  test_type?: ControlTestType;
  scheduled_date?: string;
  test_objective?: string;
  test_procedure?: string;
  sample_size?: number;
  owner_name?: string;
  reviewer_name?: string;
}

export interface UpdateControlTestPayload {
  title?: string;
  test_type?: ControlTestType;
  scheduled_date?: string;
  completed_date?: string;
  status?: ControlTestStatus;
  overall_result?: ControlTestResult;
  sample_size?: number;
  exceptions_found?: number;
  test_objective?: string;
  test_procedure?: string;
  test_notes?: string;
  owner_name?: string;
  reviewer_name?: string;
}

export async function listControlTests(engagementId?: string, controlId?: string, status?: ControlTestStatus) {
  const params = new URLSearchParams();
  if (engagementId) params.append("engagement_id", engagementId);
  if (controlId) params.append("control_id", controlId);
  if (status) params.append("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<ControlTestListResponse>(`/api/v1/control-tests${suffix}`);
}

export async function createControlTest(payload: CreateControlTestPayload) {
  return fetchJson<ControlTest>("/api/v1/control-tests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateControlTest(testId: string, payload: UpdateControlTestPayload) {
  return fetchJson<ControlTest>(`/api/v1/control-tests/${testId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteControlTest(testId: string) {
  return fetchJson<void>(`/api/v1/control-tests/${testId}`, { method: "DELETE" });
}

export async function createTestSample(testId: string, payload: { item_reference: string; item_description?: string; result?: ControlTestResult; exception_notes?: string }) {
  return fetchJson<ControlTestSample>(`/api/v1/control-tests/${testId}/samples`, {
    method: "POST",
    body: JSON.stringify({ test_id: testId, ...payload }),
  });
}

// ─── Audit Signals (v1.3 §2.3) ───────────────────────────────────────────────

export type SignalSource = "erp" | "iam" | "ticketing" | "cloud" | "manual";
export type SignalType = "control_deviation" | "access_change" | "config_change" | "threshold_breach" | "anomaly";
export type SignalStatus = "new" | "reviewed" | "dismissed" | "escalated";

export interface AuditSignal {
  id: string;
  signal_source: SignalSource;
  signal_type: SignalType;
  title: string;
  description: string | null;
  entity_ref: string | null;
  severity: string;
  status: SignalStatus;
  engagement_id: string | null;
  finding_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface AuditSignalListResponse {
  items: AuditSignal[];
  total: number;
}

export interface CreateAuditSignalPayload {
  signal_source: SignalSource;
  signal_type: SignalType;
  title: string;
  description?: string;
  entity_ref?: string;
  severity?: string;
  engagement_id?: string;
  raw_payload?: string;
}

export async function listAuditSignals(opts?: { engagementId?: string; status?: SignalStatus; source?: SignalSource; type?: SignalType }) {
  const params = new URLSearchParams();
  if (opts?.engagementId) params.append("engagement_id", opts.engagementId);
  if (opts?.status) params.append("status", opts.status);
  if (opts?.source) params.append("signal_source", opts.source);
  if (opts?.type) params.append("signal_type", opts.type);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<AuditSignalListResponse>(`/api/v1/audit-signals${suffix}`);
}

export async function createAuditSignal(payload: CreateAuditSignalPayload) {
  return fetchJson<AuditSignal>("/api/v1/audit-signals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditSignal(signalId: string, payload: { status?: SignalStatus; engagement_id?: string; finding_id?: string; reviewed_by?: string }) {
  return fetchJson<AuditSignal>(`/api/v1/audit-signals/${signalId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAuditSignal(signalId: string) {
  return fetchJson<void>(`/api/v1/audit-signals/${signalId}`, { method: "DELETE" });
}

// ─── Intelligence (v1.3 §2.5) ────────────────────────────────────────────────

export interface RecurringControlFailure {
  control_id: string | null;
  control_title: string;
  total_tests: number;
  failed_tests: number;
  failure_rate: number;
}

export interface OwnerResponsiveness {
  owner_name: string;
  total_requests: number;
  overdue_requests: number;
  avg_days_open: number;
  responsiveness_score: number;
}

export interface CycleTimeBenchmark {
  engagement_id: string;
  title: string;
  status: string;
  days_open: number;
  findings_count: number;
  open_findings: number;
}

export interface IntelligenceSummary {
  recurring_control_failures: RecurringControlFailure[];
  owner_responsiveness: OwnerResponsiveness[];
  cycle_time_benchmarks: CycleTimeBenchmark[];
  total_open_engagements: number;
  avg_finding_age_days: number;
  high_risk_engagement_count: number;
  findings_trend_30d: number;
  findings_trend_60d: number;
}

export async function getIntelligenceSummary() {
  return fetchJson<IntelligenceSummary>("/api/v1/intelligence/summary");
}

// ─── Workpapers ──────────────────────────────────────────────────────────────

export type WorkpaperStatus = "draft" | "in_review" | "approved" | "archived";

export interface Workpaper {
  id: string;
  engagement_id: string;
  title: string;
  content: string | null;
  status: WorkpaperStatus;
  preparer_name: string | null;
  reviewer_name: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkpaperListResponse { items: Workpaper[]; total: number; }

export interface CreateWorkpaperPayload {
  engagement_id: string;
  title: string;
  content?: string;
  status?: WorkpaperStatus;
  preparer_name?: string;
  reviewer_name?: string;
  notes?: string;
}

export interface UpdateWorkpaperPayload {
  title?: string;
  content?: string;
  status?: WorkpaperStatus;
  preparer_name?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  approved_at?: string;
  notes?: string;
}

export async function listWorkpapers(engagementId?: string, status?: WorkpaperStatus) {
  const params = new URLSearchParams();
  if (engagementId) params.append("engagement_id", engagementId);
  if (status) params.append("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<WorkpaperListResponse>(`/api/v1/workpapers${suffix}`);
}

export async function createWorkpaper(payload: CreateWorkpaperPayload) {
  return fetchJson<Workpaper>("/api/v1/workpapers", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateWorkpaper(id: string, payload: UpdateWorkpaperPayload) {
  return fetchJson<Workpaper>(`/api/v1/workpapers/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteWorkpaper(id: string) {
  return fetchJson<void>(`/api/v1/workpapers/${id}`, { method: "DELETE" });
}

// ─── Remediation Plans ───────────────────────────────────────────────────────

export type RemediationStatus = "open" | "in_progress" | "completed" | "overdue" | "cancelled";

export interface RemediationPlan {
  id: string;
  finding_id: string;
  engagement_id: string;
  title: string;
  action_items: string | null;
  owner_name: string | null;
  due_date: string | null;
  status: RemediationStatus;
  progress_pct: number;
  ai_generated: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemediationPlanListResponse { items: RemediationPlan[]; total: number; }

export interface CreateRemediationPlanPayload {
  finding_id: string;
  engagement_id: string;
  title: string;
  action_items?: string;
  owner_name?: string;
  due_date?: string;
  status?: RemediationStatus;
  progress_pct?: number;
  notes?: string;
}

export interface UpdateRemediationPlanPayload {
  title?: string;
  action_items?: string;
  owner_name?: string;
  due_date?: string;
  status?: RemediationStatus;
  progress_pct?: number;
  notes?: string;
}

export async function listRemediationPlans(opts?: { engagementId?: string; findingId?: string; status?: RemediationStatus }) {
  const params = new URLSearchParams();
  if (opts?.engagementId) params.append("engagement_id", opts.engagementId);
  if (opts?.findingId) params.append("finding_id", opts.findingId);
  if (opts?.status) params.append("status", opts.status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<RemediationPlanListResponse>(`/api/v1/remediation-plans${suffix}`);
}

export async function createRemediationPlan(payload: CreateRemediationPlanPayload) {
  return fetchJson<RemediationPlan>("/api/v1/remediation-plans", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateRemediationPlan(id: string, payload: UpdateRemediationPlanPayload) {
  return fetchJson<RemediationPlan>(`/api/v1/remediation-plans/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteRemediationPlan(id: string) {
  return fetchJson<void>(`/api/v1/remediation-plans/${id}`, { method: "DELETE" });
}

export async function aiGenerateRemediationPlan(findingId: string, engagementId: string) {
  return fetchJson<{ title: string; action_items: string; owner_name?: string; estimated_days?: number; notes?: string }>(
    "/api/v1/ai/generate-remediation-plan",
    { method: "POST", body: JSON.stringify({ finding_id: findingId, engagement_id: engagementId }) }
  );
}

export function getReportExportUrl(reportId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/api/v1/saved-reports/${reportId}/export`;
}

export { ApiError };
export const api = fetchJson;

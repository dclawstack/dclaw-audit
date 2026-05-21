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

export { ApiError };
export const api = fetchJson;

"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AuditDashboardSummary,
  AuditEngagement,
  CreateAuditEngagementPayload,
  CreateEvidenceRequestPayload,
  CreateFindingPayload,
  EngagementStatus,
  EvidenceRequest,
  EvidenceRequestStatus,
  EvidenceVersionLog,
  Finding,
  FindingSeverity,
  FindingStatus,
  RiskLevel,
  aiDraftEvidenceRequests,
  aiRiskCopilot,
  aiDraftFinding,
  aiGenerateReport,
  createEngagement,
  createEvidenceRequest,
  createFinding,
  getDashboardSummary,
  getEvidenceVersionLogs,
  listEngagements,
  updateFinding,
} from "@/lib/api";

const STATUS_OPTIONS: EngagementStatus[] = [
  "planned",
  "in_progress",
  "reporting",
  "completed",
];
const RISK_OPTIONS: RiskLevel[] = ["low", "medium", "high", "critical"];
const REQUEST_STATUS_OPTIONS: EvidenceRequestStatus[] = [
  "draft",
  "sent",
  "received",
  "overdue",
];
const FINDING_STATUS_OPTIONS: FindingStatus[] = [
  "open",
  "in_progress",
  "remediated",
  "verified",
];
const FINDING_SEVERITY_OPTIONS: FindingSeverity[] = ["low", "medium", "high", "critical"];

const INITIAL_ENGAGEMENT_FORM: CreateAuditEngagementPayload = {
  title: "",
  client_name: "",
  status: "planned",
  risk_level: "medium",
  owner_name: "",
  description: "",
  audit_period_start: "",
  audit_period_end: "",
};

const INITIAL_REQUEST_FORM: CreateEvidenceRequestPayload = {
  engagement_id: "",
  title: "",
  description: "",
  request_owner: "",
  due_date: "",
  status: "draft",
  source_system: "",
};

const INITIAL_FINDING_FORM: CreateFindingPayload = {
  engagement_id: "",
  title: "",
  description: "",
  severity: "medium",
  status: "open",
  root_cause: "",
  recommendation: "",
  remediation_plan: "",
  owner_name: "",
  due_date: "",
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function riskBadgeVariant(risk: AuditEngagement["risk_level"]) {
  if (risk === "critical") return "destructive" as const;
  if (risk === "high") return "secondary" as const;
  return "outline" as const;
}

function requestBadgeVariant(status: EvidenceRequest["status"]) {
  if (status === "overdue") return "destructive" as const;
  if (status === "received") return "secondary" as const;
  return "outline" as const;
}

function findingSeverityBadgeVariant(severity: Finding["severity"]) {
  if (severity === "critical") return "destructive" as const;
  if (severity === "high") return "secondary" as const;
  return "outline" as const;
}

function findingStatusBadgeVariant(status: Finding["status"]) {
  if (status === "verified") return "secondary" as const;
  if (status === "remediated") return "default" as const;
  return "outline" as const;
}

function formatAgingLabel(bucket: string) {
  switch (bucket) {
    case "0_30":
      return "0-30 days";
    case "31_60":
      return "31-60 days";
    case "61_90":
      return "61-90 days";
    case "91_plus":
      return "91+ days";
    default:
      return bucket;
  }
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<AuditDashboardSummary | null>(null);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [engagementForm, setEngagementForm] = useState<CreateAuditEngagementPayload>(
    INITIAL_ENGAGEMENT_FORM,
  );
  const [requestForm, setRequestForm] = useState<CreateEvidenceRequestPayload>(INITIAL_REQUEST_FORM);
  const [findingForm, setFindingForm] = useState<CreateFindingPayload>(INITIAL_FINDING_FORM);
  const [findingStatusDrafts, setFindingStatusDrafts] = useState<Record<string, FindingStatus>>({});
  const [loading, setLoading] = useState(true);
  const [submittingEngagement, setSubmittingEngagement] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [submittingFinding, setSubmittingFinding] = useState(false);
  const [updatingFindingId, setUpdatingFindingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI copilot state
  const [aiEngagementId, setAiEngagementId] = useState<string>("");
  const [aiObservation, setAiObservation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<{
    type: string;
    data: unknown;
  } | null>(null);
  const [aiTab, setAiTab] = useState("evidence");

  // Version log state
  const [versionLogs, setVersionLogs] = useState<Record<string, EvidenceVersionLog[]>>({});
  const [loadingVersionLogs, setLoadingVersionLogs] = useState<Record<string, boolean>>({});

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [dashboardSummary, engagementList] = await Promise.all([
        getDashboardSummary(),
        listEngagements(),
      ]);
      setSummary(dashboardSummary);
      setEngagements(engagementList.items);
      setRequestForm((current) => ({
        ...current,
        engagement_id: current.engagement_id || engagementList.items[0]?.id || "",
      }));
      setFindingForm((current) => ({
        ...current,
        engagement_id: current.engagement_id || engagementList.items[0]?.id || "",
      }));
      setFindingStatusDrafts(
        Object.fromEntries(
          dashboardSummary.recent_findings.map((finding) => [finding.id, finding.status]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const statCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Engagements", value: summary.total_engagements },
      { label: "Open Requests", value: summary.open_requests },
      { label: "Overdue Requests", value: summary.overdue_requests },
      { label: "Open Findings", value: summary.open_findings },
      { label: "Overdue Findings", value: summary.overdue_findings },
      { label: "Critical Findings", value: summary.finding_severity_breakdown.critical ?? 0 },
      { label: "Controls", value: summary.total_controls },
      { label: "Requirements", value: summary.total_framework_requirements },
    ];
  }, [summary]);

  async function handleEngagementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!engagementForm.title?.trim() || !engagementForm.client_name?.trim()) {
      setError("Engagement title and client name are required.");
      return;
    }

    setSubmittingEngagement(true);
    setError(null);

    try {
      await createEngagement({
        ...engagementForm,
        title: engagementForm.title.trim(),
        client_name: engagementForm.client_name.trim(),
        owner_name: engagementForm.owner_name?.trim() || undefined,
        description: engagementForm.description?.trim() || undefined,
        audit_period_start: engagementForm.audit_period_start || undefined,
        audit_period_end: engagementForm.audit_period_end || undefined,
      });
      setEngagementForm(INITIAL_ENGAGEMENT_FORM);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create engagement");
    } finally {
      setSubmittingEngagement(false);
    }
  }

  async function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requestForm.engagement_id || !requestForm.title?.trim()) {
      setError("Evidence request title and engagement are required.");
      return;
    }

    setSubmittingRequest(true);
    setError(null);

    try {
      await createEvidenceRequest({
        ...requestForm,
        title: requestForm.title.trim(),
        description: requestForm.description?.trim() || undefined,
        request_owner: requestForm.request_owner?.trim() || undefined,
        due_date: requestForm.due_date || undefined,
        source_system: requestForm.source_system?.trim() || undefined,
      });
      setRequestForm((current) => ({
        ...INITIAL_REQUEST_FORM,
        engagement_id: current.engagement_id,
      }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create evidence request");
    } finally {
      setSubmittingRequest(false);
    }
  }

  async function handleFindingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!findingForm.engagement_id || !findingForm.title?.trim()) {
      setError("Finding title and engagement are required.");
      return;
    }

    setSubmittingFinding(true);
    setError(null);

    try {
      await createFinding({
        ...findingForm,
        title: findingForm.title.trim(),
        description: findingForm.description?.trim() || undefined,
        root_cause: findingForm.root_cause?.trim() || undefined,
        recommendation: findingForm.recommendation?.trim() || undefined,
        remediation_plan: findingForm.remediation_plan?.trim() || undefined,
        owner_name: findingForm.owner_name?.trim() || undefined,
        due_date: findingForm.due_date || undefined,
      });
      setFindingForm((current) => ({
        ...INITIAL_FINDING_FORM,
        engagement_id: current.engagement_id,
      }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create finding");
    } finally {
      setSubmittingFinding(false);
    }
  }

  async function handleFindingStatusUpdate(findingId: string) {
    const statusDraft = findingStatusDrafts[findingId];
    if (!statusDraft) return;

    setUpdatingFindingId(findingId);
    setError(null);

    try {
      await updateFinding(findingId, { status: statusDraft });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update finding");
    } finally {
      setUpdatingFindingId(null);
    }
  }

  async function loadVersionLogs(requestId: string) {
    setLoadingVersionLogs((prev) => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      const res = await getEvidenceVersionLogs(requestId);
      setVersionLogs((prev) => ({ ...prev, [requestId]: res.items }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load version log");
    } finally {
      setLoadingVersionLogs((prev) => ({ ...prev, [requestId]: false }));
    }
  }

  async function handleAIDraftEvidence() {
    if (!aiEngagementId) { setError("Select an engagement first."); return; }
    setAiLoading(true); setError(null); setAiOutput(null);
    try {
      const res = await aiDraftEvidenceRequests(aiEngagementId);
      setAiOutput({ type: "evidence", data: res.evidence_requests });
    } catch (err) { setError(err instanceof Error ? err.message : "AI request failed"); }
    finally { setAiLoading(false); }
  }

  async function handleAIRiskCopilot() {
    if (!aiEngagementId) { setError("Select an engagement first."); return; }
    setAiLoading(true); setError(null); setAiOutput(null);
    try {
      const res = await aiRiskCopilot(aiEngagementId);
      setAiOutput({ type: "risk", data: res });
    } catch (err) { setError(err instanceof Error ? err.message : "AI request failed"); }
    finally { setAiLoading(false); }
  }

  async function handleAIDraftFinding() {
    if (!aiEngagementId) { setError("Select an engagement first."); return; }
    if (!aiObservation.trim()) { setError("Enter an observation first."); return; }
    setAiLoading(true); setError(null); setAiOutput(null);
    try {
      const res = await aiDraftFinding(aiEngagementId, aiObservation);
      setAiOutput({ type: "finding", data: res });
    } catch (err) { setError(err instanceof Error ? err.message : "AI request failed"); }
    finally { setAiLoading(false); }
  }

  async function handleAIGenerateReport() {
    if (!aiEngagementId) { setError("Select an engagement first."); return; }
    setAiLoading(true); setError(null); setAiOutput(null);
    try {
      const res = await aiGenerateReport(aiEngagementId);
      setAiOutput({ type: "report", data: res });
    } catch (err) { setError(err instanceof Error ? err.message : "AI request failed"); }
    finally { setAiLoading(false); }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">DClaw Audit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Audit engagement command center
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Track engagements, evidence, findings, and controls in one workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/risk"><Button type="button" variant="outline" size="sm">Risk Register</Button></Link>
          <Link href="/testing"><Button type="button" variant="outline" size="sm">Control Testing</Button></Link>
          <Link href="/anomalies"><Button type="button" variant="outline" size="sm">Anomalies</Button></Link>
          <Link href="/signals"><Button type="button" variant="outline" size="sm">Signals</Button></Link>
          <Link href="/intelligence"><Button type="button" variant="outline" size="sm">Intelligence</Button></Link>
          <Link href="/reports"><Button type="button" variant="outline" size="sm">Reports</Button></Link>
          <Link href="/controls"><Button type="button" variant="outline" size="sm">Controls</Button></Link>
          <Link href="/workpapers"><Button type="button" variant="outline" size="sm">Workpapers</Button></Link>
          <Link href="/remediation"><Button type="button" variant="outline" size="sm">Remediation</Button></Link>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </section>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle>{loading ? "--" : card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Finding severity breakdown</CardTitle>
            <CardDescription>
              Live counts for prioritizing critical and high-risk issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {FINDING_SEVERITY_OPTIONS.map((severity) => (
              <div key={severity} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={findingSeverityBadgeVariant(severity)}>
                    {formatLabel(severity)}
                  </Badge>
                  <span className="text-2xl font-semibold text-slate-900">
                    {loading ? "--" : summary?.finding_severity_breakdown[severity] ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finding aging buckets</CardTitle>
            <CardDescription>
              Active findings grouped by age to highlight remediation drag.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(summary?.finding_aging_buckets ?? {}).map(([bucket, count]) => (
              <div key={bucket} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">{formatAgingLabel(bucket)}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {loading ? "--" : count}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent engagements</CardTitle>
            <CardDescription>
              Persistent engagement records from <code>/api/v1/engagements</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading engagements…</p>
            ) : engagements.length === 0 ? (
              <p className="text-sm text-slate-500">
                No engagements yet. Create one to seed the audit workspace.
              </p>
            ) : (
              engagements.map((engagement) => (
                <div
                  key={engagement.id}
                  className="rounded-lg border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{engagement.title}</h3>
                      <p className="text-sm text-slate-600">{engagement.client_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{formatLabel(engagement.status)}</Badge>
                      <Badge variant={riskBadgeVariant(engagement.risk_level)}>
                        {formatLabel(engagement.risk_level)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <span>Owner: {engagement.owner_name || "Unassigned"}</span>
                    <span>
                      Period: {engagement.audit_period_start || "TBD"} → {engagement.audit_period_end || "TBD"}
                    </span>
                  </div>
                  {engagement.description ? (
                    <p className="mt-3 text-sm text-slate-700">{engagement.description}</p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create engagement</CardTitle>
            <CardDescription>
              Foundational audit engagement management backed by PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleEngagementSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Engagement title</Label>
                <Input
                  id="title"
                  value={engagementForm.title}
                  onChange={(event) =>
                    setEngagementForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="SOX Q4 access review"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client / business unit</Label>
                <Input
                  id="client_name"
                  value={engagementForm.client_name}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      client_name: event.target.value,
                    }))
                  }
                  placeholder="Finance Operations"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={engagementForm.status}
                    onChange={(event) =>
                      setEngagementForm((current) => ({
                        ...current,
                        status: event.target.value as EngagementStatus,
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatLabel(option)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_level">Risk level</Label>
                  <Select
                    id="risk_level"
                    value={engagementForm.risk_level}
                    onChange={(event) =>
                      setEngagementForm((current) => ({
                        ...current,
                        risk_level: event.target.value as RiskLevel,
                      }))
                    }
                  >
                    {RISK_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatLabel(option)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner</Label>
                <Input
                  id="owner_name"
                  value={engagementForm.owner_name}
                  onChange={(event) =>
                    setEngagementForm((current) => ({ ...current, owner_name: event.target.value }))
                  }
                  placeholder="Jordan Lee"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="audit_period_start">Audit period start</Label>
                  <Input
                    id="audit_period_start"
                    type="date"
                    value={engagementForm.audit_period_start}
                    onChange={(event) =>
                      setEngagementForm((current) => ({
                        ...current,
                        audit_period_start: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit_period_end">Audit period end</Label>
                  <Input
                    id="audit_period_end"
                    type="date"
                    value={engagementForm.audit_period_end}
                    onChange={(event) =>
                      setEngagementForm((current) => ({
                        ...current,
                        audit_period_end: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Scope note</Label>
                <textarea
                  id="description"
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={engagementForm.description}
                  onChange={(event) =>
                    setEngagementForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Briefly describe the control area, objective, or expected evidence scope."
                />
              </div>

              <Button type="submit" className="w-full" disabled={submittingEngagement}>
                {submittingEngagement ? "Creating engagement…" : "Create engagement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent evidence requests</CardTitle>
            <CardDescription>
              Complexity 0.4 workflow wedge: draft, send, receive, and flag overdue requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading evidence requests…</p>
            ) : !summary || summary.recent_evidence_requests.length === 0 ? (
              <p className="text-sm text-slate-500">
                No evidence requests yet. Add one to start tracking collection workflow.
              </p>
            ) : (
              summary.recent_evidence_requests.map((request) => {
                const engagement = engagements.find((item) => item.id === request.engagement_id);
                const logs = versionLogs[request.id] ?? [];
                const showLogs = loadingVersionLogs[request.id] !== undefined;
                return (
                  <div key={request.id} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{request.title}</h3>
                        <p className="text-sm text-slate-600">
                          {engagement?.title || "Unknown engagement"}
                        </p>
                      </div>
                      <Badge variant={requestBadgeVariant(request.status)}>
                        {formatLabel(request.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <span>Owner: {request.request_owner || "Unassigned"}</span>
                      <span>Due: {request.due_date || "TBD"}</span>
                      <span>Source: {request.source_system || "Unspecified"}</span>
                    </div>
                    {request.description ? (
                      <p className="mt-3 text-sm text-slate-700">{request.description}</p>
                    ) : null}
                    <div className="mt-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (versionLogs[request.id]) {
                            setVersionLogs((prev) => {
                              const next = { ...prev };
                              delete next[request.id];
                              return next;
                            });
                          } else {
                            void loadVersionLogs(request.id);
                          }
                        }}
                      >
                        {versionLogs[request.id] ? "Hide audit log" : "View audit log"}
                      </Button>
                    </div>
                    {loadingVersionLogs[request.id] ? (
                      <p className="mt-2 text-xs text-slate-500">Loading audit log…</p>
                    ) : logs.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="rounded-md border border-slate-100 bg-slate-50 p-2 text-xs"
                          >
                            <div className="flex items-center gap-2 text-slate-600">
                              <Badge variant="outline" className="text-[10px]">
                                {formatLabel(log.action)}
                              </Badge>
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                              {log.actor_name ? <span>· {log.actor_name}</span> : null}
                            </div>
                            {log.note ? <p className="mt-1 text-slate-700">{log.note}</p> : null}
                            {log.previous_value || log.new_value ? (
                              <p className="mt-1 text-slate-600">
                                {log.previous_value ? `From: ${log.previous_value}` : null}
                                {log.previous_value && log.new_value ? " → " : null}
                                {log.new_value ? `To: ${log.new_value}` : null}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : versionLogs[request.id] !== undefined ? (
                      <p className="mt-2 text-xs text-slate-500">No audit log entries yet.</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create evidence request</CardTitle>
            <CardDescription>
              Link evidence collection directly to a live engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleRequestSubmit}>
              <div className="space-y-2">
                <Label htmlFor="request_engagement_id">Engagement</Label>
                <Select
                  id="request_engagement_id"
                  value={requestForm.engagement_id}
                  onChange={(event) =>
                    setRequestForm((current) => ({
                      ...current,
                      engagement_id: event.target.value,
                    }))
                  }
                >
                  <option value="">Select engagement</option>
                  {engagements.map((engagement) => (
                    <option key={engagement.id} value={engagement.id}>
                      {engagement.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_title">Request title</Label>
                <Input
                  id="request_title"
                  value={requestForm.title}
                  onChange={(event) =>
                    setRequestForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Upload current quarter privileged access report"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="request_status">Status</Label>
                  <Select
                    id="request_status"
                    value={requestForm.status}
                    onChange={(event) =>
                      setRequestForm((current) => ({
                        ...current,
                        status: event.target.value as EvidenceRequestStatus,
                      }))
                    }
                  >
                    {REQUEST_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatLabel(option)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request_due_date">Due date</Label>
                  <Input
                    id="request_due_date"
                    type="date"
                    value={requestForm.due_date}
                    onChange={(event) =>
                      setRequestForm((current) => ({ ...current, due_date: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_owner">Request owner</Label>
                <Input
                  id="request_owner"
                  value={requestForm.request_owner}
                  onChange={(event) =>
                    setRequestForm((current) => ({
                      ...current,
                      request_owner: event.target.value,
                    }))
                  }
                  placeholder="Avery Morgan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_system">Source system</Label>
                <Input
                  id="source_system"
                  value={requestForm.source_system}
                  onChange={(event) =>
                    setRequestForm((current) => ({
                      ...current,
                      source_system: event.target.value,
                    }))
                  }
                  placeholder="Okta / NetSuite / Jira / Shared Drive"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_description">Request description</Label>
                <textarea
                  id="request_description"
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={requestForm.description}
                  onChange={(event) =>
                    setRequestForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the report, extracts, approvals, or screenshots expected from the owner."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submittingRequest || engagements.length === 0}
              >
                {submittingRequest ? "Creating request…" : "Create evidence request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent findings</CardTitle>
            <CardDescription>
              Initial remediation lifecycle: open, in progress, remediated, and verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading findings…</p>
            ) : !summary || summary.recent_findings.length === 0 ? (
              <p className="text-sm text-slate-500">
                No findings yet. Create one to start remediation tracking.
              </p>
            ) : (
              summary.recent_findings.map((finding) => {
                const engagement = engagements.find((item) => item.id === finding.engagement_id);
                const selectedStatus = findingStatusDrafts[finding.id] ?? finding.status;
                return (
                  <div key={finding.id} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{finding.title}</h3>
                        <p className="text-sm text-slate-600">
                          {engagement?.title || "Unknown engagement"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={findingSeverityBadgeVariant(finding.severity)}>
                          {formatLabel(finding.severity)}
                        </Badge>
                        <Badge variant={findingStatusBadgeVariant(finding.status)}>
                          {formatLabel(finding.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <span>Owner: {finding.owner_name || "Unassigned"}</span>
                      <span>Due: {finding.due_date || "TBD"}</span>
                    </div>

                    {finding.description ? (
                      <p className="mt-3 text-sm text-slate-700">{finding.description}</p>
                    ) : null}
                    {finding.root_cause ? (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-medium">Root cause:</span> {finding.root_cause}
                      </p>
                    ) : null}
                    {finding.recommendation ? (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-medium">Recommendation:</span> {finding.recommendation}
                      </p>
                    ) : null}
                    {finding.remediation_plan ? (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-medium">Remediation plan:</span> {finding.remediation_plan}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                      <Select
                        value={selectedStatus}
                        onChange={(event) =>
                          setFindingStatusDrafts((current) => ({
                            ...current,
                            [finding.id]: event.target.value as FindingStatus,
                          }))
                        }
                      >
                        {FINDING_STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {formatLabel(option)}
                          </option>
                        ))}
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updatingFindingId === finding.id || selectedStatus === finding.status}
                        onClick={() => void handleFindingStatusUpdate(finding.id)}
                      >
                        {updatingFindingId === finding.id ? "Saving…" : "Update lifecycle"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create finding</CardTitle>
            <CardDescription>
              Capture issue severity, recommendation, and remediation ownership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleFindingSubmit}>
              <div className="space-y-2">
                <Label htmlFor="finding_engagement_id">Engagement</Label>
                <Select
                  id="finding_engagement_id"
                  value={findingForm.engagement_id}
                  onChange={(event) =>
                    setFindingForm((current) => ({
                      ...current,
                      engagement_id: event.target.value,
                    }))
                  }
                >
                  <option value="">Select engagement</option>
                  {engagements.map((engagement) => (
                    <option key={engagement.id} value={engagement.id}>
                      {engagement.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_title">Finding title</Label>
                <Input
                  id="finding_title"
                  value={findingForm.title}
                  onChange={(event) =>
                    setFindingForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Privileged access reviews were not completed for terminated users"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="finding_severity">Severity</Label>
                  <Select
                    id="finding_severity"
                    value={findingForm.severity}
                    onChange={(event) =>
                      setFindingForm((current) => ({
                        ...current,
                        severity: event.target.value as FindingSeverity,
                      }))
                    }
                  >
                    {FINDING_SEVERITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatLabel(option)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finding_status">Lifecycle status</Label>
                  <Select
                    id="finding_status"
                    value={findingForm.status}
                    onChange={(event) =>
                      setFindingForm((current) => ({
                        ...current,
                        status: event.target.value as FindingStatus,
                      }))
                    }
                  >
                    {FINDING_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatLabel(option)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="finding_owner">Owner</Label>
                  <Input
                    id="finding_owner"
                    value={findingForm.owner_name}
                    onChange={(event) =>
                      setFindingForm((current) => ({
                        ...current,
                        owner_name: event.target.value,
                      }))
                    }
                    placeholder="Control owner or remediation lead"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finding_due_date">Due date</Label>
                  <Input
                    id="finding_due_date"
                    type="date"
                    value={findingForm.due_date}
                    onChange={(event) =>
                      setFindingForm((current) => ({ ...current, due_date: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_description">Observation</Label>
                <textarea
                  id="finding_description"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={findingForm.description}
                  onChange={(event) =>
                    setFindingForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Summarize the condition and impacted process."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_root_cause">Root cause</Label>
                <textarea
                  id="finding_root_cause"
                  className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={findingForm.root_cause}
                  onChange={(event) =>
                    setFindingForm((current) => ({
                      ...current,
                      root_cause: event.target.value,
                    }))
                  }
                  placeholder="Explain why the control gap occurred."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_recommendation">Recommendation</Label>
                <textarea
                  id="finding_recommendation"
                  className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={findingForm.recommendation}
                  onChange={(event) =>
                    setFindingForm((current) => ({
                      ...current,
                      recommendation: event.target.value,
                    }))
                  }
                  placeholder="State the recommended corrective action."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_remediation_plan">Remediation plan</Label>
                <textarea
                  id="finding_remediation_plan"
                  className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={findingForm.remediation_plan}
                  onChange={(event) =>
                    setFindingForm((current) => ({
                      ...current,
                      remediation_plan: event.target.value,
                    }))
                  }
                  placeholder="Capture management action plan and expected next steps."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submittingFinding || engagements.length === 0}
              >
                {submittingFinding ? "Creating finding…" : "Create finding"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* AI Copilot Section */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Copilot</CardTitle>
            <CardDescription>
              Grounded AI outputs tied to engagement data: draft evidence requests, suggest risks,
              draft findings, and generate report sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="ai_engagement">Engagement context</Label>
                <Select
                  id="ai_engagement"
                  value={aiEngagementId}
                  onChange={(event) => setAiEngagementId(event.target.value)}
                >
                  <option value="">Select engagement</option>
                  {engagements.map((engagement) => (
                    <option key={engagement.id} value={engagement.id}>
                      {engagement.title}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadData()}
                disabled={loading}
              >
                Refresh engagements
              </Button>
            </div>

            <Tabs value={aiTab} onValueChange={setAiTab}>
              <TabsList>
                <TabsTrigger value="evidence">Draft Evidence</TabsTrigger>
                <TabsTrigger value="risk">Risk Copilot</TabsTrigger>
                <TabsTrigger value="finding">Draft Finding</TabsTrigger>
                <TabsTrigger value="report">Report Section</TabsTrigger>
              </TabsList>

              <TabsContent value="evidence" className="space-y-3">
                <p className="text-sm text-slate-600">
                  Generate evidence request suggestions grounded in the engagement scope,
                  risk level, and existing findings.
                </p>
                <Button
                  type="button"
                  disabled={aiLoading || !aiEngagementId}
                  onClick={() => void handleAIDraftEvidence()}
                >
                  {aiLoading ? "Thinking…" : "Draft evidence requests"}
                </Button>
              </TabsContent>

              <TabsContent value="risk" className="space-y-3">
                <p className="text-sm text-slate-600">
                  Suggest key risks, controls, and test ideas based on engagement scope and risk level.
                </p>
                <Button
                  type="button"
                  disabled={aiLoading || !aiEngagementId}
                  onClick={() => void handleAIRiskCopilot()}
                >
                  {aiLoading ? "Thinking…" : "Suggest risks & tests"}
                </Button>
              </TabsContent>

              <TabsContent value="finding" className="space-y-3">
                <p className="text-sm text-slate-600">
                  Convert your structured observation into a draft finding with root cause,
                  recommendation, and severity.
                </p>
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={aiObservation}
                  onChange={(event) => setAiObservation(event.target.value)}
                  placeholder="Describe the evidence observation or exception you want to convert into a finding..."
                />
                <Button
                  type="button"
                  disabled={aiLoading || !aiEngagementId || !aiObservation.trim()}
                  onClick={() => void handleAIDraftFinding()}
                >
                  {aiLoading ? "Thinking…" : "Draft finding"}
                </Button>
              </TabsContent>

              <TabsContent value="report" className="space-y-3">
                <p className="text-sm text-slate-600">
                  Generate an executive summary and key observations for the selected engagement.
                </p>
                <Button
                  type="button"
                  disabled={aiLoading || !aiEngagementId}
                  onClick={() => void handleAIGenerateReport()}
                >
                  {aiLoading ? "Thinking…" : "Generate report section"}
                </Button>
              </TabsContent>
            </Tabs>

            {aiOutput ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  {aiOutput.type === "evidence" && "Drafted evidence requests"}
                  {aiOutput.type === "risk" && "Risk copilot suggestions"}
                  {aiOutput.type === "finding" && "Draft finding"}
                  {aiOutput.type === "report" && "Generated report section"}
                </p>
                <pre className="max-h-96 overflow-auto rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800">
                  {JSON.stringify(aiOutput.data, null, 2)}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

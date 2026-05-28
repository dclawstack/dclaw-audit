"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";
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
import {
  AuditEngagement,
  AuditSignal,
  CreateAuditSignalPayload,
  SignalSource,
  SignalStatus,
  SignalType,
  createAuditSignal,
  deleteAuditSignal,
  listAuditSignals,
  listEngagements,
  updateAuditSignal,
} from "@/lib/api";

const SOURCE_OPTIONS: SignalSource[] = ["erp", "iam", "ticketing", "cloud", "manual"];
const TYPE_OPTIONS: SignalType[] = ["control_deviation", "access_change", "config_change", "threshold_breach", "anomaly"];
const STATUS_OPTIONS: SignalStatus[] = ["new", "reviewed", "dismissed", "escalated"];
const SEVERITY_OPTIONS = ["low", "medium", "high", "critical"];

function statusColor(s: SignalStatus) {
  const map: Record<SignalStatus, string> = {
    new: "bg-red-100 text-red-700",
    reviewed: "bg-blue-100 text-blue-700",
    dismissed: "bg-slate-100 text-slate-500",
    escalated: "bg-purple-100 text-purple-700",
  };
  return map[s];
}

function severityColor(s: string) {
  const map: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-700",
  };
  return map[s] ?? "bg-slate-100 text-slate-700";
}

function sourceColor(s: SignalSource) {
  const map: Record<SignalSource, string> = {
    erp: "bg-blue-50 text-blue-700",
    iam: "bg-orange-50 text-orange-700",
    ticketing: "bg-violet-50 text-violet-700",
    cloud: "bg-cyan-50 text-cyan-700",
    manual: "bg-slate-50 text-slate-700",
  };
  return map[s];
}

const INITIAL_FORM: CreateAuditSignalPayload = {
  signal_source: "manual",
  signal_type: "control_deviation",
  title: "",
  description: "",
  entity_ref: "",
  severity: "medium",
};

export default function SignalsPage() {
  const [signals, setSignals] = useState<AuditSignal[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [filterStatus, setFilterStatus] = useState<SignalStatus | "">("");
  const [filterSource, setFilterSource] = useState<SignalSource | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAuditSignalPayload>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<SignalStatus>("reviewed");
  const [reviewedBy, setReviewedBy] = useState("");
  const [linkEngagement, setLinkEngagement] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [sigRes, engRes] = await Promise.all([
        listAuditSignals({ status: filterStatus || undefined, source: filterSource || undefined }),
        listEngagements(),
      ]);
      setSignals(sigRes.items);
      setEngagements(engRes.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [filterStatus, filterSource]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAuditSignal(form);
      setForm({ ...INITIAL_FORM });
      setShowForm(false);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(signalId: string) {
    try {
      await updateAuditSignal(signalId, {
        status: reviewStatus,
        reviewed_by: reviewedBy || undefined,
        engagement_id: linkEngagement || undefined,
      });
      setReviewingId(null);
      setReviewedBy("");
      setLinkEngagement("");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this signal?")) return;
    try {
      await deleteAuditSignal(id);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const newCount = signals.filter((s) => s.status === "new").length;
  const escalatedCount = signals.filter((s) => s.status === "escalated").length;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">DClaw Audit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="h-7 w-7 text-cyan-600" />
            Continuous Auditing Signals
          </h1>
          <p className="mt-2 text-sm text-slate-600">Ingest signals from ERP, IAM, ticketing, and cloud systems. Route deviations to findings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Button></Link>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ New Signal"}</Button>
        </div>
      </section>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">Total Signals</p><p className="text-2xl font-bold">{signals.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">New</p><p className="text-2xl font-bold text-red-600">{newCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">Escalated</p><p className="text-2xl font-bold text-purple-600">{escalatedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">Reviewed</p><p className="text-2xl font-bold text-blue-600">{signals.filter((s) => s.status === "reviewed").length}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as SignalStatus | "")} className="w-36">
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Source</Label>
            <Select value={filterSource} onChange={(e) => setFilterSource(e.target.value as SignalSource | "")} className="w-36">
              <option value="">All</option>
              {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Signal</CardTitle><CardDescription>Manually ingest a control deviation or system event.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleCreate(e)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label>Source *</Label>
                <Select required value={form.signal_source} onChange={(e) => setForm({ ...form, signal_source: e.target.value as SignalSource })}>
                  {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Type *</Label>
                <Select required value={form.signal_type} onChange={(e) => setForm({ ...form, signal_type: e.target.value as SignalType })}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </Select>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Title *</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Privileged account created outside workflow" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Severity</Label>
                <Select value={form.severity ?? "medium"} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  {SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Entity Reference</Label>
                <Input value={form.entity_ref ?? ""} onChange={(e) => setForm({ ...form, entity_ref: e.target.value })} placeholder="e.g. user:jdoe, service:payments-api" />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Description</Label>
                <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Additional context…" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Create Signal"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Signals List */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : signals.length === 0 ? (
        <Card><CardContent className="pt-6 text-sm text-slate-400">No signals yet. Create one above or configure integrations to auto-ingest.</CardContent></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {signals.map((signal) => (
            <Card key={signal.id} className={signal.status === "new" ? "border-red-200" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className={sourceColor(signal.signal_source)}>{signal.signal_source.toUpperCase()}</Badge>
                      <Badge className="bg-slate-100 text-slate-600 text-xs">{signal.signal_type.replace(/_/g, " ")}</Badge>
                      <Badge className={severityColor(signal.severity)}>{signal.severity}</Badge>
                      <Badge className={statusColor(signal.status)}>{signal.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{signal.title}</p>
                    {signal.description && <p className="text-xs text-slate-500 mt-0.5">{signal.description}</p>}
                    {signal.entity_ref && <p className="text-xs text-slate-400 mt-0.5">Ref: {signal.entity_ref}</p>}
                    {signal.engagement_id && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        Linked to: {engagements.find((e) => e.id === signal.engagement_id)?.title ?? signal.engagement_id}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{new Date(signal.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {signal.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => setReviewingId(signal.id === reviewingId ? null : signal.id)}>Review</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => void handleDelete(signal.id)} className="text-red-500">Delete</Button>
                  </div>
                </div>
                {reviewingId === signal.id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 rounded bg-slate-50 p-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Decision</Label>
                      <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as SignalStatus)}>
                        <option value="reviewed">Reviewed</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="escalated">Escalated</option>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Link to Engagement</Label>
                      <Select value={linkEngagement} onChange={(e) => setLinkEngagement(e.target.value)} className="w-48">
                        <option value="">None</option>
                        {engagements.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Reviewed by</Label>
                      <Input value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} placeholder="Analyst name" className="w-36" />
                    </div>
                    <Button size="sm" onClick={() => void handleReview(signal.id)}>Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setReviewingId(null)}>Cancel</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

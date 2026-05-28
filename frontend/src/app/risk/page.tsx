"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
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
  CreateRiskItemPayload,
  RiskItem,
  RiskItemStatus,
  createRiskItem,
  deleteRiskItem,
  listEngagements,
  listRiskItems,
  updateRiskItem,
} from "@/lib/api";

const STATUS_OPTIONS: RiskItemStatus[] = ["open", "mitigated", "accepted"];
const SCORE_OPTIONS = [1, 2, 3, 4, 5];

const INITIAL_FORM: CreateRiskItemPayload = {
  engagement_id: "",
  title: "",
  description: "",
  category: "",
  likelihood: 3,
  impact: 3,
  owner_name: "",
  status: "open",
  mitigation_notes: "",
};

function scoreColor(score: number) {
  if (score >= 20) return "bg-red-100 text-red-800";
  if (score >= 12) return "bg-orange-100 text-orange-800";
  if (score >= 6) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

function scoreLabel(score: number) {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

function statusColor(s: RiskItemStatus) {
  return s === "open" ? "bg-red-100 text-red-700" : s === "mitigated" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
}

export default function RiskPage() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [filterEngagement, setFilterEngagement] = useState("");
  const [filterStatus, setFilterStatus] = useState<RiskItemStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateRiskItemPayload>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [mitigatingId, setMitigatingId] = useState<string | null>(null);
  const [mitigationNote, setMitigationNote] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [riskRes, engRes] = await Promise.all([
        listRiskItems(filterEngagement || undefined, filterStatus || undefined),
        listEngagements(),
      ]);
      setItems(riskRes.items);
      setEngagements(engRes.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [filterEngagement, filterStatus]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRiskItem(form);
      setForm({ ...INITIAL_FORM });
      setShowForm(false);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMitigate(item: RiskItem) {
    try {
      await updateRiskItem(item.id, { status: "mitigated", mitigation_notes: mitigationNote || undefined });
      setMitigatingId(null);
      setMitigationNote("");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this risk item?")) return;
    try {
      await deleteRiskItem(id);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">DClaw Audit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-orange-500" />
            Risk Register
          </h1>
          <p className="mt-2 text-sm text-slate-600">Track and score risks per engagement. Residual scoring after controls applied.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Button></Link>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ New Risk"}</Button>
        </div>
      </section>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Engagement</Label>
            <Select value={filterEngagement} onChange={(e) => setFilterEngagement(e.target.value)} className="w-56">
              <option value="">All engagements</option>
              {engagements.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as RiskItemStatus | "")} className="w-36">
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Risk Item</CardTitle><CardDescription>Inherent risk = likelihood × impact (1–5 scale)</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleCreate(e)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Engagement *</Label>
                <Select required value={form.engagement_id} onChange={(e) => setForm({ ...form, engagement_id: e.target.value })}>
                  <option value="">Select engagement…</option>
                  {engagements.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </Select>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Title *</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Unauthorized access to financial systems" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Category</Label>
                <Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. IT, Financial, Operational" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Owner</Label>
                <Input value={form.owner_name ?? ""} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="Risk owner name" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Likelihood (1–5)</Label>
                <Select value={String(form.likelihood ?? 3)} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}>
                  {SCORE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Impact (1–5)</Label>
                <Select value={String(form.impact ?? 3)} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}>
                  {SCORE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Description</Label>
                <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Risk description…" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <span className="text-sm text-slate-600">Inherent score preview:</span>
                <Badge className={scoreColor((form.likelihood ?? 3) * (form.impact ?? 3))}>
                  {(form.likelihood ?? 3) * (form.impact ?? 3)} — {scoreLabel((form.likelihood ?? 3) * (form.impact ?? 3))}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Create Risk Item"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Risk Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Items ({items.length})</CardTitle>
          <CardDescription>Sorted by risk score descending. Click Mitigate to update residual risk.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-400">No risk items yet. Create one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 font-medium">L×I</th>
                    <th className="pb-2 pr-4 font-medium">Score</th>
                    <th className="pb-2 pr-4 font-medium">Residual</th>
                    <th className="pb-2 pr-4 font-medium">Owner</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <>
                      <tr key={item.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 pr-4 font-medium text-slate-800">{item.title}</td>
                        <td className="py-2 pr-4 text-slate-500">{item.category ?? "—"}</td>
                        <td className="py-2 pr-4 text-slate-500">{item.likelihood}×{item.impact}</td>
                        <td className="py-2 pr-4">
                          <Badge className={scoreColor(item.risk_score)}>{item.risk_score} {scoreLabel(item.risk_score)}</Badge>
                        </td>
                        <td className="py-2 pr-4">
                          {item.residual_score != null
                            ? <Badge className={scoreColor(item.residual_score)}>{item.residual_score}</Badge>
                            : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="py-2 pr-4 text-slate-500">{item.owner_name ?? "—"}</td>
                        <td className="py-2 pr-4">
                          <Badge className={statusColor(item.status)}>{item.status}</Badge>
                        </td>
                        <td className="py-2 flex gap-2">
                          {item.status === "open" && (
                            <Button size="sm" variant="outline" onClick={() => setMitigatingId(item.id)}>Mitigate</Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => void handleDelete(item.id)} className="text-red-500">Delete</Button>
                        </td>
                      </tr>
                      {mitigatingId === item.id && (
                        <tr key={`mit-${item.id}`}>
                          <td colSpan={8} className="bg-slate-50 px-4 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                              <div className="flex flex-col gap-1 flex-1">
                                <Label className="text-xs">Mitigation notes</Label>
                                <Input value={mitigationNote} onChange={(e) => setMitigationNote(e.target.value)} placeholder="Describe controls applied…" />
                              </div>
                              <Button size="sm" onClick={() => void handleMitigate(item)}>Confirm</Button>
                              <Button size="sm" variant="ghost" onClick={() => setMitigatingId(null)}>Cancel</Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

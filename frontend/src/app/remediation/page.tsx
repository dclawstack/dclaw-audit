"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Bot, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AuditEngagement,
  CreateRemediationPlanPayload,
  Finding,
  RemediationPlan,
  RemediationStatus,
  UpdateRemediationPlanPayload,
  aiGenerateRemediationPlan,
  createRemediationPlan,
  deleteRemediationPlan,
  listEngagements,
  listFindings,
  listRemediationPlans,
  updateRemediationPlan,
} from "@/lib/api";

const STATUS_OPTIONS: RemediationStatus[] = ["open", "in_progress", "completed", "overdue", "cancelled"];

const STATUS_COLORS: Record<RemediationStatus, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-200 text-red-900",
  cancelled: "bg-gray-100 text-gray-600",
};

const INITIAL_FORM: CreateRemediationPlanPayload = {
  finding_id: "",
  engagement_id: "",
  title: "",
  action_items: "",
  owner_name: "",
  due_date: "",
  status: "open",
  progress_pct: 0,
  notes: "",
};

export default function RemediationPage() {
  const [plans, setPlans] = useState<RemediationPlan[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filterEngagement, setFilterEngagement] = useState("");
  const [filterStatus, setFilterStatus] = useState<RemediationStatus | "">("");
  const [form, setForm] = useState<CreateRemediationPlanPayload>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateRemediationPlanPayload>({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [planRes, engRes, findRes] = await Promise.all([
        listRemediationPlans({ engagementId: filterEngagement || undefined, status: (filterStatus as RemediationStatus) || undefined }),
        listEngagements(),
        listFindings(),
      ]);
      setPlans(planRes.items);
      setEngagements(engRes.items);
      setFindings(findRes.items);
    } catch (e) { setError(String(e)); }
  }

  useEffect(() => { load(); }, [filterEngagement, filterStatus]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.finding_id || !form.engagement_id || !form.title) return;
    setLoading(true);
    try { await createRemediationPlan(form); setForm(INITIAL_FORM); await load(); }
    catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function handleAIGenerate() {
    if (!form.finding_id || !form.engagement_id) { setError("Select engagement and finding first"); return; }
    setAiLoading(true);
    try {
      const result = await aiGenerateRemediationPlan(form.finding_id, form.engagement_id);
      setForm((f) => ({
        ...f,
        title: result.title || f.title,
        action_items: result.action_items || f.action_items,
        owner_name: result.owner_name || f.owner_name,
        notes: result.notes || f.notes,
      }));
    } catch (e) { setError(String(e)); }
    setAiLoading(false);
  }

  async function handleUpdate(id: string) {
    setLoading(true);
    try { await updateRemediationPlan(id, editForm); setEditingId(null); await load(); }
    catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this remediation plan?")) return;
    try { await deleteRemediationPlan(id); await load(); }
    catch (e) { setError(String(e)); }
  }

  function findingTitle(id: string) {
    return findings.find((f) => f.id === id)?.title ?? id.slice(0, 8);
  }

  function engagementTitle(id: string) {
    return engagements.find((e) => e.id === id)?.title ?? id.slice(0, 8);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6" />
        <span className="font-bold text-lg">DClaw Audit</span>
        <span className="text-gray-400 mx-2">|</span>
        <span className="text-gray-200">Remediation Plans</span>
        <div className="ml-auto">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-200 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list"><CheckCircle className="h-4 w-4 mr-1" />Plans</TabsTrigger>
            <TabsTrigger value="create">+ New Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterEngagement}
                onChange={(e) => setFilterEngagement(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Engagements</option>
                {engagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>{eng.title}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as RemediationStatus | "")}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {plans.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-400">No remediation plans found.</CardContent></Card>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{plan.title}</CardTitle>
                          {plan.ai_generated && <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Finding: {findingTitle(plan.finding_id)} &nbsp;·&nbsp; Engagement: {engagementTitle(plan.engagement_id)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Owner: {plan.owner_name || "—"} &nbsp;·&nbsp; Due: {plan.due_date || "—"}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[plan.status]}`}>
                        {plan.status.replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span><span>{plan.progress_pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${plan.progress_pct}%` }} />
                      </div>
                    </div>

                    {editingId === plan.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full border rounded p-2 text-sm h-24"
                          value={editForm.action_items ?? plan.action_items ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, action_items: e.target.value }))}
                          placeholder="Action items (one per line)"
                        />
                        <div className="flex gap-2 items-center">
                          <select
                            value={editForm.status ?? plan.status}
                            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as RemediationStatus }))}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                          </select>
                          <Input
                            type="number"
                            min={0} max={100}
                            value={editForm.progress_pct ?? plan.progress_pct}
                            onChange={(e) => setEditForm((f) => ({ ...f, progress_pct: Number(e.target.value) }))}
                            className="w-20"
                            placeholder="Progress %"
                          />
                          <Button size="sm" onClick={() => handleUpdate(plan.id)} disabled={loading}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {plan.action_items && (
                          <div className="text-sm text-gray-700 space-y-1">
                            {plan.action_items.split("\n").filter(Boolean).map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(plan.id); setEditForm({}); }}>Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(plan.id)}>Delete</Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <Card className="max-w-2xl">
              <CardHeader><CardTitle>New Remediation Plan</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Engagement *</Label>
                      <select
                        required
                        value={form.engagement_id}
                        onChange={(e) => setForm((f) => ({ ...f, engagement_id: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                      >
                        <option value="">Select engagement…</option>
                        {engagements.map((eng) => (
                          <option key={eng.id} value={eng.id}>{eng.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Finding *</Label>
                      <select
                        required
                        value={form.finding_id}
                        onChange={(e) => setForm((f) => ({ ...f, finding_id: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                      >
                        <option value="">Select finding…</option>
                        {findings
                          .filter((fn) => !form.engagement_id || fn.engagement_id === form.engagement_id)
                          .map((fn) => (
                            <option key={fn.id} value={fn.id}>{fn.title}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Title *</Label>
                      <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Remediation plan title" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAIGenerate}
                      disabled={aiLoading || !form.finding_id || !form.engagement_id}
                      className="shrink-0"
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      {aiLoading ? "Generating…" : "AI Generate"}
                    </Button>
                  </div>

                  <div>
                    <Label>Action Items</Label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-28 mt-1"
                      value={form.action_items}
                      onChange={(e) => setForm((f) => ({ ...f, action_items: e.target.value }))}
                      placeholder="Enter action items, one per line…"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Owner</Label>
                      <Input value={form.owner_name} onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))} placeholder="Owner name" />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
                  </div>

                  <Button type="submit" disabled={loading || !form.finding_id || !form.engagement_id || !form.title} className="bg-gray-900 hover:bg-gray-700 text-white">
                    Create Plan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

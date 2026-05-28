"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";
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
  AuditEngagement,
  Control,
  ControlTest,
  ControlTestResult,
  ControlTestStatus,
  ControlTestType,
  CreateControlTestPayload,
  UpdateControlTestPayload,
  createControlTest,
  createTestSample,
  deleteControlTest,
  listControlTests,
  listControls,
  listEngagements,
  updateControlTest,
} from "@/lib/api";

const TYPE_OPTIONS: ControlTestType[] = ["manual", "automated", "sample_based"];
const STATUS_OPTIONS: ControlTestStatus[] = ["planned", "in_progress", "completed", "exception"];
const RESULT_OPTIONS: ControlTestResult[] = ["pass", "fail", "exception", "not_applicable"];

function statusBadge(s: ControlTestStatus) {
  const map: Record<ControlTestStatus, string> = {
    planned: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    exception: "bg-red-100 text-red-700",
  };
  return map[s];
}

function resultBadge(r: ControlTestResult | null) {
  if (!r) return "bg-slate-100 text-slate-500";
  const map: Record<ControlTestResult, string> = {
    pass: "bg-green-100 text-green-700",
    fail: "bg-red-100 text-red-700",
    exception: "bg-orange-100 text-orange-700",
    not_applicable: "bg-slate-100 text-slate-500",
  };
  return map[r];
}

const INITIAL_FORM: CreateControlTestPayload = {
  engagement_id: "",
  title: "",
  test_type: "manual",
  test_objective: "",
  test_procedure: "",
  owner_name: "",
  reviewer_name: "",
};

export default function TestingPage() {
  const [tests, setTests] = useState<ControlTest[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [filterEngagement, setFilterEngagement] = useState("");
  const [filterStatus, setFilterStatus] = useState<ControlTestStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateControlTestPayload>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateControlTestPayload>({});
  const [sampleTestId, setSampleTestId] = useState<string | null>(null);
  const [sampleRef, setSampleRef] = useState("");
  const [sampleResult, setSampleResult] = useState<ControlTestResult>("pass");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [testRes, engRes, ctrlRes] = await Promise.all([
        listControlTests(filterEngagement || undefined, undefined, filterStatus || undefined),
        listEngagements(),
        listControls(),
      ]);
      setTests(testRes.items);
      setEngagements(engRes.items);
      setControls(ctrlRes.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [filterEngagement, filterStatus]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createControlTest(form);
      setForm({ ...INITIAL_FORM });
      setShowForm(false);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(testId: string) {
    try {
      await updateControlTest(testId, updateForm);
      setUpdatingId(null);
      setUpdateForm({});
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleAddSample(testId: string) {
    if (!sampleRef.trim()) return;
    try {
      await createTestSample(testId, { item_reference: sampleRef, result: sampleResult });
      setSampleTestId(null);
      setSampleRef("");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add sample failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this test?")) return;
    try {
      await deleteControlTest(id);
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
            <ClipboardCheck className="h-7 w-7 text-blue-600" />
            Control Testing
          </h1>
          <p className="mt-2 text-sm text-slate-600">Design, execute, and track control tests. Record samples and exceptions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Button></Link>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ New Test"}</Button>
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
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ControlTestStatus | "")} className="w-36">
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Control Test</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleCreate(e)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label>Engagement *</Label>
                <Select required value={form.engagement_id} onChange={(e) => setForm({ ...form, engagement_id: e.target.value })}>
                  <option value="">Select engagement…</option>
                  {engagements.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Control (optional)</Label>
                <Select value={form.control_id ?? ""} onChange={(e) => setForm({ ...form, control_id: e.target.value || undefined })}>
                  <option value="">None / standalone</option>
                  {controls.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Test Title *</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. User access review Q2 2026" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Test Type</Label>
                <Select value={form.test_type} onChange={(e) => setForm({ ...form, test_type: e.target.value as ControlTestType })}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Scheduled Date</Label>
                <Input type="date" value={form.scheduled_date ?? ""} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value || undefined })} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Owner</Label>
                <Input value={form.owner_name ?? ""} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="Test owner" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Reviewer</Label>
                <Input value={form.reviewer_name ?? ""} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} placeholder="Reviewer name" />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label>Objective</Label>
                <Input value={form.test_objective ?? ""} onChange={(e) => setForm({ ...form, test_objective: e.target.value })} placeholder="What is this test verifying?" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Create Test"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tests List */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : tests.length === 0 ? (
        <Card><CardContent className="pt-6 text-sm text-slate-400">No control tests yet.</CardContent></Card>
      ) : (
        <div className="flex flex-col gap-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{test.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {test.test_type.replace("_", " ")} · Owner: {test.owner_name ?? "—"} · Reviewer: {test.reviewer_name ?? "—"}
                      {test.scheduled_date && ` · Scheduled: ${test.scheduled_date}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={statusBadge(test.status)}>{test.status}</Badge>
                    {test.overall_result && <Badge className={resultBadge(test.overall_result)}>{test.overall_result}</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {test.test_objective && <p className="text-xs text-slate-600 mb-3">Objective: {test.test_objective}</p>}
                {test.samples.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-700 mb-1">Samples ({test.samples.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {test.samples.map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs bg-slate-100">
                          {s.item_reference}
                          {s.result && <Badge className={`ml-1 text-[10px] px-1 py-0 ${resultBadge(s.result)}`}>{s.result}</Badge>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {updatingId === test.id ? (
                    <div className="flex flex-wrap items-end gap-2 w-full">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Status</Label>
                        <Select value={updateForm.status ?? test.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as ControlTestStatus })}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Result</Label>
                        <Select value={updateForm.overall_result ?? ""} onChange={(e) => setUpdateForm({ ...updateForm, overall_result: (e.target.value as ControlTestResult) || undefined })}>
                          <option value="">—</option>
                          {RESULT_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Exceptions found</Label>
                        <Input type="number" className="w-24" value={updateForm.exceptions_found ?? ""} onChange={(e) => setUpdateForm({ ...updateForm, exceptions_found: e.target.value ? Number(e.target.value) : undefined })} />
                      </div>
                      <Button size="sm" onClick={() => void handleUpdate(test.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setUpdatingId(null); setUpdateForm({}); }}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setUpdatingId(test.id); setUpdateForm({}); }}>Update</Button>
                      <Button size="sm" variant="outline" onClick={() => setSampleTestId(sampleTestId === test.id ? null : test.id)}>+ Sample</Button>
                      <Button size="sm" variant="ghost" onClick={() => void handleDelete(test.id)} className="text-red-500">Delete</Button>
                    </>
                  )}
                </div>
                {sampleTestId === test.id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 rounded bg-slate-50 p-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Reference *</Label>
                      <Input value={sampleRef} onChange={(e) => setSampleRef(e.target.value)} placeholder="e.g. INV-2026-001" className="w-40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Result</Label>
                      <Select value={sampleResult} onChange={(e) => setSampleResult(e.target.value as ControlTestResult)}>
                        {RESULT_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </Select>
                    </div>
                    <Button size="sm" onClick={() => void handleAddSample(test.id)}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSampleTestId(null)}>Cancel</Button>
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

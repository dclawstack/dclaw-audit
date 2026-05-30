"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AuditEngagement,
  CreateWorkpaperPayload,
  UpdateWorkpaperPayload,
  Workpaper,
  WorkpaperStatus,
  createWorkpaper,
  deleteWorkpaper,
  listEngagements,
  listWorkpapers,
  updateWorkpaper,
} from "@/lib/api";

const STATUS_OPTIONS: WorkpaperStatus[] = ["draft", "in_review", "approved", "archived"];

const STATUS_COLORS: Record<WorkpaperStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  archived: "bg-blue-100 text-blue-700",
};

const INITIAL_FORM: CreateWorkpaperPayload = {
  engagement_id: "",
  title: "",
  content: "",
  status: "draft",
  preparer_name: "",
  reviewer_name: "",
  notes: "",
};

export default function WorkpapersPage() {
  const [workpapers, setWorkpapers] = useState<Workpaper[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [filterEngagement, setFilterEngagement] = useState("");
  const [filterStatus, setFilterStatus] = useState<WorkpaperStatus | "">("");
  const [form, setForm] = useState<CreateWorkpaperPayload>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateWorkpaperPayload>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [wpRes, engRes] = await Promise.all([
        listWorkpapers(filterEngagement || undefined, (filterStatus as WorkpaperStatus) || undefined),
        listEngagements(),
      ]);
      setWorkpapers(wpRes.items);
      setEngagements(engRes.items);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => { load(); }, [filterEngagement, filterStatus]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.engagement_id || !form.title) return;
    setLoading(true);
    try {
      await createWorkpaper(form);
      setForm(INITIAL_FORM);
      await load();
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function handleUpdate(id: string) {
    setLoading(true);
    try {
      await updateWorkpaper(id, editForm);
      setEditingId(null);
      await load();
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this workpaper?")) return;
    try { await deleteWorkpaper(id); await load(); }
    catch (e) { setError(String(e)); }
  }

  async function handleStatusChange(wp: Workpaper, newStatus: WorkpaperStatus) {
    const patch: UpdateWorkpaperPayload = { status: newStatus };
    if (newStatus === "approved") patch.approved_at = new Date().toISOString();
    if (newStatus === "in_review") patch.reviewed_at = new Date().toISOString();
    try { await updateWorkpaper(wp.id, patch); await load(); }
    catch (e) { setError(String(e)); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6" />
        <span className="font-bold text-lg">DClaw Audit</span>
        <span className="text-gray-400 mx-2">|</span>
        <span className="text-gray-200">Workpapers</span>
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
            <TabsTrigger value="list"><FileText className="h-4 w-4 mr-1" />Workpapers</TabsTrigger>
            <TabsTrigger value="create">+ New Workpaper</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-4">
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
                onChange={(e) => setFilterStatus(e.target.value as WorkpaperStatus | "")}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {/* Workpaper cards */}
            {workpapers.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-400">No workpapers found.</CardContent></Card>
            ) : (
              workpapers.map((wp) => (
                <Card key={wp.id} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{wp.title}</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          v{wp.version} &nbsp;·&nbsp; Preparer: {wp.preparer_name || "—"} &nbsp;·&nbsp; Reviewer: {wp.reviewer_name || "—"}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[wp.status]}`}>
                        {wp.status.replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editingId === wp.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full border rounded p-2 text-sm h-32"
                          value={editForm.content ?? wp.content ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                          placeholder="Workpaper content…"
                        />
                        <Input
                          placeholder="Reviewer name"
                          value={editForm.reviewer_name ?? wp.reviewer_name ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, reviewer_name: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(wp.id)} disabled={loading}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {wp.content && <p className="text-sm text-gray-600 line-clamp-3">{wp.content}</p>}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(wp.id); setEditForm({}); }}>Edit</Button>
                          {wp.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(wp, "in_review")}>Submit for Review</Button>
                          )}
                          {wp.status === "in_review" && (
                            <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white" onClick={() => handleStatusChange(wp, "approved")}>Approve</Button>
                          )}
                          {wp.status !== "archived" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(wp, "archived")}>Archive</Button>
                          )}
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(wp.id)}>Delete</Button>
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
              <CardHeader><CardTitle>New Workpaper</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
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
                    <Label>Title *</Label>
                    <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Workpaper title" />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-32 mt-1"
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder="Document your work, procedures, and observations here…"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Preparer</Label>
                      <Input value={form.preparer_name} onChange={(e) => setForm((f) => ({ ...f, preparer_name: e.target.value }))} placeholder="Your name" />
                    </div>
                    <div>
                      <Label>Reviewer</Label>
                      <Input value={form.reviewer_name} onChange={(e) => setForm((f) => ({ ...f, reviewer_name: e.target.value }))} placeholder="Reviewer name" />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
                  </div>
                  <Button type="submit" disabled={loading || !form.engagement_id || !form.title} className="bg-gray-900 hover:bg-gray-700 text-white">
                    Create Workpaper
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

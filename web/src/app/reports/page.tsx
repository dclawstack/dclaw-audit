"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
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
  ReportTemplate,
  SavedReport,
  SavedReportWithTemplate,
  createReportTemplate,
  createSavedReport,
  generateReport,
  listEngagements,
  listReportTemplates,
  listSavedReports,
  updateSavedReport,
  deleteSavedReport,
} from "@/lib/api";

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const DEFAULT_SECTIONS = [
  "executive_summary",
  "scope",
  "methodology",
  "findings",
  "recommendations",
  "management_response",
  "conclusion",
];

export default function ReportsPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<SavedReportWithTemplate[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("reports");

  // Template form
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    sections: ["executive_summary", "findings", "recommendations", "conclusion"],
    default_prompt: "",
  });
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  // Report form
  const [reportForm, setReportForm] = useState({
    engagement_id: "",
    template_id: "",
    title: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  // Edit report
  const [editingReport, setEditingReport] = useState<SavedReportWithTemplate | null>(null);
  const [editSection, setEditSection] = useState("");
  const [editContent, setEditContent] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [tRes, rRes, eRes] = await Promise.all([
        listReportTemplates(),
        listSavedReports(),
        listEngagements(),
      ]);
      setTemplates(tRes.items);
      // Fetch full report details with templates
      const reportsWithTemplates = await Promise.all(
        rRes.items.map(async (r) => {
          // We already have template_id, fetch template from local list
          const template = tRes.items.find((t) => t.id === r.template_id);
          return { ...r, template: template ?? (null as unknown as ReportTemplate) };
        })
      );
      setReports(reportsWithTemplates as SavedReportWithTemplate[]);
      setEngagements(eRes.items);
      setReportForm((current) => ({
        ...current,
        engagement_id: eRes.items[0]?.id || "",
        template_id: tRes.items[0]?.id || "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateForm.name?.trim()) {
      setError("Template name is required.");
      return;
    }
    setSubmittingTemplate(true);
    setError(null);
    try {
      await createReportTemplate({
        name: templateForm.name.trim(),
        description: templateForm.description?.trim() || undefined,
        sections: templateForm.sections,
        default_prompt: templateForm.default_prompt?.trim() || undefined,
      });
      setTemplateForm({
        name: "",
        description: "",
        sections: ["executive_summary", "findings", "recommendations", "conclusion"],
        default_prompt: "",
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmittingTemplate(false);
    }
  }

  async function handleGenerateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reportForm.engagement_id || !reportForm.template_id || !reportForm.title?.trim()) {
      setError("Engagement, template, and title are required.");
      return;
    }
    setSubmittingReport(true);
    setError(null);
    try {
      await generateReport({
        engagement_id: reportForm.engagement_id,
        template_id: reportForm.template_id,
        title: reportForm.title.trim(),
      });
      setReportForm((current) => ({ ...current, title: "" }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setSubmittingReport(false);
    }
  }

  async function handleSaveSection() {
    if (!editingReport || !editSection) return;
    setError(null);
    try {
      const updatedSections = { ...editingReport.sections, [editSection]: editContent };
      await updateSavedReport(editingReport.id, { sections: updatedSections });
      setEditingReport(null);
      setEditSection("");
      setEditContent("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update section");
    }
  }

  async function handleDeleteReport(reportId: string) {
    setError(null);
    try {
      await deleteSavedReport(reportId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete report");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Report Builder</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Create report templates, generate AI-assisted audit reports from engagement data, and
            manage saved report outputs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button type="button" variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Saved Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading reports…</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-500">
              No saved reports yet. Generate one from the Generate tab.
            </p>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {report.title}
                      </CardTitle>
                      <CardDescription>
                        {report.template?.name || "Unknown template"} ·{" "}
                        {formatLabel(report.status)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingReport(report);
                          const firstSection = Object.keys(report.sections)[0] || "";
                          setEditSection(firstSection);
                          setEditContent(report.sections[firstSection] || "");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.generated_summary ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Overall risk rating
                      </p>
                      <p className="text-sm text-slate-800">{report.generated_summary}</p>
                    </div>
                  ) : null}
                  {Object.entries(report.sections).map(([section, content]) => (
                    <div key={section} className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {formatLabel(section)}
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-slate-800">{content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Report templates</CardTitle>
                <CardDescription>
                  Define section structure for audit reports (executive summary, findings,
                  recommendations, etc.).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading templates…</p>
                ) : templates.length === 0 ? (
                  <p className="text-sm text-slate-500">No templates yet. Create one below.</p>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-lg border border-slate-200 p-4 shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      {template.description ? (
                        <p className="text-sm text-slate-600">{template.description}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {template.sections.map((section) => (
                          <Badge key={section} variant="outline">
                            {formatLabel(section)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create template</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateTemplate}>
                  <div className="space-y-2">
                    <Label htmlFor="template_name">Template name</Label>
                    <Input
                      id="template_name"
                      value={templateForm.name}
                      onChange={(event) =>
                        setTemplateForm((c) => ({ ...c, name: event.target.value }))
                      }
                      placeholder="Standard Internal Audit Report"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template_desc">Description</Label>
                    <textarea
                      id="template_desc"
                      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={templateForm.description}
                      onChange={(event) =>
                        setTemplateForm((c) => ({ ...c, description: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template_sections">Sections (one per line)</Label>
                    <textarea
                      id="template_sections"
                      className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                      value={templateForm.sections.join("\n")}
                      onChange={(event) =>
                        setTemplateForm((c) => ({
                          ...c,
                          sections: event.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submittingTemplate}>
                    {submittingTemplate ? "Creating…" : "Create template"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate report</CardTitle>
              <CardDescription>
                Pick an engagement and template, then generate an AI-assisted report grounded in
                the engagement findings and evidence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleGenerateReport}>
                <div className="space-y-2">
                  <Label htmlFor="gen_engagement">Engagement</Label>
                  <Select
                    id="gen_engagement"
                    value={reportForm.engagement_id}
                    onChange={(event) =>
                      setReportForm((c) => ({ ...c, engagement_id: event.target.value }))
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
                  <Label htmlFor="gen_template">Template</Label>
                  <Select
                    id="gen_template"
                    value={reportForm.template_id}
                    onChange={(event) =>
                      setReportForm((c) => ({ ...c, template_id: event.target.value }))
                    }
                  >
                    <option value="">Select template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gen_title">Report title</Label>
                  <Input
                    id="gen_title"
                    value={reportForm.title}
                    onChange={(event) =>
                      setReportForm((c) => ({ ...c, title: event.target.value }))
                    }
                    placeholder="SOX Q4 2026 Internal Audit Report"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    submittingReport ||
                    !reportForm.engagement_id ||
                    !reportForm.template_id ||
                    !reportForm.title?.trim()
                  }
                >
                  {submittingReport ? "Generating…" : "Generate AI-assisted report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingReport ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Edit report section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={editSection}
              onChange={(event) => {
                const section = event.target.value;
                setEditSection(section);
                setEditContent(editingReport.sections[section] || "");
              }}
            >
              {Object.keys(editingReport.sections).map((section) => (
                <option key={section} value={section}>
                  {formatLabel(section)}
                </option>
              ))}
            </Select>
            <textarea
              className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
            />
            <div className="flex gap-3">
              <Button type="button" onClick={() => void handleSaveSection()}>
                Save section
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingReport(null);
                  setEditSection("");
                  setEditContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

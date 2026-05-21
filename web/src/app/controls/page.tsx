"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";
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
  Control,
  FrameworkName,
  FrameworkRequirement,
  MappingCoverageStatus,
  ControlMapping,
  createControl,
  createControlMapping,
  createFrameworkRequirement,
  deleteControl,
  deleteControlMapping,
  deleteFrameworkRequirement,
  getGapAnalysis,
  listControlMappings,
  listControls,
  listFrameworkRequirements,
} from "@/lib/api";

const FRAMEWORK_OPTIONS: FrameworkName[] = ["sox", "iso_27001", "nist", "pci_dss"];
const COVERAGE_OPTIONS: MappingCoverageStatus[] = ["full", "partial", "planned"];

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function coverageBadgeVariant(coverage: MappingCoverageStatus | null | undefined) {
  if (coverage === "full") return "secondary" as const;
  if (coverage === "partial") return "outline" as const;
  if (coverage === "planned") return "destructive" as const;
  return "outline" as const;
}

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [requirements, setRequirements] = useState<FrameworkRequirement[]>([]);
  const [mappings, setMappings] = useState<Array<{ id: string; control_id: string; framework_requirement_id: string; coverage_status: MappingCoverageStatus; notes: string | null; control: Control; framework_requirement: FrameworkRequirement }>>([]);
  const [gaps, setGaps] = useState<Array<{ framework_requirement: FrameworkRequirement; mapped_controls: Control[]; coverage_status: MappingCoverageStatus | null }>>([]);

  const [activeFramework, setActiveFramework] = useState<FrameworkName | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [controlForm, setControlForm] = useState<{
    name: string;
    description: string;
    framework: FrameworkName | undefined;
    control_owner: string;
    frequency: string;
    automated: boolean;
  }>({
    name: "",
    description: "",
    framework: undefined,
    control_owner: "",
    frequency: "",
    automated: false,
  });
  const [reqForm, setReqForm] = useState<{
    framework: FrameworkName;
    requirement_code: string;
    title: string;
    description: string;
  }>({
    framework: "sox",
    requirement_code: "",
    title: "",
    description: "",
  });
  const [mappingForm, setMappingForm] = useState<{
    control_id: string;
    framework_requirement_id: string;
    coverage_status: MappingCoverageStatus;
    notes: string;
  }>({
    control_id: "",
    framework_requirement_id: "",
    coverage_status: "partial",
    notes: "",
  });

  const [submittingControl, setSubmittingControl] = useState(false);
  const [submittingReq, setSubmittingReq] = useState(false);
  const [submittingMapping, setSubmittingMapping] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadControls() {
    try {
      const res = await listControls(activeFramework);
      setControls(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load controls");
    }
  }

  async function loadRequirements() {
    try {
      const res = await listFrameworkRequirements(activeFramework);
      setRequirements(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requirements");
    }
  }

  async function loadMappings() {
    try {
      const res = await listControlMappings();
      const enriched = res.items.map((m) => ({
        ...m,
        control: controls.find((c) => c.id === m.control_id)!,
        framework_requirement: requirements.find((r) => r.id === m.framework_requirement_id)!,
      })).filter((m) => m.control && m.framework_requirement);
      setMappings(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mappings");
    }
  }

  async function loadGaps() {
    try {
      const res = await getGapAnalysis(activeFramework);
      setGaps(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gap analysis");
    }
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    await loadControls();
    await loadRequirements();
    // Load mappings after controls/requirements are loaded
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
  }, [activeFramework]);

  useEffect(() => {
    if (controls.length > 0 && requirements.length > 0) {
      void loadMappings();
      void loadGaps();
    }
  }, [controls, requirements]);

  async function handleCreateControl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!controlForm.name?.trim()) {
      setError("Control name is required.");
      return;
    }
    setSubmittingControl(true);
    setError(null);
    try {
      await createControl({
        ...controlForm,
        name: controlForm.name.trim(),
        description: controlForm.description?.trim() || undefined,
        control_owner: controlForm.control_owner?.trim() || undefined,
        frequency: controlForm.frequency?.trim() || undefined,
      });
      setControlForm({ name: "", description: "", framework: undefined, control_owner: "", frequency: "", automated: false });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create control");
    } finally {
      setSubmittingControl(false);
    }
  }

  async function handleCreateRequirement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reqForm.requirement_code?.trim() || !reqForm.title?.trim()) {
      setError("Requirement code and title are required.");
      return;
    }
    setSubmittingReq(true);
    setError(null);
    try {
      await createFrameworkRequirement({
        ...reqForm,
        requirement_code: reqForm.requirement_code.trim(),
        title: reqForm.title.trim(),
        description: reqForm.description?.trim() || undefined,
      });
      setReqForm({ framework: "sox", requirement_code: "", title: "", description: "" });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create requirement");
    } finally {
      setSubmittingReq(false);
    }
  }

  async function handleCreateMapping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mappingForm.control_id || !mappingForm.framework_requirement_id) {
      setError("Control and requirement are required.");
      return;
    }
    setSubmittingMapping(true);
    setError(null);
    try {
      await createControlMapping({
        control_id: mappingForm.control_id,
        framework_requirement_id: mappingForm.framework_requirement_id,
        coverage_status: mappingForm.coverage_status,
        notes: mappingForm.notes?.trim() || undefined,
      });
      setMappingForm({ control_id: "", framework_requirement_id: "", coverage_status: "partial", notes: "" });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mapping");
    } finally {
      setSubmittingMapping(false);
    }
  }

  async function handleDeleteControl(controlId: string) {
    setDeletingId(controlId);
    setError(null);
    try {
      await deleteControl(controlId);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete control");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteRequirement(reqId: string) {
    setDeletingId(reqId);
    setError(null);
    try {
      await deleteFrameworkRequirement(reqId);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete requirement");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteMapping(mappingId: string) {
    setDeletingId(mappingId);
    setError(null);
    try {
      await deleteControlMapping(mappingId);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete mapping");
    } finally {
      setDeletingId(null);
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Controls &amp; Framework Mapping
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Manage control inventory, framework requirements (SOX, ISO 27001, NIST, PCI-DSS), and
            map controls to requirements. Identify gaps with the coverage analysis view.
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

      {/* Framework filter */}
      <section className="flex items-center gap-4">
        <Label htmlFor="framework_filter">Filter by framework</Label>
        <Select
          id="framework_filter"
          value={activeFramework || ""}
          onChange={(event) =>
            setActiveFramework((event.target.value as FrameworkName) || undefined)
          }
        >
          <option value="">All frameworks</option>
          {FRAMEWORK_OPTIONS.map((fw) => (
            <option key={fw} value={fw}>
              {formatLabel(fw)}
            </option>
          ))}
        </Select>
      </section>

      <Tabs defaultValue="controls">
        <TabsList>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Control inventory</CardTitle>
                <CardDescription>
                  Manage internal controls, their owners, and framework alignment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading controls…</p>
                ) : controls.length === 0 ? (
                  <p className="text-sm text-slate-500">No controls yet. Add one below.</p>
                ) : (
                  controls.map((control) => (
                    <div
                      key={control.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{control.name}</h3>
                          {control.framework ? (
                            <Badge variant="outline">{formatLabel(control.framework)}</Badge>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={deletingId === control.id}
                          onClick={() => void handleDeleteControl(control.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <span>Owner: {control.control_owner || "Unassigned"}</span>
                        <span>Frequency: {control.frequency || "Not specified"}</span>
                      </div>
                      {control.description ? (
                        <p className="text-sm text-slate-700">{control.description}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create control</CardTitle>
                <CardDescription>Add a new control to the inventory.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateControl}>
                  <div className="space-y-2">
                    <Label htmlFor="control_name">Control name</Label>
                    <Input
                      id="control_name"
                      value={controlForm.name}
                      onChange={(event) =>
                        setControlForm((c) => ({ ...c, name: event.target.value }))
                      }
                      placeholder="Privileged access reviews"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="control_framework">Framework</Label>
                    <Select
                      id="control_framework"
                      value={controlForm.framework || ""}
                      onChange={(event) =>
                        setControlForm((c) => ({
                          ...c,
                          framework: (event.target.value as FrameworkName) || undefined,
                        }))
                      }
                    >
                      <option value="">None</option>
                      {FRAMEWORK_OPTIONS.map((fw) => (
                        <option key={fw} value={fw}>
                          {formatLabel(fw)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="control_owner">Control owner</Label>
                      <Input
                        id="control_owner"
                        value={controlForm.control_owner}
                        onChange={(event) =>
                          setControlForm((c) => ({ ...c, control_owner: event.target.value }))
                        }
                        placeholder="Jordan Lee"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="control_frequency">Frequency</Label>
                      <Input
                        id="control_frequency"
                        value={controlForm.frequency}
                        onChange={(event) =>
                          setControlForm((c) => ({ ...c, frequency: event.target.value }))
                        }
                        placeholder="Quarterly"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="control_automated"
                      type="checkbox"
                      checked={controlForm.automated}
                      onChange={(event) =>
                        setControlForm((c) => ({ ...c, automated: event.target.checked }))
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="control_automated">Automated control</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="control_description">Description</Label>
                    <textarea
                      id="control_description"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={controlForm.description}
                      onChange={(event) =>
                        setControlForm((c) => ({ ...c, description: event.target.value }))
                      }
                      placeholder="Describe the control objective and procedure."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submittingControl}>
                    {submittingControl ? "Creating…" : "Create control"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Framework requirements</CardTitle>
                <CardDescription>
                  Requirements from SOX, ISO 27001, NIST, and PCI-DSS.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading requirements…</p>
                ) : requirements.length === 0 ? (
                  <p className="text-sm text-slate-500">No requirements yet. Add one below.</p>
                ) : (
                  requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{req.title}</h3>
                          <Badge variant="outline">{formatLabel(req.framework)}</Badge>
                          <span className="ml-2 text-sm text-slate-600">{req.requirement_code}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={deletingId === req.id}
                          onClick={() => void handleDeleteRequirement(req.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      {req.description ? (
                        <p className="text-sm text-slate-700">{req.description}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create requirement</CardTitle>
                <CardDescription>Add a new framework requirement.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateRequirement}>
                  <div className="space-y-2">
                    <Label htmlFor="req_framework">Framework</Label>
                    <Select
                      id="req_framework"
                      value={reqForm.framework}
                      onChange={(event) =>
                        setReqForm((c) => ({
                          ...c,
                          framework: event.target.value as FrameworkName,
                        }))
                      }
                    >
                      {FRAMEWORK_OPTIONS.map((fw) => (
                        <option key={fw} value={fw}>
                          {formatLabel(fw)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req_code">Requirement code</Label>
                    <Input
                      id="req_code"
                      value={reqForm.requirement_code}
                      onChange={(event) =>
                        setReqForm((c) => ({ ...c, requirement_code: event.target.value }))
                      }
                      placeholder="SOX-302.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req_title">Title</Label>
                    <Input
                      id="req_title"
                      value={reqForm.title}
                      onChange={(event) =>
                        setReqForm((c) => ({ ...c, title: event.target.value }))
                      }
                      placeholder="Management certification of financial statements"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req_description">Description</Label>
                    <textarea
                      id="req_description"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={reqForm.description}
                      onChange={(event) =>
                        setReqForm((c) => ({ ...c, description: event.target.value }))
                      }
                      placeholder="Describe the requirement and what compliance looks like."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submittingReq}>
                    {submittingReq ? "Creating…" : "Create requirement"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Control-to-Requirement mappings</CardTitle>
                <CardDescription>
                  Track coverage status for each control-requirement pair.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading mappings…</p>
                ) : mappings.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No mappings yet. Create controls and requirements first, then map them.
                  </p>
                ) : (
                  mappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {mapping.control.name} → {mapping.framework_requirement.title}
                          </h3>
                          <Badge variant={coverageBadgeVariant(mapping.coverage_status)}>
                            {formatLabel(mapping.coverage_status)}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={deletingId === mapping.id}
                          onClick={() => void handleDeleteMapping(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span>{formatLabel(mapping.framework_requirement.framework)}</span>
                        <span className="mx-2">·</span>
                        <span>{mapping.framework_requirement.requirement_code}</span>
                      </div>
                      {mapping.notes ? (
                        <p className="text-sm text-slate-700">{mapping.notes}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create mapping</CardTitle>
                <CardDescription>Link a control to a framework requirement.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateMapping}>
                  <div className="space-y-2">
                    <Label htmlFor="map_control">Control</Label>
                    <Select
                      id="map_control"
                      value={mappingForm.control_id}
                      onChange={(event) =>
                        setMappingForm((c) => ({ ...c, control_id: event.target.value }))
                      }
                    >
                      <option value="">Select control</option>
                      {controls.map((control) => (
                        <option key={control.id} value={control.id}>
                          {control.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map_requirement">Requirement</Label>
                    <Select
                      id="map_requirement"
                      value={mappingForm.framework_requirement_id}
                      onChange={(event) =>
                        setMappingForm((c) => ({ ...c, framework_requirement_id: event.target.value }))
                      }
                    >
                      <option value="">Select requirement</option>
                      {requirements.map((req) => (
                        <option key={req.id} value={req.id}>
                          [{req.requirement_code}] {req.title}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map_coverage">Coverage status</Label>
                    <Select
                      id="map_coverage"
                      value={mappingForm.coverage_status}
                      onChange={(event) =>
                        setMappingForm((c) => ({
                          ...c,
                          coverage_status: event.target.value as MappingCoverageStatus,
                        }))
                      }
                    >
                      {COVERAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {formatLabel(opt)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map_notes">Notes</Label>
                    <textarea
                      id="map_notes"
                      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={mappingForm.notes}
                      onChange={(event) =>
                        setMappingForm((c) => ({ ...c, notes: event.target.value }))
                      }
                      placeholder="Optional notes about the mapping rationale."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submittingMapping || controls.length === 0 || requirements.length === 0}
                  >
                    {submittingMapping ? "Creating…" : "Create mapping"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gap analysis</CardTitle>
              <CardDescription>
                Requirements with their mapped controls and coverage status. Uncovered requirements
                appear with no mapped controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading gap analysis…</p>
              ) : gaps.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No data yet. Add requirements and map controls to see gaps.
                </p>
              ) : (
                gaps.map((gap, index) => (
                  <div
                    key={gap.framework_requirement.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          [{gap.framework_requirement.requirement_code}] {gap.framework_requirement.title}
                        </h3>
                        <Badge variant="outline">{formatLabel(gap.framework_requirement.framework)}</Badge>
                      </div>
                      <Badge variant={coverageBadgeVariant(gap.coverage_status)}>
                        {gap.coverage_status ? formatLabel(gap.coverage_status) : "Uncovered"}
                      </Badge>
                    </div>
                    {gap.mapped_controls.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">Mapped controls:</p>
                        {gap.mapped_controls.map((control) => (
                          <p key={control.id} className="text-sm text-slate-600">
                            · {control.name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">No controls mapped to this requirement.</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

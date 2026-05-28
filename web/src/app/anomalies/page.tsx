"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BarChart2, ShieldCheck } from "lucide-react";
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
  AnomalyFlag,
  AnomalyFlagStatus,
  AnomalyFlagType,
  AnomalyTransaction,
  BulkIngestPayload,
  bulkIngestTransactions,
  listAnomalyFlags,
  listAnomalyTransactions,
  reviewAnomalyFlag,
} from "@/lib/api";

const FLAG_STATUS_OPTIONS: AnomalyFlagStatus[] = ["flagged", "reviewed", "cleared", "escalated"];

function flagStatusColor(s: AnomalyFlagStatus) {
  const map: Record<AnomalyFlagStatus, string> = {
    flagged: "bg-red-100 text-red-700",
    reviewed: "bg-blue-100 text-blue-700",
    cleared: "bg-green-100 text-green-700",
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

const SAMPLE_CSV = `transaction_date,amount,description,account_code,party_name,source_system
2026-01-15,1500.00,Office supplies,6000,Acme Corp,ERP
2026-01-16,150000.00,Consulting services,5000,XYZ Consulting,ERP
2026-01-17,1500.00,Office supplies,6000,Acme Corp,ERP
2026-01-18,25000.00,Server hardware,7000,Tech Vendor,ERP
2026-01-19,1500.00,Office supplies,6000,Acme Corp,ERP
2026-01-20,999999.00,Year-end adjustment,9000,Internal,ERP
2026-01-21,10000.00,Round payment,4000,Contractor,ERP
2026-01-22,20000.00,Round payment,4000,Contractor,ERP`;

export default function AnomaliesPage() {
  const [transactions, setTransactions] = useState<AnomalyTransaction[]>([]);
  const [flags, setFlags] = useState<AnomalyFlag[]>([]);
  const [filterFlagStatus, setFilterFlagStatus] = useState<AnomalyFlagStatus | "">("");
  const [filterFlagType, setFilterFlagType] = useState<AnomalyFlagType | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [batchId, setBatchId] = useState(`batch-${Date.now()}`);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<{ ingested: number; flags_created: number } | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewStatus, setReviewStatus] = useState<AnomalyFlagStatus>("reviewed");
  const [reviewedBy, setReviewedBy] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [txRes, flagRes] = await Promise.all([
        listAnomalyTransactions(),
        listAnomalyFlags(filterFlagStatus || undefined, filterFlagType || undefined),
      ]);
      setTransactions(txRes.items);
      setFlags(flagRes.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [filterFlagStatus, filterFlagType]);

  function parseCsv(text: string): BulkIngestPayload["transactions"] {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
      return {
        transaction_date: row.transaction_date || undefined,
        amount: row.amount ? parseFloat(row.amount) : undefined,
        description: row.description || undefined,
        account_code: row.account_code || undefined,
        party_name: row.party_name || undefined,
        source_system: row.source_system || undefined,
        batch_id: batchId,
      };
    });
  }

  async function handleIngest(e: FormEvent) {
    e.preventDefault();
    setIngesting(true);
    setIngestResult(null);
    setError(null);
    try {
      const txns = parseCsv(csvText);
      if (txns.length === 0) throw new Error("No transactions parsed from CSV");
      const result = await bulkIngestTransactions({ transactions: txns, run_detection: true });
      setIngestResult(result);
      setBatchId(`batch-${Date.now()}`);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ingest failed");
    } finally {
      setIngesting(false);
    }
  }

  async function handleReview(flagId: string) {
    try {
      await reviewAnomalyFlag(flagId, { status: reviewStatus, analyst_notes: reviewNote || undefined, reviewed_by: reviewedBy || undefined });
      setReviewingId(null);
      setReviewNote("");
      setReviewedBy("");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed");
    }
  }

  const flagsByTxn = new Map<string, AnomalyFlag[]>();
  for (const f of flags) {
    if (!flagsByTxn.has(f.transaction_id)) flagsByTxn.set(f.transaction_id, []);
    flagsByTxn.get(f.transaction_id)!.push(f);
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
            <BarChart2 className="h-7 w-7 text-purple-600" />
            Anomaly Detection
          </h1>
          <p className="mt-2 text-sm text-slate-600">Ingest transaction data and detect statistical or rule-based anomalies for analyst review.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Button></Link>
        </div>
      </section>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {ingestResult && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          Ingested {ingestResult.ingested} transactions · {ingestResult.flags_created} anomaly flags created
        </div>
      )}

      <Tabs defaultValue="ingest">
        <TabsList>
          <TabsTrigger value="ingest">Ingest Data</TabsTrigger>
          <TabsTrigger value="flags">Anomaly Flags ({flags.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ingest">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Ingest Transactions</CardTitle>
              <CardDescription>Paste CSV data (with header row) to ingest and auto-detect anomalies using z-score and rule-based analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void handleIngest(e)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Batch ID</Label>
                  <Input value={batchId} onChange={(e) => setBatchId(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>CSV Data (columns: transaction_date, amount, description, account_code, party_name, source_system)</Label>
                  <textarea
                    className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500">The sample CSV above includes a large outlier and round-number payments to trigger detection.</p>
                <Button type="submit" disabled={ingesting}>{ingesting ? "Ingesting…" : "Ingest & Detect"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Flags</CardTitle>
              <CardDescription>Flags requiring analyst review. Update status after investigation.</CardDescription>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Status</Label>
                  <Select value={filterFlagStatus} onChange={(e) => setFilterFlagStatus(e.target.value as AnomalyFlagStatus | "")} className="w-36">
                    <option value="">All</option>
                    {FLAG_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={filterFlagType} onChange={(e) => setFilterFlagType(e.target.value as AnomalyFlagType | "")} className="w-36">
                    <option value="">All</option>
                    <option value="statistical">Statistical</option>
                    <option value="rule_based">Rule-based</option>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : flags.length === 0 ? (
                <p className="text-sm text-slate-400">No flags yet. Ingest some transactions to run detection.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {flags.map((flag) => {
                    const txn = transactions.find((t) => t.id === flag.transaction_id);
                    return (
                      <div key={flag.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={severityColor(flag.severity)}>{flag.severity}</Badge>
                              <Badge className="bg-slate-100 text-slate-600 text-xs">{flag.flag_type.replace("_", " ")}</Badge>
                              <Badge className={flagStatusColor(flag.status)}>{flag.status}</Badge>
                              {flag.confidence_score != null && (
                                <span className="text-xs text-slate-500">confidence: {(flag.confidence_score * 100).toFixed(0)}%</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-800">{flag.description}</p>
                            {txn && (
                              <p className="text-xs text-slate-500 mt-1">
                                Txn: {txn.party_name ?? "—"} · Amount: {txn.amount != null ? `$${txn.amount.toLocaleString()}` : "—"} · {txn.transaction_date ?? "—"} · {txn.description ?? "—"}
                              </p>
                            )}
                            {flag.analyst_notes && <p className="text-xs text-slate-600 mt-1 italic">Note: {flag.analyst_notes}</p>}
                          </div>
                          {flag.status === "flagged" && (
                            <Button size="sm" variant="outline" onClick={() => setReviewingId(flag.id === reviewingId ? null : flag.id)}>Review</Button>
                          )}
                        </div>
                        {reviewingId === flag.id && (
                          <div className="mt-3 flex flex-wrap items-end gap-2 rounded bg-slate-50 p-3">
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs">Decision</Label>
                              <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as AnomalyFlagStatus)}>
                                <option value="reviewed">Reviewed</option>
                                <option value="cleared">Cleared</option>
                                <option value="escalated">Escalated</option>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <Label className="text-xs">Notes</Label>
                              <Input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Analyst notes…" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs">Reviewed by</Label>
                              <Input value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} placeholder="Analyst name" className="w-36" />
                            </div>
                            <Button size="sm" onClick={() => void handleReview(flag.id)}>Submit</Button>
                            <Button size="sm" variant="ghost" onClick={() => setReviewingId(null)}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader><CardTitle>Transaction Log</CardTitle><CardDescription>All ingested transactions with flag counts.</CardDescription></CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-slate-400">No transactions ingested yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-slate-500">
                        <th className="pb-2 pr-4 font-medium">Date</th>
                        <th className="pb-2 pr-4 font-medium">Amount</th>
                        <th className="pb-2 pr-4 font-medium">Description</th>
                        <th className="pb-2 pr-4 font-medium">Party</th>
                        <th className="pb-2 pr-4 font-medium">Account</th>
                        <th className="pb-2 font-medium">Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => {
                        const txnFlags = txn.flags ?? [];
                        return (
                          <tr key={txn.id} className="border-b hover:bg-slate-50">
                            <td className="py-2 pr-4 text-slate-600">{txn.transaction_date ?? "—"}</td>
                            <td className="py-2 pr-4 font-mono">{txn.amount != null ? `$${txn.amount.toLocaleString()}` : "—"}</td>
                            <td className="py-2 pr-4 text-slate-600">{txn.description ?? "—"}</td>
                            <td className="py-2 pr-4 text-slate-600">{txn.party_name ?? "—"}</td>
                            <td className="py-2 pr-4 text-slate-500">{txn.account_code ?? "—"}</td>
                            <td className="py-2">
                              {txnFlags.length > 0 ? (
                                <Badge className="bg-red-100 text-red-700">{txnFlags.length} flag{txnFlags.length > 1 ? "s" : ""}</Badge>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

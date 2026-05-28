"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Brain, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
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
import {
  IntelligenceSummary,
  getIntelligenceSummary,
} from "@/lib/api";

export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const summary = await getIntelligenceSummary();
      setData(summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  function failureRateColor(rate: number) {
    if (rate >= 0.5) return "bg-red-100 text-red-700";
    if (rate >= 0.25) return "bg-orange-100 text-orange-700";
    return "bg-yellow-100 text-yellow-700";
  }

  function responsivenessBadge(score: number) {
    if (score >= 0.7) return "bg-green-100 text-green-700";
    if (score >= 0.4) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  }

  function cycleBadge(days: number) {
    if (days > 90) return "bg-red-100 text-red-700";
    if (days > 60) return "bg-orange-100 text-orange-700";
    if (days > 30) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
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
            <Brain className="h-7 w-7 text-indigo-600" />
            Audit Intelligence
          </h1>
          <p className="mt-2 text-sm text-slate-600">Cross-engagement trends, control failure patterns, owner responsiveness, and cycle time benchmarks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Button></Link>
          <Button variant="outline" size="sm" onClick={() => void loadData()}>Refresh</Button>
        </div>
      </section>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="text-sm text-slate-500">Computing intelligence…</div>
      ) : data == null ? null : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Open Engagements</p>
                <p className="text-2xl font-bold">{data.total_open_engagements}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">High-Risk Engagements</p>
                <p className="text-2xl font-bold text-orange-600">{data.high_risk_engagement_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Avg Finding Age</p>
                <p className="text-2xl font-bold">{data.avg_finding_age_days}d</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Findings Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{data.findings_trend_30d}</span>
                  <span className="text-xs text-slate-400">last 30d</span>
                  {data.findings_trend_30d > data.findings_trend_60d
                    ? <TrendingUp className="h-4 w-4 text-red-500" />
                    : <TrendingDown className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-xs text-slate-400">{data.findings_trend_60d} in prior 30d</p>
              </CardContent>
            </Card>
          </div>

          {/* Recurring Control Failures */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring Control Failures</CardTitle>
              <CardDescription>Controls with repeated test failures across engagements. High failure rates indicate systemic weaknesses.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recurring_control_failures.length === 0 ? (
                <p className="text-sm text-slate-400">No completed control tests yet. Run tests to build this view.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-slate-500 text-left">
                        <th className="pb-2 pr-4 font-medium">Control</th>
                        <th className="pb-2 pr-4 font-medium">Tests</th>
                        <th className="pb-2 pr-4 font-medium">Failed</th>
                        <th className="pb-2 font-medium">Failure Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recurring_control_failures.map((item, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="py-2 pr-4 font-medium text-slate-800">{item.control_title}</td>
                          <td className="py-2 pr-4 text-slate-500">{item.total_tests}</td>
                          <td className="py-2 pr-4 text-red-600">{item.failed_tests}</td>
                          <td className="py-2">
                            <Badge className={failureRateColor(item.failure_rate)}>
                              {(item.failure_rate * 100).toFixed(0)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Responsiveness */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Responsiveness</CardTitle>
              <CardDescription>Evidence request owners ranked by responsiveness (overdue rate + avg days open). Lower score = more risk.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.owner_responsiveness.length === 0 ? (
                <p className="text-sm text-slate-400">No evidence requests tracked yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-slate-500 text-left">
                        <th className="pb-2 pr-4 font-medium">Owner</th>
                        <th className="pb-2 pr-4 font-medium">Requests</th>
                        <th className="pb-2 pr-4 font-medium">Overdue</th>
                        <th className="pb-2 pr-4 font-medium">Avg Days Open</th>
                        <th className="pb-2 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.owner_responsiveness.map((item, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="py-2 pr-4 font-medium text-slate-800">{item.owner_name}</td>
                          <td className="py-2 pr-4 text-slate-500">{item.total_requests}</td>
                          <td className="py-2 pr-4 text-red-600">{item.overdue_requests}</td>
                          <td className="py-2 pr-4 text-slate-500">{item.avg_days_open}d</td>
                          <td className="py-2">
                            <Badge className={responsivenessBadge(item.responsiveness_score)}>
                              {(item.responsiveness_score * 100).toFixed(0)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cycle Time Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Cycle Time</CardTitle>
              <CardDescription>How long each engagement has been open, with finding status. Sorted by longest-running first.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.cycle_time_benchmarks.length === 0 ? (
                <p className="text-sm text-slate-400">No open engagements.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-slate-500 text-left">
                        <th className="pb-2 pr-4 font-medium">Engagement</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 pr-4 font-medium">Days Open</th>
                        <th className="pb-2 pr-4 font-medium">Findings</th>
                        <th className="pb-2 font-medium">Open Findings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.cycle_time_benchmarks.map((item) => (
                        <tr key={item.engagement_id} className="border-b hover:bg-slate-50">
                          <td className="py-2 pr-4 font-medium text-slate-800">{item.title}</td>
                          <td className="py-2 pr-4">
                            <Badge className="bg-slate-100 text-slate-600 text-xs">{item.status}</Badge>
                          </td>
                          <td className="py-2 pr-4">
                            <Badge className={cycleBadge(item.days_open)}>{item.days_open}d</Badge>
                          </td>
                          <td className="py-2 pr-4 text-slate-500">{item.findings_count}</td>
                          <td className="py-2">
                            {item.open_findings > 0
                              ? <Badge className="bg-red-100 text-red-700">{item.open_findings} open</Badge>
                              : <Badge className="bg-green-100 text-green-700">all resolved</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

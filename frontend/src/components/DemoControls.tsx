"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Play, RefreshCw, Terminal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Phase = "loading" | "ready" | "unavailable";

interface DemoStatus {
  enabled: boolean;
  seeded: boolean;
  engagement_id: string | null;
  counts: Record<string, number>;
  credentials: { email: string; password: string; note: string } | null;
}

async function call(path: string, method: string): Promise<DemoStatus> {
  const res = await fetch(`/api/v1${path}`, { method });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

export function DemoControls() {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const s = await call("/demo/status", "GET");
      setStatus(s);
      setPhase(s.enabled ? "ready" : "unavailable");
    } catch {
      setStatus(null);
      setPhase("unavailable");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function run(path: string, method: string) {
    setBusy(true);
    setError(null);
    try {
      setStatus(await call(path, method));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              <Database className="h-3 w-3" /> Try the demo
            </div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Seed a sample audit engagement in one click.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              The demo seeds a complete SOX ITGC engagement — findings, evidence
              requests, risk items, controls mapped to frameworks, a control
              test with samples, audit signals, a flagged anomaly, and a draft
              report. Everything is prefixed{" "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-700">
                DEMO
              </code>{" "}
              so Reset cleans up only what was seeded.
            </p>

            {phase === "ready" && status?.seeded && (
              <p className="mt-3 text-sm text-slate-700">
                <strong>Seeded:</strong>{" "}
                {Object.entries(status.counts)
                  .map(([k, v]) => `${v} ${k}`)
                  .join(" · ")}
              </p>
            )}

            {phase === "unavailable" && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Terminal className="h-4 w-4 text-slate-600" />
                  Demo backend not connected
                </div>
                <p className="text-sm text-slate-600">
                  Either this is the marketing build with no live API, or demo
                  mode is off. Run the full stack with{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">
                    ENABLE_DEMO_MODE=true
                  </code>{" "}
                  to activate seeding. Production deploys leave it off.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            {phase === "loading" && (
              <div className="text-xs text-slate-400">Checking demo backend…</div>
            )}

            {phase === "ready" && !status?.seeded && (
              <Button onClick={() => run("/demo/seed", "POST")} disabled={busy}>
                <Play className="mr-2 h-4 w-4" />
                {busy ? "Seeding…" : "Seed demo data"}
              </Button>
            )}

            {phase === "ready" && status?.seeded && (
              <>
                <Link href="/dashboard">
                  <Button className="w-full">Open the dashboard →</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => run("/demo/seed", "POST")}
                  disabled={busy}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {busy ? "Re-seeding…" : "Re-seed"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => run("/demo/reset", "DELETE")}
                  disabled={busy}
                  className="text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear demo data
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

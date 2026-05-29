import Link from "next/link";
import {
  ShieldCheck,
  ClipboardList,
  FileSearch,
  AlertTriangle,
  Landmark,
  Sparkles,
  FileText,
  ArrowRight,
  CheckCircle2,
  Activity,
  Radar,
  Brain,
  BarChart3,
  ChevronRight,
  Lock,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// DEMO CONTROLS — remove this import + the block below to drop the demo feature
import { DemoControls } from "@/components/DemoControls";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
          {number}
        </div>
        <div className="mt-2 h-full w-px bg-slate-200" />
      </div>
      <div className="pb-8">
        <h4 className="text-base font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">DClaw Audit</span>
        </Link>
        <div className="flex items-center gap-4">
          <a href="#features" className="hidden text-sm font-medium text-slate-700 hover:text-slate-900 sm:block">
            Features
          </a>
          <Link href="/dashboard">
            <Button size="sm">Open App</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold tracking-tight">DClaw Audit</span>
          </div>
          <p className="text-sm text-slate-500">
            Audit engagement, evidence, controls, and continuous-monitoring workspace.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
            <Link href="/controls" className="hover:text-slate-900">Controls</Link>
            <Link href="/risk" className="hover:text-slate-900">Risk</Link>
            <Link href="/testing" className="hover:text-slate-900">Testing</Link>
            <Link href="/reports" className="hover:text-slate-900">Reports</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3" />
              AI-Native Audit &amp; Compliance Platform
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
              Run the entire audit lifecycle from{" "}
              <span className="text-slate-600">one system of record</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              DClaw Audit unifies engagement tracking, evidence collection, control
              testing, risk scoring, anomaly detection, and continuous signals — with
              an AI copilot grounded in your real audit data.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-6 text-base">
                  Open App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero visual: dashboard preview */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-slate-400">DClaw Audit Dashboard</span>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-4">
                {[
                  { label: "Engagements", value: "12", change: "3 in progress" },
                  { label: "Open Findings", value: "8", change: "2 critical" },
                  { label: "Evidence Requests", value: "24", change: "6 overdue" },
                  { label: "Controls Mapped", value: "34", change: "across 4 frameworks" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.change}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / frameworks ─────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Built for compliance with
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            {["SOX", "ISO 27001", "NIST", "PCI-DSS"].map((fw) => (
              <span
                key={fw}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500"
              >
                {fw}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO CONTROLS — remove this block + the import to drop the demo feature */}
      <DemoControls />
      {/* END DEMO CONTROLS */}

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 text-xs font-medium">
              Everything you need
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              One platform for your entire audit lifecycle
            </h2>
            <p className="mt-4 text-slate-600">
              From planning and evidence collection to control testing, risk scoring,
              anomaly review, and report generation.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={ClipboardList}
              title="Engagement Management"
              description="Track engagements with client, status (planned → in progress → reporting → completed), risk level, owner, and audit period."
            />
            <FeatureCard
              icon={FileSearch}
              title="Evidence Requests"
              description="Create, assign, and track evidence with due dates, request owners, and source systems. Status flows draft → sent → received, with overdue detection and version logs."
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Finding Lifecycle"
              description="Capture findings with severity, root cause, recommendation, and remediation plan. Track status from open → in progress → remediated → verified."
            />
            <FeatureCard
              icon={Landmark}
              title="Controls & Frameworks"
              description="Maintain a control library and map controls to SOX, ISO 27001, NIST, and PCI-DSS requirements with full / partial / planned coverage and gap analysis."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Control Testing"
              description="Plan manual, automated, or sample-based control tests. Record samples, results (pass / fail / exception), exceptions found, and reviewer sign-off."
            />
            <FeatureCard
              icon={BarChart3}
              title="Risk Register"
              description="Score risks by likelihood × impact, track residual risk after mitigation, and manage status across open, mitigated, and accepted items per engagement."
            />
            <FeatureCard
              icon={Radar}
              title="Anomaly Detection"
              description="Ingest transactions and flag statistical or rule-based anomalies with confidence scores. Triage flags through flagged → reviewed → cleared → escalated."
            />
            <FeatureCard
              icon={Activity}
              title="Continuous Signals"
              description="Capture control deviations, access changes, config changes, and threshold breaches from ERP, IAM, ticketing, and cloud sources for continuous monitoring."
            />
            <FeatureCard
              icon={Brain}
              title="Intelligence & Reports"
              description="Surface cross-engagement intelligence and an activity audit trail, then generate AI-assisted report sections from templates and engagement data."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <Badge variant="outline" className="mb-4 text-xs font-medium">
                Simple workflow
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                From planning to sign-off in three steps
              </h2>
              <p className="mt-4 text-slate-600">
                DClaw Audit streamlines the full workflow so your team spends less time
                on spreadsheets and more time improving controls.
              </p>
              <div className="mt-10">
                <HowItWorksStep
                  number="1"
                  title="Scope engagements & request evidence"
                  description="Start an engagement, set scope and risk level, then create evidence requests with owners, due dates, and source systems."
                />
                <HowItWorksStep
                  number="2"
                  title="Test controls & log findings"
                  description="Run control tests with samples, review anomalies and signals, and log findings with severity, root cause, and remediation plans."
                />
                <HowItWorksStep
                  number="3"
                  title="Report & remediate"
                  description="Generate AI-assisted report sections, track remediation to verified closure, and review the full activity audit trail."
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
                  Activity Audit Trail
                </div>
                <div className="divide-y divide-slate-50 p-4">
                  {[
                    { note: "Engagement created", time: "2 min ago" },
                    { note: "Critical finding logged: privileged access", time: "1 hour ago" },
                    { note: "Control test completed — 3 exceptions", time: "1 day ago" },
                    { note: "Evidence request marked overdue", time: "2 days ago" },
                    { note: "Anomaly flag escalated", time: "3 days ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <div className="h-2 w-2 rounded-full bg-slate-300" />
                      <p className="flex-1 text-sm text-slate-800">{log.note}</p>
                      <span className="text-xs text-slate-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Framework coverage ─────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 text-xs font-medium">
              Framework coverage
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Align controls across every major framework
            </h2>
            <p className="mt-4 text-slate-600">
              Map internal controls to SOX, ISO 27001, NIST, and PCI-DSS requirements and
              instantly see coverage and gaps.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, name: "SOX", full: "Sarbanes-Oxley Act", desc: "Financial reporting controls, certifications, and access reviews." },
              { icon: Lock, name: "ISO 27001", full: "Information Security", desc: "Access control, asset management, and change management." },
              { icon: ShieldCheck, name: "NIST", full: "Cybersecurity Framework", desc: "Identify, protect, detect, respond, and recover mapping." },
              { icon: Landmark, name: "PCI-DSS", full: "Payment Card Security", desc: "Cardholder data protection and network security controls." },
            ].map((fw) => (
              <div key={fw.name} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <fw.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{fw.name}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{fw.full}</p>
                <p className="mt-3 text-sm text-slate-600">{fw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI copilot ─────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1.5 rounded-full text-xs">
                <Sparkles className="h-3 w-3" />
                Grounded AI copilot
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Your AI audit copilot
              </h2>
              <p className="mt-4 text-slate-600">
                The copilot is grounded in your actual engagement data — it reads findings,
                evidence requests, controls, and risks to produce contextual outputs.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Draft evidence requests from engagement scope and risk",
                  "Suggest key risks, controls, and test ideas per engagement",
                  "Convert raw observations into structured draft findings",
                  "Generate executive summaries and report sections",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Output
                </p>
                <p className="text-sm font-medium text-slate-800">
                  Draft Finding: Privileged access reviews incomplete
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Root Cause:</span> HR
                  offboarding is not synchronized with IT access provisioning.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Recommendation:</span>{" "}
                  Implement automated SCIM-based access revocation within 24 hours of termination.
                </p>
                <Badge variant="destructive" className="mt-3 text-[10px]">
                  Severity: Critical
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to streamline your audit workflow?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Start tracking engagements, evidence, controls, and findings today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 bg-white px-6 text-base text-slate-900 hover:bg-slate-100">
                Open App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/controls">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-slate-600 bg-transparent px-6 text-base text-white hover:bg-slate-800"
              >
                Explore Controls
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

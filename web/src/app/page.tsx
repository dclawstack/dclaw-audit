"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ClipboardList,
  FileSearch,
  AlertTriangle,
  Landmark,
  Sparkles,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  BookOpen,
  ChevronRight,
  Bot,
  Brain,
  Activity,
  FolderOpen,
  Wrench,
  Upload,
  TrendingUp,
  Eye,
  Download,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Utilities ────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Fade({
  children,
  className = "",
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Risk", href: "/risk" },
  { label: "Controls", href: "/controls" },
  { label: "Anomalies", href: "/anomalies" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Reports", href: "/reports" },
];

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">DClaw Audit</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dashboard">
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-700">
              Launch App
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-700"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="mt-2 w-full bg-slate-900 text-white">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pb-24 pt-20 md:pt-32">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px,transparent 1px),linear-gradient(to right,#000 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <Fade className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          >
            <Sparkles className="h-3 w-3" />
            AI-Native Audit Platform · v1.3
          </Badge>

          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-7xl">
            The evidence-to-finding{" "}
            <span className="bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
              operating system
            </span>{" "}
            for internal audit
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            DClaw Audit turns fragmented evidence collection, control testing, and remediation
            follow-up into a single AI-assisted system of record. Compress audit cycle time
            without adding headcount.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 gap-2 bg-slate-900 px-7 text-base text-white hover:bg-slate-700">
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-7 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Explore Features
            </a>
          </div>
        </Fade>

        {/* Hero mock dashboard */}
        <Fade delay={0.2} className="mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-3 flex-1 rounded-md bg-slate-200/60 px-3 py-1 text-xs text-slate-400">
                dclaw-audit.vercel.app/dashboard
              </div>
            </div>

            <div className="p-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Engagements", value: "14", sub: "3 in progress", color: "text-slate-900" },
                  { label: "Open Findings", value: "9", sub: "2 critical", color: "text-red-600" },
                  { label: "Evidence Requests", value: "31", sub: "7 overdue", color: "text-amber-600" },
                  { label: "Controls Mapped", value: "42", sub: "4 frameworks", color: "text-green-600" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                    <p className={cn("mt-1 text-2xl font-bold", s.color)}>{s.value}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Mini activity feed */}
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Recent Activity
                  </p>
                  {[
                    { icon: "🔴", text: "Critical finding raised — Access Control Gap", time: "2m ago" },
                    { icon: "📎", text: "Evidence uploaded for SOX Q4 review", time: "18m ago" },
                    { icon: "✅", text: "Finding remediated — Password Policy", time: "1h ago" },
                    { icon: "🤖", text: "AI drafted 6 evidence requests", time: "3h ago" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <span className="text-base">{item.icon}</span>
                      <p className="flex-1 text-xs text-slate-700">{item.text}</p>
                      <span className="shrink-0 text-[10px] text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Finding Severity
                  </p>
                  {[
                    { label: "Critical", pct: "22%", color: "bg-red-500", count: 2 },
                    { label: "High", pct: "33%", color: "bg-orange-500", count: 3 },
                    { label: "Medium", pct: "33%", color: "bg-yellow-400", count: 3 },
                    { label: "Low", pct: "12%", color: "bg-green-500", count: 1 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 py-1.5">
                      <span className="w-14 text-xs text-slate-500">{item.label}</span>
                      <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={cn("h-full rounded-full", item.color)} style={{ width: item.pct }} />
                      </div>
                      <span className="w-4 text-right text-xs font-medium text-slate-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

// ── Trust bar ─────────────────────────────────────────────────────────────────

function TrustBar() {
  return (
    <section className="border-y border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Built for compliance with
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {["SOX", "ISO 27001", "NIST CSF", "PCI-DSS", "GDPR", "SOC 2", "COBIT"].map((fw) => (
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
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Engagement Management",
    description:
      "Track audit engagements with risk levels, owners, periods, and statuses. Manage SOX, ITGC, and operational reviews in one place.",
    href: "/dashboard",
  },
  {
    icon: FileSearch,
    title: "Evidence Requests",
    description:
      "Create, assign, and track evidence collection with due dates, source systems, owners, and file uploads. Full version history per request.",
    href: "/dashboard",
  },
  {
    icon: AlertTriangle,
    title: "Finding Lifecycle",
    description:
      "Capture findings with severity, root cause, recommendation, and management action plans. Track open → remediated → verified.",
    href: "/dashboard",
  },
  {
    icon: Wrench,
    title: "Remediation Plans",
    description:
      "Dedicated remediation module with action items, progress tracking, due dates, and AI-generated plans from finding context.",
    href: "/dashboard",
  },
  {
    icon: FolderOpen,
    title: "Workpaper Management",
    description:
      "Digital workpapers with draft → in-review → approved workflow, version bumping, preparer/reviewer assignments, and content history.",
    href: "/dashboard",
  },
  {
    icon: Landmark,
    title: "Controls & Framework Mapping",
    description:
      "Map controls to SOX, ISO 27001, NIST, and PCI-DSS. Run instant gap analysis to identify uncovered compliance requirements.",
    href: "/controls",
  },
  {
    icon: Eye,
    title: "Risk Register",
    description:
      "Risk items per engagement with likelihood × impact scoring, residual risk tracking, owner assignment, and mitigation notes.",
    href: "/risk",
  },
  {
    icon: Activity,
    title: "Anomaly Detection",
    description:
      "Bulk-ingest transactions, run statistical and rule-based anomaly detection, and triage flags with analyst notes and confidence scores.",
    href: "/anomalies",
  },
  {
    icon: Brain,
    title: "Audit Intelligence",
    description:
      "Cross-engagement trend detection, recurring control failure tracking, owner responsiveness scores, and cycle time benchmarking.",
    href: "/intelligence",
  },
  {
    icon: Zap,
    title: "Audit Signals",
    description:
      "Ingest and triage signals from ERP, IAM, cloud, and ticketing systems. Link signals directly to engagements or findings.",
    href: "/signals",
  },
  {
    icon: FileText,
    title: "Report Builder",
    description:
      "Create report templates, generate AI-assisted executive-ready reports from live engagement data, and export board-ready HTML.",
    href: "/reports",
  },
  {
    icon: Sparkles,
    title: "AI Copilot — Every Page",
    description:
      "Floating AI copilot accessible from any page. Drafts evidence requests, suggests risks, converts observations into findings, scores remediation.",
    href: "/dashboard",
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Fade className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 text-xs font-medium">
            Full platform
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            One platform for your entire audit lifecycle
          </h2>
          <p className="mt-4 text-slate-600">
            From planning and evidence collection to remediation, workpapers, anomaly detection,
            and board-ready reporting — fully AI-assisted.
          </p>
        </Fade>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Fade key={f.title} delay={i * 0.04}>
              <Link href={f.href} className="group block h-full">
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">{f.title}</h3>
                  <p className="flex-1 text-xs leading-relaxed text-slate-600">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-700">
                    Open <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Copilot ────────────────────────────────────────────────────────────────

function AICopilot() {
  const capabilities = [
    "Draft evidence request lists from engagement scope and risk level",
    "Suggest key risks, controls, and test ideas per engagement",
    "Convert raw observations into structured draft findings with severity",
    "Generate AI remediation plans with action items from finding context",
    "Check evidence completeness and flag missing areas",
    "Prioritize findings by risk, severity, and remediation urgency",
    "Generate board-ready executive summaries and report sections",
    "Accessible from every page via floating panel — no context switching",
  ];

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: copy */}
          <Fade>
            <Badge
              variant="secondary"
              className="mb-4 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold"
            >
              <Bot className="h-3 w-3" />
              AI Copilot · Everywhere
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              Grounded AI — not a chatbot
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Every AI output is grounded in your actual engagement data — findings, evidence
              requests, controls, and risk register. No hallucinations. No generic advice.
              The copilot reads your data and produces concrete, citable outputs.
            </p>
            <ul className="mt-8 space-y-3">
              {capabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-sm text-slate-700">{cap}</span>
                </li>
              ))}
            </ul>
          </Fade>

          {/* Right: mock copilot UI */}
          <Fade delay={0.15}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-semibold">AI Copilot</span>
                </div>
                <Badge className="bg-slate-700 text-[10px] text-slate-200">Live</Badge>
              </div>

              {/* Chat */}
              <div className="space-y-4 p-5">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white">
                    Draft evidence requests for SOX Q4 access review
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p className="mb-2 font-semibold text-slate-900">6 evidence requests drafted:</p>
                    <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed">
                      <li>Privileged access review logs — IT Security</li>
                      <li>Terminated user access removal report — HR & IT</li>
                      <li>Quarterly user access certification sign-offs — Managers</li>
                      <li>Password policy configuration export — IT Operations</li>
                      <li>MFA enrollment status report — Identity team</li>
                      <li>SOD conflict analysis output — Finance Systems</li>
                    </ol>
                    <p className="mt-3 text-[10px] text-slate-400">
                      Grounded in SOX-Q4 engagement · risk level: high · 3 existing findings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                  <span className="text-xs text-slate-400 flex-1">Ask about risks, findings, controls…</span>
                  <div className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Plan & scope your audit",
    description:
      "Create an engagement with risk level and period. Use the AI copilot to brainstorm risks, suggested controls, and a test plan. Build your risk register.",
  },
  {
    number: "02",
    title: "Collect evidence & test controls",
    description:
      "Issue evidence requests with owners and due dates. Upload files directly. Run control tests with sample-level pass/fail tracking. Log workpapers as you go.",
  },
  {
    number: "03",
    title: "Log findings & remediate",
    description:
      "Convert observations into structured findings. AI generates remediation plans with action items. Track progress to verified closure.",
  },
  {
    number: "04",
    title: "Report & monitor continuously",
    description:
      "Generate AI-assisted executive reports and export board-ready HTML. Ingest audit signals from ERP and cloud. Intelligence layer surfaces recurring failures automatically.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Fade className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 text-xs font-medium">
            End-to-end workflow
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            From planning to sign-off in four steps
          </h2>
          <p className="mt-4 text-slate-600">
            A complete audit workflow — no spreadsheets, no email threads, no disconnected tools.
          </p>
        </Fade>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Fade key={step.number} delay={i * 0.1}>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 text-4xl font-black text-slate-100">{step.number}</div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:block">
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Framework coverage ────────────────────────────────────────────────────────

const FRAMEWORKS = [
  {
    name: "SOX",
    full: "Sarbanes-Oxley",
    icon: BookOpen,
    desc: "Financial reporting controls, management certification, and IT general controls.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    name: "ISO 27001",
    full: "Information Security",
    icon: Lock,
    desc: "Access control, asset management, risk assessment, and incident management.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    name: "NIST CSF",
    full: "Cybersecurity Framework",
    icon: ShieldCheck,
    desc: "Identify, protect, detect, respond, and recover across all control domains.",
    color: "bg-green-50 text-green-700",
  },
  {
    name: "PCI-DSS",
    full: "Payment Card Security",
    icon: CreditCard,
    desc: "Cardholder data protection, access controls, vulnerability management.",
    color: "bg-amber-50 text-amber-700",
  },
];

function Frameworks() {
  return (
    <section className="border-y border-slate-100 bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Fade className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 text-xs font-medium">
            Framework coverage
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Align controls across every major framework
          </h2>
          <p className="mt-4 text-slate-600">
            Map your control library to requirements, run gap analysis, and instantly see what's
            covered and what's missing.
          </p>
        </Fade>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FRAMEWORKS.map((fw, i) => (
            <Fade key={fw.name} delay={i * 0.1}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className={cn("mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", fw.color)}>
                  <fw.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{fw.name}</h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{fw.full}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{fw.desc}</p>
              </div>
            </Fade>
          ))}
        </div>

        <Fade delay={0.3} className="mt-10 text-center">
          <Link href="/controls">
            <Button variant="outline" className="gap-2">
              Explore Framework Mapping
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </Fade>
      </div>
    </section>
  );
}

// ── Advanced capabilities ─────────────────────────────────────────────────────

function Advanced() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Fade className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 text-xs font-medium">
            Advanced capabilities
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Continuous assurance — not just point-in-time audits
          </h2>
          <p className="mt-4 text-slate-600">
            Go beyond periodic audit cycles with anomaly detection, real-time signals, and
            cross-engagement intelligence.
          </p>
        </Fade>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Anomaly Detection */}
          <Fade delay={0}>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <BarChart3 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Anomaly Detection</h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                Bulk-ingest financial transactions and run statistical and rule-based detection.
                Triage flagged items with confidence scores, analyst notes, and escalation paths.
              </p>
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
                {[
                  { type: "statistical", label: "Round-dollar transaction: $50,000.00", score: "0.91" },
                  { type: "rule_based", label: "Weekend journal entry by contractor", score: "0.87" },
                  { type: "statistical", label: "Volume spike: 3× normal run rate", score: "0.79" },
                ].map((flag, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                      {flag.score}
                    </span>
                    <span className="flex-1 text-slate-600">{flag.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/anomalies" className="mt-4">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Open Anomaly Detection <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </Fade>

          {/* Audit Signals */}
          <Fade delay={0.1}>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Audit Signals</h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                Ingest signals from ERP, IAM, cloud, and ticketing systems. Triage by severity,
                link to engagements or findings, and escalate deviations before they become issues.
              </p>
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
                {[
                  { source: "IAM", label: "Admin role granted outside change window", sev: "high" },
                  { source: "ERP", label: "Segregation of duties conflict detected", sev: "critical" },
                  { source: "Cloud", label: "S3 bucket made public — prod account", sev: "critical" },
                ].map((sig, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {sig.source}
                    </span>
                    <span className="flex-1 text-slate-600">{sig.label}</span>
                    <span className={cn("text-[10px] font-semibold", sig.sev === "critical" ? "text-red-600" : "text-amber-600")}>
                      {sig.sev}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/signals" className="mt-4">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Open Audit Signals <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </Fade>

          {/* Intelligence */}
          <Fade delay={0.2}>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Audit Intelligence</h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                Surface cross-engagement patterns automatically. Recurring control failures,
                owner responsiveness scores, and cycle time benchmarks — updated continuously.
              </p>
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-3">
                {[
                  { metric: "Avg Finding Age", value: "47 days", trend: "up" },
                  { metric: "Control Failure Rate", value: "18%", trend: "down" },
                  { metric: "Audit Cycle Time", value: "62 days", trend: "down" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-500">{m.metric}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">{m.value}</span>
                      <TrendingUp className={cn("h-3 w-3", m.trend === "up" ? "text-red-500 rotate-0" : "text-green-500 rotate-180")} />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/intelligence" className="mt-4">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Open Intelligence <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="bg-slate-900 py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Fade>
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Ready to run a faster audit?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
            DClaw Audit is live — start tracking engagements, evidence, findings, and remediation
            today. The AI copilot is ready on every page.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-13 gap-2 bg-white px-8 text-base font-semibold text-slate-900 hover:bg-slate-100"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/controls">
              <Button
                size="lg"
                variant="outline"
                className="h-13 gap-2 border-slate-600 bg-transparent px-8 text-base text-white hover:bg-slate-800"
              >
                Explore Controls
              </Button>
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "Risk Register", href: "/risk" },
              { label: "Anomaly Detection", href: "/anomalies" },
              { label: "Audit Signals", href: "/signals" },
              { label: "Intelligence", href: "/intelligence" },
              { label: "Reports", href: "/reports" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </Fade>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2 text-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold tracking-tight">DClaw Audit</span>
          </Link>

          <p className="text-center text-sm text-slate-500">
            AI-native evidence-to-finding operating system for internal audit teams.
          </p>

          <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-500">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-900">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <TrustBar />
      <Features />
      <AICopilot />
      <HowItWorks />
      <Frameworks />
      <Advanced />
      <CTA />
      <Footer />
    </div>
  );
}

// ── Inline icon (no extra dep) ────────────────────────────────────────────────

function CreditCard({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  Lock,
  BookOpen,
  ChevronRight,
  Bot,
  Brain,
  Activity,
  FolderOpen,
  Wrench,
  TrendingUp,
  Eye,
  Menu,
  X,
  Zap,
} from "lucide-react";

// ── Utilities ─────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
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

const GITHUB_URL = "https://github.com/dclawstack/dclaw-audit";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0618]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7030A0]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-lg font-black text-white"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            <span className="text-[#c084fc]">DClaw</span> Audit
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[#7030A0] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#5a2580] hover:shadow-lg hover:shadow-purple-900/40"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Launch App
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-white md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0d0618] px-6 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-white/60"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              <button
                className="mt-2 w-full rounded-full bg-[#7030A0] py-2.5 text-sm font-bold text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Launch App
              </button>
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
    <section className="relative min-h-[92vh] bg-[#0d0618] dot-grid flex flex-col justify-center overflow-hidden">
      {/* Purple glow blobs */}
      <div className="pointer-events-none absolute top-[-8%] left-[-4%] h-[480px] w-[480px] rounded-full bg-[#7030A0] opacity-20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-8%] right-[-4%] h-[400px] w-[400px] rounded-full bg-[#c084fc] opacity-15 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c084fc] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c084fc]" />
            </span>
            <span
              className="text-xs font-medium text-white/70"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              v1.3 · AI-Native Audit Platform · Open Source
            </span>
          </div>

          <h1
            className="mb-6 text-5xl font-black leading-[1.05] md:text-7xl"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            <span className="text-white">The evidence-to-finding</span>
            <br />
            <span className="shimmer-text">operating system</span>
            <br />
            <span className="mt-1 block text-white/60 text-3xl font-semibold md:text-4xl">
              for internal audit
            </span>
          </h1>

          <p
            className="mb-10 max-w-lg text-lg leading-relaxed text-white/60"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            DClaw Audit turns fragmented evidence collection, control testing, and
            remediation follow-up into a single AI-assisted system of record. Compress
            audit cycle time without adding headcount.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#7030A0] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#5a2580] hover:scale-105 hover:shadow-lg hover:shadow-purple-900/40"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Launch Dashboard →
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <GitHubIcon className="h-4 w-4" />
              ⭐ GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
            {[
              ["12", "AI Modules"],
              ["4", "Frameworks"],
              ["100%", "Open Source"],
              ["v1.3", "Latest"],
            ].map(([val, label]) => (
              <div key={label}>
                <div
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  {val}
                </div>
                <div
                  className="mt-0.5 text-xs text-white/40"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: mock dashboard */}
        <div className="float-card hidden lg:block">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <span className="h-3 w-3 rounded-full bg-green-400/60" />
              <div className="ml-3 flex-1 rounded-md bg-white/10 px-3 py-1 text-xs text-white/40">
                dclaw-audit.vercel.app/dashboard
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Engagements", value: "14", sub: "3 in progress", color: "text-white" },
                  { label: "Open Findings", value: "9", sub: "2 critical", color: "text-red-400" },
                  { label: "Evidence Requests", value: "31", sub: "7 overdue", color: "text-amber-400" },
                  { label: "Controls Mapped", value: "42", sub: "4 frameworks", color: "text-green-400" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/10 bg-white/8 p-4"
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider text-white/40"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {s.label}
                    </p>
                    <p
                      className={cn("mt-1 text-2xl font-black", s.color)}
                      style={{ fontFamily: "'Raleway', sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs space-y-2">
                {[
                  { icon: "🔴", text: "Critical finding raised — Access Control Gap", time: "2m ago" },
                  { icon: "📎", text: "Evidence uploaded for SOX Q4 review", time: "18m ago" },
                  { icon: "✅", text: "Finding remediated — Password Policy", time: "1h ago" },
                  { icon: "🤖", text: "AI drafted 6 evidence requests", time: "3h ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <p className="flex-1 text-white/60">{item.text}</p>
                    <span className="shrink-0 text-[10px] text-white/30">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-[#7030A0]/40 bg-[#7030A0]/20 px-3 py-1.5">
                <span className="text-[10px] text-[#c084fc]">✦ AI Copilot</span>
                <span className="text-[10px] text-white/60">
                  3 controls have recurring failures across 2 engagements
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 60L1440 60L1440 30C1200 60 960 0 720 20C480 40 240 10 0 30L0 60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  { icon: "📋", label: "Engagement Management" },
  { icon: "📎", label: "Evidence Requests" },
  { icon: "⚠️", label: "Finding Lifecycle" },
  { icon: "🔧", label: "Remediation Plans" },
  { icon: "📂", label: "Workpaper Management" },
  { icon: "🏛️", label: "Framework Mapping" },
  { icon: "👁️", label: "Risk Register" },
  { icon: "📊", label: "Anomaly Detection" },
  { icon: "🧠", label: "Audit Intelligence" },
  { icon: "⚡", label: "Audit Signals" },
  { icon: "📄", label: "Report Builder" },
  { icon: "🤖", label: "AI Copilot" },
];

function Marquee() {
  return (
    <section className="overflow-hidden border-y border-[#f0e8fa] bg-[#faf6ff] py-5">
      <div className="flex whitespace-nowrap">
        <div className="marquee-track flex gap-10 pr-10">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-sm font-semibold text-[#7030A0]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              <span className="mx-2 text-[#c084fc]">·</span>
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
    n: "01",
    title: "Engagement Management",
    description:
      "Track audit engagements with risk levels, owners, periods, and statuses. Manage SOX, ITGC, and operational reviews in one place.",
    href: "/dashboard",
  },
  {
    icon: FileSearch,
    n: "02",
    title: "Evidence Requests",
    description:
      "Create, assign, and track evidence collection with due dates, source systems, owners, and file uploads. Full version history per request.",
    href: "/dashboard",
  },
  {
    icon: AlertTriangle,
    n: "03",
    title: "Finding Lifecycle",
    description:
      "Capture findings with severity, root cause, recommendation, and management action plans. Track open → remediated → verified.",
    href: "/dashboard",
  },
  {
    icon: Wrench,
    n: "04",
    title: "Remediation Plans",
    description:
      "Dedicated remediation module with action items, progress tracking, due dates, and AI-generated plans from finding context.",
    href: "/dashboard",
  },
  {
    icon: FolderOpen,
    n: "05",
    title: "Workpaper Management",
    description:
      "Digital workpapers with draft → in-review → approved workflow, version bumping, preparer/reviewer assignments, and content history.",
    href: "/dashboard",
  },
  {
    icon: Landmark,
    n: "06",
    title: "Controls & Framework Mapping",
    description:
      "Map controls to SOX, ISO 27001, NIST, and PCI-DSS. Run instant gap analysis to identify uncovered compliance requirements.",
    href: "/controls",
  },
  {
    icon: Eye,
    n: "07",
    title: "Risk Register",
    description:
      "Risk items per engagement with likelihood × impact scoring, residual risk tracking, owner assignment, and mitigation notes.",
    href: "/risk",
  },
  {
    icon: Activity,
    n: "08",
    title: "Anomaly Detection",
    description:
      "Bulk-ingest transactions, run statistical and rule-based anomaly detection, and triage flags with analyst notes and confidence scores.",
    href: "/anomalies",
  },
  {
    icon: Brain,
    n: "09",
    title: "Audit Intelligence",
    description:
      "Cross-engagement trend detection, recurring control failure tracking, owner responsiveness scores, and cycle time benchmarking.",
    href: "/intelligence",
  },
  {
    icon: Zap,
    n: "10",
    title: "Audit Signals",
    description:
      "Ingest and triage signals from ERP, IAM, cloud, and ticketing systems. Link signals directly to engagements or findings.",
    href: "/signals",
  },
  {
    icon: FileText,
    n: "11",
    title: "Report Builder",
    description:
      "Create report templates, generate AI-assisted executive-ready reports from live engagement data, and export board-ready HTML.",
    href: "/reports",
  },
  {
    icon: Sparkles,
    n: "12",
    title: "AI Copilot — Every Page",
    description:
      "Floating AI copilot accessible from any page. Drafts evidence requests, suggests risks, converts observations into findings, scores remediation.",
    href: "/dashboard",
  },
];

function Features() {
  return (
    <section className="relative overflow-hidden bg-white py-32 px-6">
      {/* Watermark number */}
      <div
        className="pointer-events-none absolute right-0 top-6 select-none text-[22rem] font-black leading-none text-[#f3e8ff]"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        12
      </div>

      <div className="relative mx-auto max-w-7xl">
        <FadeUp className="mb-20 text-center">
          <span
            className="rounded-full bg-[#f3e8ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7030A0]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Full Platform
          </span>
          <h2
            className="mt-6 mb-4 text-5xl font-black md:text-6xl"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            One platform for your<br />
            <span className="shimmer-text">entire audit lifecycle.</span>
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg text-[#5A5A5A]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            From planning and evidence collection to remediation, workpapers, anomaly detection,
            and board-ready reporting — fully AI-assisted.
          </p>
        </FadeUp>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={(i % 4) * 80}>
              <Link href={f.href} className="group block h-full">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ece6f5] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100">
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-gradient-to-bl from-[#f3e8ff] to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7030A0]">
                        <f.icon className="h-4 w-4 text-white" />
                      </div>
                      <span
                        className="rounded-full bg-[#f3e8ff] px-2 py-0.5 text-xs font-mono text-[#9d6dc7]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {f.n}
                      </span>
                    </div>
                    <h3
                      className="mb-2 text-sm font-bold text-[#1a0a2e]"
                      style={{ fontFamily: "'Raleway', sans-serif" }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="flex-1 text-xs leading-relaxed text-[#5A5A5A]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {f.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#c084fc] transition-colors group-hover:text-[#7030A0]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Open <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </FadeUp>
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
    <section className="relative overflow-hidden bg-[#0d0618] py-32 px-6">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[320px] w-[600px] rounded-full bg-[#7030A0] opacity-15 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl grid items-center gap-16 lg:grid-cols-2">
        {/* Left: copy */}
        <FadeUp>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c084fc]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <Bot className="h-3 w-3" />
            AI Copilot · Everywhere
          </span>
          <h2
            className="mt-6 mb-4 text-5xl font-black text-white"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            Grounded AI —<br />
            <span className="shimmer-text">not a chatbot.</span>
          </h2>
          <p
            className="mb-8 text-white/60 leading-relaxed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Every AI output is grounded in your actual engagement data — findings, evidence
            requests, controls, and risk register. No hallucinations. No generic advice.
            The copilot reads your data and produces concrete, citable outputs.
          </p>
          <ul className="space-y-3">
            {capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7030A0]" />
                <span
                  className="text-sm text-white/70"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {cap}
                </span>
              </li>
            ))}
          </ul>
        </FadeUp>

        {/* Right: mock copilot */}
        <FadeUp delay={150}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#7030A0] px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Bot className="h-4 w-4" />
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  AI Copilot
                </span>
              </div>
              <span
                className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white/80"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                LIVE
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-[#7030A0] px-3 py-2 text-sm text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Draft evidence requests for SOX Q4 access review
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/80">
                  <p
                    className="mb-2 font-bold text-white"
                    style={{ fontFamily: "'Raleway', sans-serif" }}
                  >
                    6 evidence requests drafted:
                  </p>
                  <ol
                    className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-white/60"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <li>Privileged access review logs — IT Security</li>
                    <li>Terminated user access removal report — HR & IT</li>
                    <li>Quarterly user access certification sign-offs — Managers</li>
                    <li>Password policy configuration export — IT Operations</li>
                    <li>MFA enrollment status report — Identity team</li>
                    <li>SOD conflict analysis output — Finance Systems</li>
                  </ol>
                  <p
                    className="mt-3 text-[10px] text-[#c084fc]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Grounded in SOX-Q4 engagement · risk level: high · 3 existing findings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <span
                  className="flex-1 text-xs text-white/30"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Ask about risks, findings, controls…
                </span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7030A0]">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: "📋",
    title: "Plan & scope your audit",
    description:
      "Create an engagement with risk level and period. Use the AI copilot to brainstorm risks, suggested controls, and a test plan. Build your risk register.",
  },
  {
    number: "02",
    icon: "📎",
    title: "Collect evidence & test controls",
    description:
      "Issue evidence requests with owners and due dates. Upload files directly. Run control tests with sample-level pass/fail tracking. Log workpapers as you go.",
  },
  {
    number: "03",
    icon: "🔍",
    title: "Log findings & remediate",
    description:
      "Convert observations into structured findings. AI generates remediation plans with action items. Track progress to verified closure.",
  },
  {
    number: "04",
    icon: "📊",
    title: "Report & monitor continuously",
    description:
      "Generate AI-assisted executive reports and export board-ready HTML. Ingest audit signals from ERP and cloud. Intelligence layer surfaces recurring failures automatically.",
  },
];

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-32 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <FadeUp>
          <span
            className="rounded-full bg-[#f3e8ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7030A0]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            End-to-end workflow
          </span>
          <h2
            className="mt-6 mb-4 text-5xl font-black md:text-6xl"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            Zero friction.<br />
            <span className="shimmer-text">Infinite insight.</span>
          </h2>
          <p
            className="mb-20 text-lg text-[#5A5A5A]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            A complete audit workflow — no spreadsheets, no email threads, no disconnected tools.
          </p>
        </FadeUp>

        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-14 left-[16%] right-[16%] hidden h-px bg-gradient-to-r from-[#7030A0] via-[#c084fc] to-[#7030A0] lg:block" />
          {STEPS.map((step, i) => (
            <FadeUp key={step.number} delay={i * 120}>
              <div className="rounded-2xl border border-[#ece6f5] bg-white p-7 hover:border-[#c084fc] hover:shadow-md transition-all duration-200">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#7030A0]/40 bg-[#7030A0]/20 text-xl">
                  {step.icon}
                </div>
                <div
                  className="mb-2 text-xs text-[#c084fc]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {step.number}
                </div>
                <h3
                  className="mb-2 font-bold text-[#1a0a2e]"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-[#5A5A5A]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {step.description}
                </p>
              </div>
            </FadeUp>
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
    icon: CreditCardIcon,
    desc: "Cardholder data protection, access controls, vulnerability management.",
    color: "bg-amber-50 text-amber-700",
  },
];

function Frameworks() {
  return (
    <section className="border-y border-[#f0e8fa] bg-[#faf6ff] py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeUp className="mx-auto mb-16 max-w-2xl text-center">
          <span
            className="rounded-full bg-[#f3e8ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7030A0]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Framework coverage
          </span>
          <h2
            className="mt-6 mb-4 text-4xl font-black"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            Align controls across every major framework
          </h2>
          <p
            className="text-[#5A5A5A]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Map your control library to requirements, run gap analysis, and instantly see what's
            covered and what's missing.
          </p>
        </FadeUp>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FRAMEWORKS.map((fw, i) => (
            <FadeUp key={fw.name} delay={i * 80}>
              <div className="rounded-2xl border border-[#ece6f5] bg-white p-6 text-center shadow-sm transition-all duration-200 hover:border-[#c084fc] hover:shadow-md">
                <div
                  className={cn(
                    "mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                    fw.color
                  )}
                >
                  <fw.icon className="h-6 w-6" />
                </div>
                <h3
                  className="text-xl font-black text-[#1a0a2e]"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  {fw.name}
                </h3>
                <p
                  className="mt-0.5 text-xs font-medium text-[#8A8A8A]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {fw.full}
                </p>
                <p
                  className="mt-3 text-sm leading-relaxed text-[#5A5A5A]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {fw.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={200} className="mt-10 text-center">
          <Link
            href="/controls"
            className="inline-flex items-center gap-2 rounded-full border border-[#7030A0] px-6 py-2.5 text-sm font-bold text-[#7030A0] transition-all hover:bg-[#7030A0] hover:text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Explore Framework Mapping
            <ChevronRight className="h-4 w-4" />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Advanced capabilities ─────────────────────────────────────────────────────

function Advanced() {
  return (
    <section className="relative overflow-hidden bg-white py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeUp className="mx-auto mb-16 max-w-2xl text-center">
          <span
            className="rounded-full bg-[#f3e8ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7030A0]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Advanced capabilities
          </span>
          <h2
            className="mt-6 mb-4 text-4xl font-black"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            Continuous assurance —{" "}
            <span className="shimmer-text">not just point-in-time.</span>
          </h2>
          <p
            className="text-[#5A5A5A]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Go beyond periodic audit cycles with anomaly detection, real-time signals, and
            cross-engagement intelligence.
          </p>
        </FadeUp>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Anomaly Detection */}
          <FadeUp delay={0}>
            <div className="flex flex-col rounded-2xl border border-[#ece6f5] bg-white p-6 hover:border-[#c084fc] hover:shadow-xl hover:shadow-purple-100 transition-all duration-300">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <BarChart3 className="h-5 w-5 text-red-600" />
              </div>
              <h3
                className="mb-2 text-lg font-bold text-[#1a0a2e]"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                Anomaly Detection
              </h3>
              <p
                className="flex-1 text-sm leading-relaxed text-[#5A5A5A]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Bulk-ingest financial transactions and run statistical and rule-based detection.
                Triage flagged items with confidence scores, analyst notes, and escalation paths.
              </p>
              <div className="mt-6 space-y-2 rounded-xl border border-[#ece6f5] bg-[#faf6ff] p-4 text-xs">
                {[
                  { score: "0.91", label: "Round-dollar transaction: $50,000.00" },
                  { score: "0.87", label: "Weekend journal entry by contractor" },
                  { score: "0.79", label: "Volume spike: 3× normal run rate" },
                ].map((flag, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-red-700">
                      {flag.score}
                    </span>
                    <span className="text-[#5A5A5A]" style={{ fontFamily: "'Poppins', sans-serif" }}>{flag.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/anomalies" className="mt-4">
                <button
                  className="w-full rounded-full border border-[#7030A0] py-2 text-sm font-bold text-[#7030A0] transition-all hover:bg-[#7030A0] hover:text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Open Anomaly Detection →
                </button>
              </Link>
            </div>
          </FadeUp>

          {/* Audit Signals */}
          <FadeUp delay={100}>
            <div className="flex flex-col rounded-2xl border border-[#ece6f5] bg-white p-6 hover:border-[#c084fc] hover:shadow-xl hover:shadow-purple-100 transition-all duration-300">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3
                className="mb-2 text-lg font-bold text-[#1a0a2e]"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                Audit Signals
              </h3>
              <p
                className="flex-1 text-sm leading-relaxed text-[#5A5A5A]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Ingest signals from ERP, IAM, cloud, and ticketing systems. Triage by severity,
                link to engagements or findings, and escalate deviations before they become issues.
              </p>
              <div className="mt-6 space-y-2 rounded-xl border border-[#ece6f5] bg-[#faf6ff] p-4 text-xs">
                {[
                  { source: "IAM", label: "Admin role granted outside change window", sev: "high" },
                  { source: "ERP", label: "Segregation of duties conflict detected", sev: "critical" },
                  { source: "Cloud", label: "S3 bucket made public — prod account", sev: "critical" },
                ].map((sig, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="rounded bg-[#ece6f5] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#7030A0]">
                      {sig.source}
                    </span>
                    <span className="flex-1 text-[#5A5A5A]" style={{ fontFamily: "'Poppins', sans-serif" }}>{sig.label}</span>
                    <span className={cn("text-[10px] font-semibold", sig.sev === "critical" ? "text-red-600" : "text-amber-600")}>
                      {sig.sev}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/signals" className="mt-4">
                <button
                  className="w-full rounded-full border border-[#7030A0] py-2 text-sm font-bold text-[#7030A0] transition-all hover:bg-[#7030A0] hover:text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Open Audit Signals →
                </button>
              </Link>
            </div>
          </FadeUp>

          {/* Intelligence */}
          <FadeUp delay={200}>
            <div className="flex flex-col rounded-2xl border border-[#ece6f5] bg-white p-6 hover:border-[#c084fc] hover:shadow-xl hover:shadow-purple-100 transition-all duration-300">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <h3
                className="mb-2 text-lg font-bold text-[#1a0a2e]"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                Audit Intelligence
              </h3>
              <p
                className="flex-1 text-sm leading-relaxed text-[#5A5A5A]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Surface cross-engagement patterns automatically. Recurring control failures,
                owner responsiveness scores, and cycle time benchmarks — updated continuously.
              </p>
              <div className="mt-6 space-y-3 rounded-xl border border-[#ece6f5] bg-[#faf6ff] p-4 text-xs">
                {[
                  { metric: "Avg Finding Age", value: "47 days", trend: "up" },
                  { metric: "Control Failure Rate", value: "18%", trend: "down" },
                  { metric: "Audit Cycle Time", value: "62 days", trend: "down" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[#5A5A5A]" style={{ fontFamily: "'Poppins', sans-serif" }}>{m.metric}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#1a0a2e]">{m.value}</span>
                      <TrendingUp
                        className={cn(
                          "h-3 w-3",
                          m.trend === "up" ? "text-red-500" : "rotate-180 text-green-500"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/intelligence" className="mt-4">
                <button
                  className="w-full rounded-full border border-[#7030A0] py-2 text-sm font-bold text-[#7030A0] transition-all hover:bg-[#7030A0] hover:text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Open Intelligence →
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#0d0618] py-32 px-6">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7030A0] opacity-20 blur-[120px]" />

      <FadeUp className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <h2
          className="mb-6 text-5xl font-black text-white md:text-6xl"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          Ready to run a{" "}
          <span className="shimmer-text">faster audit?</span>
        </h2>
        <p
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/60"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          DClaw Audit is live — start tracking engagements, evidence, findings, and remediation
          today. The AI copilot is ready on every page.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[#7030A0] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#5a2580] hover:scale-105 hover:shadow-lg hover:shadow-purple-900/40"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Launch Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <GitHubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
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
              className="text-sm text-white/40 transition-colors underline-offset-4 hover:text-white/70 hover:underline"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  App: NAV_LINKS,
  Resources: [
    { label: "Repository", href: GITHUB_URL },
    { label: "Issues", href: `${GITHUB_URL}/issues` },
    { label: "Pull Requests", href: `${GITHUB_URL}/pulls` },
    { label: "Releases", href: `${GITHUB_URL}/releases` },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080410] px-6 pb-10 pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-10 md:flex-row">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7030A0]">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span style={{ fontFamily: "'Raleway', sans-serif" }}>
                <span className="text-xl font-black text-[#c084fc]">DClaw</span>
                <span className="text-xl font-black text-white"> Audit</span>
              </span>
            </div>
            <p
              className="mb-6 text-sm leading-relaxed text-white/40"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              AI-native evidence-to-finding operating system for internal audit teams.
              Built on the One Convergence design system.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/60 transition-colors hover:bg-white/15 hover:text-white"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-2">
            {Object.entries(FOOTER_LINKS).map(([col, links]) => (
              <div key={col}>
                <h4
                  className="mb-4 text-xs font-bold uppercase tracking-widest text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {col}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      {"href" in l && l.href.startsWith("http") ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/40 transition-colors hover:text-white/80"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          className="text-sm text-white/40 transition-colors hover:text-white/80"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p
            className="text-xs text-white/30"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            © 2026 DClaw Audit · Built on the DClaw Stack · MIT License
          </p>
          <div className="flex gap-6">
            {[
              { label: "GitHub", href: GITHUB_URL },
              { label: "Issues", href: `${GITHUB_URL}/issues` },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {l.label}
              </a>
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
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #c084fc, #7030A0, #e879f9, #7030A0, #c084fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .marquee-track { animation: marquee 28s linear infinite; }
        .float-card    { animation: float 5s ease-in-out infinite; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(160, 100, 220, 0.22) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .bg-white\\/8  { background-color: rgba(255,255,255,0.08); }
        .bg-white\\/12 { background-color: rgba(255,255,255,0.12); }
      `}</style>

      <div className="overflow-x-hidden bg-white text-[#141414]">
        <Nav />
        <Hero />
        <Marquee />
        <Features />
        <AICopilot />
        <HowItWorks />
        <Frameworks />
        <Advanced />
        <CTA />
        <Footer />
      </div>
    </>
  );
}

// ── Inline icon ───────────────────────────────────────────────────────────────

function CreditCardIcon({ className }: { className?: string }) {
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

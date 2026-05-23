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
  Layers,
  Zap,
  Lock,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Dashboard
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Get Started</Button>
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
            AI-native audit engagement, evidence, and remediation workspace.
          </p>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/controls" className="hover:text-slate-900">
              Controls
            </Link>
            <Link href="/reports" className="hover:text-slate-900">
              Reports
            </Link>
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
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-circle(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-32">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3" />
              AI-Native Audit Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl leading-[1.1]">
              Complete audits faster with{" "}
              <span className="text-slate-600">AI-readiness</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              DClaw Audit transforms fragmented evidence collection, engagement tracking,
              and remediation follow-up into a single system of record with grounded AI
              copilot assistance.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-6 text-base">
                  Launch Dashboard
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
          </AnimatedSection>

          {/* Hero visual: dashboard preview card */}
          <AnimatedSection delay={0.2} className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-slate-400">DClaw Audit Dashboard</span>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-4">
                {[
                  { label: "Engagements", value: "12", change: "+3 this month" },
                  { label: "Open Findings", value: "8", change: "2 critical" },
                  { label: "Evidence Requests", value: "24", change: "6 overdue" },
                  { label: "Controls Mapped", value: "34", change: "across 4 frameworks" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.change}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Logos / Trust ──────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Built for compliance with
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            {["SOX", "ISO 27001", "NIST CSF", "PCI-DSS", "GDPR", "SOC 2"].map((fw) => (
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

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 text-xs font-medium">
              Everything you need
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              One platform for your entire audit lifecycle
            </h2>
            <p className="mt-4 text-slate-600">
              From planning and evidence collection to remediation tracking and report generation.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedSection delay={0}>
              <FeatureCard
                icon={ClipboardList}
                title="Engagement Management"
                description="Track audit engagements with risk levels, owners, periods, and statuses. Manage everything from SOX to ITGC reviews in one place."
              />
            </AnimatedSection>
            <AnimatedSection delay={0.05}>
              <FeatureCard
                icon={FileSearch}
                title="Evidence Requests"
                description="Create, assign, and track evidence collection with due dates, source systems, and request owners. Never lose a piece of evidence again."
              />
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <FeatureCard
                icon={AlertTriangle}
                title="Finding Lifecycle"
                description="Capture findings with severity, root cause, recommendation, and remediation plans. Track status from open → in-progress → remediated → verified."
              />
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <FeatureCard
                icon={Landmark}
                title="Controls & Frameworks"
                description="Map controls to SOX, ISO 27001, NIST, and PCI-DSS requirements. Run gap analysis to find uncovered compliance areas instantly."
              />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <FeatureCard
                icon={Sparkles}
                title="AI Copilot"
                description="Draft evidence requests, suggest risks and controls, convert observations into structured findings, and generate report sections — all grounded in your data."
              />
            </AnimatedSection>
            <AnimatedSection delay={0.25}>
              <FeatureCard
                icon={FileText}
                title="Report Builder"
                description="Create report templates, generate AI-assisted audit reports from engagement data, and edit sections inline. Export-ready structured outputs."
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <AnimatedSection>
              <Badge variant="outline" className="mb-4 text-xs font-medium">
                Simple workflow
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                From planning to sign-off in three steps
              </h2>
              <p className="mt-4 text-slate-600">
                DClaw Audit streamlines the full audit workflow so your team spends less time on
                spreadsheets and more time on actually improving controls.
              </p>

              <div className="mt-10">
                <HowItWorksStep
                  number="1"
                  title="Create Engagements & Evidence Requests"
                  description="Start an audit engagement, define scope and risk level, then create evidence requests with owners, due dates, and source systems."
                />
                <HowItWorksStep
                  number="2"
                  title="Collect Evidence & Log Findings"
                  description="Track evidence as it comes in. Log findings with severity, root cause, and remediation plans. Use the audit trail to see every status change."
                />
                <HowItWorksStep
                  number="3"
                  title="AI-Assisted Reporting & Remediation"
                  description="Generate draft audit report sections with the AI copilot. Track remediation through to verified closure. Export and present to stakeholders."
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="flex items-center">
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
                  Evidence Version Log
                </div>
                <div className="divide-y divide-slate-50 p-4">
                  {[
                    { action: "created", note: "Evidence request created", time: "2 min ago" },
                    { action: "status_changed", note: "Status changed from draft to sent", time: "1 day ago" },
                    { action: "file_attached", note: "Privileged access report uploaded", time: "1 day ago" },
                    { action: "updated", note: "Due date extended to Sep 30", time: "3 days ago" },
                    { action: "reminder_sent", note: "Reminder sent to Avery Morgan", time: "5 days ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <div className="h-2 w-2 rounded-full bg-slate-300" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{log.note}</p>
                      </div>
                      <span className="text-xs text-slate-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── AI Copilot Highlight ───────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <AnimatedSection>
              <div className="order-2 lg:order-1">
                <Badge
                  variant="secondary"
                  className="mb-4 inline-flex items-center gap-1.5 rounded-full text-xs"
                >
                  <Zap className="h-3 w-3" />
                  Powered by OpenRouter
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Your AI audit copilot
                </h2>
                <p className="mt-4 text-slate-600">
                  The AI copilot is grounded in your actual engagement data — never hallucinating.
                  It reads findings, evidence requests, and controls to produce contextual outputs.
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
            </AnimatedSection>

            <AnimatedSection delay={0.15} className="order-1 lg:order-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      AI Output
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-800">
                        Draft Finding: Privileged access reviews incomplete
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        <span className="font-medium text-slate-800">Root Cause:</span> HR
                        offboarding process is not synchronized with IT access provisioning.
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        <span className="font-medium text-slate-800">Recommendation:</span>{" "}
                        Implement automated SCIM-based access revocation within 24 hours of
                        termination.
                      </p>
                      <Badge variant="destructive" className="mt-1 text-[10px]">
                        Severity: Critical
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Lock className="h-3 w-3" />
                    Generated from engagement SOX-Q4-Access-Review findings and evidence
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Framework Coverage ─────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 text-xs font-medium">
              Framework coverage
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Align controls across every major framework
            </h2>
            <p className="mt-4 text-slate-600">
              Map your internal controls to SOX, ISO 27001, NIST, and PCI-DSS requirements.
              Instantly see gaps and compliance coverage.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                name: "SOX",
                full: "Sarbanes-Oxley Act",
                desc: "Financial reporting controls, management certification, and access reviews.",
              },
              {
                icon: Lock,
                name: "ISO 27001",
                full: "Information Security",
                desc: "Access control, asset management, risk assessment, and incident management.",
              },
              {
                icon: ShieldCheck,
                name: "NIST CSF",
                full: "Cybersecurity Framework",
                desc: "Identify, protect, detect, respond, and recover control mapping.",
              },
              {
                icon: CreditCardIcon,
                name: "PCI-DSS",
                full: "Payment Card Security",
                desc: "Cardholder data protection, access controls, and network security.",
              },
            ].map((fw) => (
              <AnimatedSection key={fw.name}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <fw.icon className="h-6 w-6 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{fw.name}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">{fw.full}</p>
                  <p className="mt-3 text-sm text-slate-600">{fw.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 text-xs font-medium">
              Live metrics
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Command center for audit teams
            </h2>
            <p className="mt-4 text-slate-600">
              Your real-time dashboard shows engagement status, finding severity breakdown,
              aging buckets, overdue items, and control coverage at a glance.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Audit Dashboard</span>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    Open Live Dashboard
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { label: "Engagements", value: "12", sub: "3 in progress" },
                    { label: "Open Findings", value: "8", sub: "2 overdue" },
                    { label: "Critical Issues", value: "2", sub: "needs attention" },
                    { label: "Controls Mapped", value: "34", sub: "4 frameworks" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                    >
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-400">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Finding Severity Breakdown
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: "Critical", count: 2, color: "bg-red-500", totalPct: "20%" },
                        { label: "High", count: 3, color: "bg-orange-500", totalPct: "30%" },
                        { label: "Medium", count: 4, color: "bg-yellow-500", totalPct: "40%" },
                        { label: "Low", count: 1, color: "bg-green-500", totalPct: "10%" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="w-16 text-xs text-slate-600">{item.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: item.totalPct }}
                            />
                          </div>
                          <span className="w-6 text-xs text-slate-500 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Finding Aging
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { range: "0-30 days", count: 3, color: "text-green-600" },
                        { range: "31-60 days", count: 2, color: "text-yellow-600" },
                        { range: "61-90 days", count: 2, color: "text-orange-600" },
                        { range: "91+ days", count: 1, color: "text-red-600" },
                      ].map((bucket) => (
                        <div key={bucket.range} className="rounded-lg bg-slate-50 p-3">
                          <p className={`text-lg font-bold ${bucket.color}`}>{bucket.count}</p>
                          <p className="text-xs text-slate-500">{bucket.range}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Ready to streamline your audit workflow?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Start tracking engagements, evidence, and findings today. The AI copilot is ready
              when you are.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 bg-white px-6 text-base text-slate-900 hover:bg-slate-100">
                  Get Started Now
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
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}

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

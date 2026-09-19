"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Copy,
  ExternalLink,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type PortalData = {
  name: string;
  firstName: string;
  email: string;
  role: "TEAM_LEADER" | "EXECUTIVE";
  memberType: string;
  status: string;
  referralCode: string | null;
  recruitmentUrl: string | null;

  team: {
    name: string;
    code: string;
    memberCount: number;
    leaderName: string;
    leaderEmail: string;
    members: Array<{
      id: string;
      name: string;
      email: string;
      memberType: string;
      status: string;
    }>;
  } | null;

  directReports: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;

  metrics: {
    leads: number;
    admissions: number;
    directExecutives: number;
    applications: number;
    last30DayLeads: number;
    last30DayAdmissions: number;
  };

  pipelines: {
    leads: Record<string, number>;
    admissions: Record<string, number>;
    recruitment: Record<string, number>;
  };

  commissions: {
    pending: number;
    eligible: number;
    approved: number;
    paid: number;
  };

  recentLeads: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    interestedProgram: string;
    createdAt: string;
    lastContactedAt: string | null;
  }>;

  recentAdmissions: Array<{
    id: string;
    admissionNo: string;
    studentName: string;
    studentEmail: string;
    program: string;
    status: string;
    approvedAt: string | null;
    createdAt: string;
    leadId: string | null;
  }>;

  recentApplications: Array<{
    id: string;
    applicationNo: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  }>;

  activities: Array<{
    id: string;
    action: string;
    createdAt: string;
    memberName: string;
  }>;
};

const navigation = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "team",
    label: "My Team",
    icon: Users,
  },
  {
    id: "recruitment",
    label: "Recruitment",
    icon: UserPlus,
    leaderOnly: true,
  },
  {
    id: "leads",
    label: "Leads",
    icon: Target,
  },
  {
    id: "performance",
    label: "Performance",
    icon: TrendingUp,
  },
  {
    id: "onboarding",
    label: "Onboarding",
    icon: ShieldCheck,
  },
  {
    id: "account",
    label: "Account",
    icon: Network,
  },
];

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function statusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "ONBOARDING":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "ORIENTATION":
      return "bg-indigo-50 text-indigo-700 ring-indigo-200";
    case "SUSPENDED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "INACTIVE":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case "APPROVED":
    case "ENROLLED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "NEW":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "CONTACTED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "QUALIFIED":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function lifecycleIndex(status: string) {
  switch (status) {
    case "ACTIVE":
      return 5;
    case "ORIENTATION":
      return 4;
    case "ONBOARDING":
      return 3;
    default:
      return 2;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Not contacted";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function TgnPortalShell({
  data,
}: {
  data: PortalData;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadSuccess, setLeadSuccess] = useState(false);

  const isTeamLeader = data.role === "TEAM_LEADER";
  const currentLifecycle = lifecycleIndex(data.status);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data.recentLeads;

    return data.recentLeads.filter((lead) =>
      [
        lead.fullName,
        lead.email,
        lead.phone,
        lead.interestedProgram,
        lead.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data.recentLeads, search]);

  async function copyRecruitmentLink() {
    if (!data.recruitmentUrl) return;

    try {
      await navigator.clipboard.writeText(
        data.recruitmentUrl,
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1800,
      );
    } catch {
      setCopied(false);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLeadSaving(true);
    setLeadError("");
    setLeadSuccess(false);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(
        "/api/tgn/member-leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.get("fullName"),
            email: form.get("email"),
            phone: form.get("phone"),
            interestedProgram: form.get(
              "interestedProgram",
            ),
            currentStatus:
              form.get("currentStatus") ||
              "New lead",
            preferredContact:
              form.get("preferredContact") ||
              "WHATSAPP",
            careerGoal: form.get("careerGoal"),
            notes: form.get("notes"),
          }),
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            "Unable to create the lead.",
        );
      }

      setLeadSuccess(true);

      window.setTimeout(() => {
        setLeadOpen(false);
        setLeadSuccess(false);
        window.location.reload();
      }, 900);
    } catch (error) {
      setLeadError(
        error instanceof Error
          ? error.message
          : "Unable to create the lead.",
      );
    } finally {
      setLeadSaving(false);
    }
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-white">
      <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
        <Link
          href="/growth-network/portal"
          onClick={() => setMobileOpen(false)}
          className="flex items-center"
        >
          <Image
            src="/logo/Full-logo.png"
            alt="TechSkillHub"
            width={205}
            height={72}
            priority
            className="h-auto w-[180px] object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="rounded-[22px] bg-gradient-to-br from-[#2563EB] via-[#315BEA] to-[#4F46E5] p-4 text-white shadow-[0_16px_35px_rgba(37,99,235,0.20)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Network className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Growth Network
              </p>
              <p className="text-[11px] text-blue-100">
                Member Workspace
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            TechSkillHub Network
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-5">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Workspace
        </div>

        <div className="space-y-1">
          {navigation
            .filter(
              (item) =>
                !item.leaderOnly || isTeamLeader,
            )
            .map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="group flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Icon className="h-[18px] w-[18px] text-slate-400 transition group-hover:text-blue-600" />
                  <span>{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                </a>
              );
            })}
        </div>

        <div className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          TechSkillHub
        </div>

        <div className="space-y-1">
          <Link
            href="/growth-network/join"
            className="flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <Target className="h-[18px] w-[18px] text-slate-400" />
            <span>Growth Network Guide</span>
            <ExternalLink className="ml-auto h-4 w-4 text-slate-300" />
          </Link>

          <Link
            href="/"
            className="flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <ArrowRight className="h-[18px] w-[18px] text-slate-400" />
            <span>Main Website</span>
          </Link>
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              {data.firstName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {data.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {isTeamLeader
                  ? "Team Leader"
                  : "Growth Executive"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-950">
      <div className="lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-[290px] lg:border-r lg:border-slate-200 lg:bg-white">
        {sidebar}
      </div>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-[290px] -translate-x-full border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "",
        ].join(" ")}
      >
        {sidebar}
      </div>

      <div className="lg:pl-[290px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  TechSkillHub Growth Network
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  Member Workspace
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {data.name}
                </p>
                <p className="text-xs text-slate-500">
                  {isTeamLeader
                    ? "Team Leader"
                    : "Growth Executive"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                {data.firstName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-12 pt-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1500px] space-y-6">
            <section
              id="overview"
              className="scroll-mt-24"
            >
              <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                        Growth Network Workspace
                      </p>

                      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                        Welcome, {data.firstName}.
                      </h1>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {isTeamLeader
                          ? "Manage your team recruitment, CRM activity and approved growth responsibilities from one TechSkillHub workspace."
                          : "Manage your TGN activity, CRM leads, performance and professional growth from one TechSkillHub workspace."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLeadOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lead
                    </button>

                    <div
                      className={[
                        "hidden items-center rounded-full px-3.5 py-2 text-xs font-bold ring-1 sm:inline-flex",
                        statusClass(data.status),
                      ].join(" ")}
                    >
                      <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                      {humanize(data.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="Team members"
                  value={String(
                    data.team?.memberCount ?? 0,
                  )}
                  icon={Users}
                  tone="blue"
                />

                <StatCard
                  label={
                    isTeamLeader
                      ? "Direct executives"
                      : "Team leader"
                  }
                  value={
                    isTeamLeader
                      ? String(
                          data.metrics
                            .directExecutives,
                        )
                      : data.team?.leaderName ||
                        "Assigned"
                  }
                  icon={Network}
                  tone="indigo"
                  compact={!isTeamLeader}
                />

                <StatCard
                  label="TGN leads"
                  value={String(
                    data.metrics.leads,
                  )}
                  icon={Target}
                  tone="violet"
                />

                <StatCard
                  label="Admissions"
                  value={String(
                    data.metrics.admissions,
                  )}
                  icon={ClipboardCheck}
                  tone="emerald"
                />

                <StatCard
                  label="Paid commission"
                  value={formatAmount(
                    data.commissions.paid,
                  )}
                  icon={IndianRupee}
                  tone="amber"
                  compact
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <MiniMetric
                  label="Leads · last 30 days"
                  value={data.metrics.last30DayLeads}
                />

                <MiniMetric
                  label="Admissions · last 30 days"
                  value={
                    data.metrics.last30DayAdmissions
                  }
                />

                <MiniMetric
                  label="Approved commission"
                  value={formatAmount(
                    data.commissions.approved,
                  )}
                />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Lead pipeline
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      CRM activity
                    </h2>
                  </div>

                  <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    <PipelineCard
                      label="New"
                      value={
                        data.pipelines.leads.NEW ?? 0
                      }
                    />
                    <PipelineCard
                      label="Contacted"
                      value={
                        data.pipelines.leads.CONTACTED ??
                        0
                      }
                    />
                    <PipelineCard
                      label="Qualified"
                      value={
                        data.pipelines.leads.QUALIFIED ??
                        0
                      }
                    />
                    <PipelineCard
                      label="Enrolled"
                      value={
                        data.pipelines.leads.ENROLLED ??
                        0
                      }
                    />
                    <PipelineCard
                      label="Closed"
                      value={
                        data.pipelines.leads.CLOSED ??
                        0
                      }
                    />
                    <PipelineCard
                      label="Total"
                      value={data.metrics.leads}
                    />
                  </div>
                </section>

                <section className="rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Activity
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Recent network activity
                  </h2>

                  <div className="mt-5 space-y-4">
                    {data.activities.length > 0 ? (
                      data.activities
                        .slice(0, 5)
                        .map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                              <Activity className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {humanize(
                                  activity.action,
                                )}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {activity.memberName} ·{" "}
                                {formatDate(
                                  activity.createdAt,
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">
                        Your approved TGN activity will
                        appear here as the workspace is
                        used.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </section>

            {isTeamLeader && (
              <section
                id="recruitment"
                className="scroll-mt-24"
              >
                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <UserPlus className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                          Recruitment
                        </p>

                        <h2 className="mt-1 text-xl font-bold tracking-tight">
                          Build your Growth Team
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          Invite people to apply as Growth
                          Executives using your dedicated
                          referral link.
                        </p>
                      </div>
                    </div>

                    {data.referralCode && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {data.referralCode}
                      </span>
                    )}
                  </div>

                  {data.recruitmentUrl ? (
                    <>
                      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="break-all text-xs font-medium leading-5 text-slate-600">
                          {data.recruitmentUrl}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={
                            copyRecruitmentLink
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                          {copied
                            ? "Copied"
                            : "Copy Recruitment Link"}
                        </button>

                        <a
                          href={data.recruitmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Open Recruitment Page
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-4">
                        <MiniMetric
                          label="Applications"
                          value={
                            data.metrics
                              .applications
                          }
                        />
                        <MiniMetric
                          label="Onboarding"
                          value={
                            data.pipelines
                              .recruitment
                              .ONBOARDING ?? 0
                          }
                        />
                        <MiniMetric
                          label="Orientation"
                          value={
                            data.pipelines
                              .recruitment
                              .ORIENTATION ?? 0
                          }
                        />
                        <MiniMetric
                          label="Active"
                          value={
                            data.pipelines
                              .recruitment.ACTIVE ??
                            0
                          }
                        />
                      </div>

                      {data.recentApplications.length >
                        0 && (
                        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                              Recent applications
                            </p>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {data.recentApplications
                              .slice(0, 6)
                              .map((application) => (
                                <div
                                  key={
                                    application.id
                                  }
                                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {
                                        application.name
                                      }
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        application.applicationNo
                                      }{" "}
                                      ·{" "}
                                      {formatDate(
                                        application.createdAt,
                                      )}
                                    </p>
                                  </div>

                                  <span
                                    className={[
                                      "w-fit rounded-full px-3 py-1.5 text-[11px] font-bold ring-1",
                                      statusClass(
                                        application.status,
                                      ),
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    {humanize(
                                      application.status,
                                    )}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      A recruitment link is not
                      currently available for this account.
                    </div>
                  )}
                </div>
              </section>
            )}

            <section
              id="team"
              className="scroll-mt-24"
            >
              <div className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      {isTeamLeader
                        ? "My Team"
                        : "Team Assignment"}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {isTeamLeader
                        ? "Growth Executives"
                        : data.team?.name ||
                          "Assigned Team"}
                    </h2>
                  </div>

                  {data.team?.code && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {data.team.code}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {isTeamLeader ? (
                    data.directReports.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {data.directReports.map(
                          (person) => (
                            <div
                              key={person.id}
                              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                                  {person.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {person.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {person.email}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={[
                                  "w-fit rounded-full px-3 py-1.5 text-[11px] font-bold ring-1",
                                  statusClass(
                                    person.status,
                                  ),
                                ].join(
                                  " ",
                                )}
                              >
                                {humanize(
                                  person.status,
                                )}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <EmptyState
                        icon={UserPlus}
                        title="No Growth Executives yet"
                        text="Use your dedicated recruitment link to start building your team."
                        href="#recruitment"
                        action="Start Recruiting"
                      />
                    )
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <InfoBlock
                        label="Team Leader"
                        value={
                          data.team?.leaderName ||
                          "Not assigned"
                        }
                        detail={
                          data.team?.leaderEmail ||
                          "Team information is being prepared."
                        }
                      />

                      <InfoBlock
                        label="Team"
                        value={
                          data.team?.name ||
                          "Assigned Team"
                        }
                        detail={
                          data.team
                            ? `${data.team.memberCount} member${
                                data.team.memberCount ===
                                1
                                  ? ""
                                  : "s"
                              } in this team`
                            : "Team information is being prepared."
                        }
                      />
                    </div>
                  )}

                  {data.team &&
                    data.team.members.length >
                      0 && (
                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          Team snapshot
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {data.team.members
                            .slice(0, 9)
                            .map((person) => (
                              <div
                                key={person.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-600 shadow-sm ring-1 ring-slate-200">
                                    {person.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {person.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                      {humanize(
                                        person.memberType,
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={[
                                    "mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-bold ring-1",
                                    statusClass(
                                      person.status,
                                    ),
                                  ].join(
                                    " ",
                                  )}
                                >
                                  {humanize(
                                    person.status,
                                  )}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>

            <section
              id="leads"
              className="scroll-mt-24"
            >
              <div className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      CRM Leads
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Lead workspace
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Prospects attributed to your TGN activity.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        value={search}
                        onChange={(event) =>
                          setSearch(
                            event.target.value,
                          )
                        }
                        placeholder="Search leads..."
                        className="h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setLeadOpen(true)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lead
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Lead
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Program
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Status
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Last Contact
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {filteredLeads.map(
                            (lead) => (
                              <tr
                                key={lead.id}
                                className="transition hover:bg-slate-50"
                              >
                                <td className="px-4 py-4">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {lead.fullName}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {lead.email}
                                  </p>
                                </td>

                                <td className="px-4 py-4">
                                  <span className="text-sm text-slate-700">
                                    {lead.interestedProgram ||
                                      "Not specified"}
                                  </span>
                                </td>

                                <td className="px-4 py-4">
                                  <span
                                    className={[
                                      "inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ring-1",
                                      statusClass(
                                        lead.status,
                                      ),
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    {humanize(
                                      lead.status,
                                    )}
                                  </span>
                                </td>

                                <td className="px-4 py-4 text-xs text-slate-500">
                                  {formatDate(
                                    lead.lastContactedAt,
                                  )}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title={
                        search
                          ? "No matching leads"
                          : "No CRM leads yet"
                      }
                      text={
                        search
                          ? "Try a different name, email, phone or status."
                          : "Add your first prospect and it will be attributed to your TGN member account."
                      }
                      href="#overview"
                      action={
                        search
                          ? "Back to Overview"
                          : "Add Lead"
                      }
                    />
                  )}
                </div>
              </div>
            </section>

            <section
              id="performance"
              className="scroll-mt-24"
            >
              <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                      Performance
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Growth Network performance
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Live totals from your existing TGN and CRM records.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Attributed leads"
                    value={String(
                      data.metrics.leads,
                    )}
                    icon={Target}
                    tone="blue"
                  />

                  <StatCard
                    label="Admissions"
                    value={String(
                      data.metrics.admissions,
                    )}
                    icon={ClipboardCheck}
                    tone="indigo"
                  />

                  <StatCard
                    label="Eligible + approved"
                    value={formatAmount(
                      data.commissions.eligible +
                        data.commissions.approved,
                    )}
                    icon={IndianRupee}
                    tone="emerald"
                    compact
                  />

                  <StatCard
                    label="Paid"
                    value={formatAmount(
                      data.commissions.paid,
                    )}
                    icon={IndianRupee}
                    tone="violet"
                    compact
                  />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <PipelinePanel
                    title="Lead pipeline"
                    data={data.pipelines.leads}
                  />

                  <PipelinePanel
                    title="Admission pipeline"
                    data={data.pipelines.admissions}
                  />
                </div>

                {data.recentAdmissions.length > 0 && (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Recent admissions
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {data.recentAdmissions
                        .slice(0, 6)
                        .map((admission) => (
                          <div
                            key={admission.id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {admission.studentName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {admission.admissionNo} ·{" "}
                                {admission.program}
                              </p>
                            </div>

                            <span
                              className={[
                                "w-fit rounded-full px-3 py-1.5 text-[11px] font-bold ring-1",
                                statusClass(
                                  admission.status,
                                ),
                              ].join(
                                " ",
                              )}
                            >
                              {humanize(
                                admission.status,
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section
              id="onboarding"
              className="scroll-mt-24"
            >
              <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                      Member lifecycle
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Your Growth Network journey
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Your account moves through the established TechSkillHub Growth Network lifecycle.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 md:grid-cols-5">
                  {[
                    "Application",
                    "Review",
                    "Onboarding",
                    "Orientation",
                    "Active",
                  ].map((step, index) => {
                    const stepNumber = index + 1;
                    const reached =
                      stepNumber <= currentLifecycle;

                    const current =
                      stepNumber === currentLifecycle;

                    return (
                      <div
                        key={step}
                        className={[
                          "rounded-2xl border p-4",
                          current
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          {reached ? (
                            <CheckCircle2
                              className={[
                                "h-5 w-5",
                                current
                                  ? "text-blue-600"
                                  : "text-emerald-500",
                              ].join(" ")}
                            />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300" />
                          )}

                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            0{stepNumber}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-bold text-slate-900">
                          {step}
                        </p>

                        {current && (
                          <p className="mt-1 text-[11px] font-semibold text-blue-600">
                            Current stage
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                    Current stage
                  </p>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-bold text-slate-950">
                      {humanize(data.status)}
                    </p>

                    <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                      {isTeamLeader
                        ? "Team Leader pathway"
                        : "Growth Executive pathway"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="account"
              className="scroll-mt-24"
            >
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Account
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Your TechSkillHub profile
                  </h2>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <InfoBlock
                      label="Name"
                      value={data.name}
                    />

                    <InfoBlock
                      label="Email"
                      value={data.email}
                    />

                    <InfoBlock
                      label="Role"
                      value={
                        isTeamLeader
                          ? "Team Leader"
                          : "Growth Executive"
                      }
                    />

                    <InfoBlock
                      label="Member status"
                      value={humanize(data.status)}
                    />

                    <InfoBlock
                      label="Team"
                      value={
                        data.team?.name ||
                        "Not assigned"
                      }
                    />

                    <InfoBlock
                      label="Referral code"
                      value={
                        data.referralCode ||
                        "Not assigned"
                      }
                    />
                  </div>
                </div>

                <div className="rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Growth Network
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Build opportunities with TechSkillHub.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Participate in approved outreach, networking, marketing and student acquisition activities while developing practical professional experience.
                  </p>

                  <Link
                    href="/growth-network/join"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50"
                  >
                    View Growth Network Guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {leadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  TGN CRM
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Add a new lead
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  This lead will be automatically attributed to your TGN account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!leadSaving) {
                    setLeadOpen(false);
                    setLeadError("");
                    setLeadSuccess(false);
                  }
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {leadSuccess ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-4 text-lg font-bold">
                  Lead added successfully
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  The CRM record is now connected to your TGN account.
                </p>
              </div>
            ) : (
              <form
                onSubmit={submitLead}
                className="space-y-5 p-6"
              >
                {leadError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {leadError}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    required
                  >
                    <input
                      name="fullName"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Email"
                    required
                  >
                    <input
                      type="email"
                      name="email"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Phone"
                    required
                  >
                    <input
                      name="phone"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Interested program"
                    required
                  >
                    <input
                      name="interestedProgram"
                      required
                      placeholder="Example: CodeForge"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Current status">
                    <input
                      name="currentStatus"
                      defaultValue="New lead"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Preferred contact">
                    <select
                      name="preferredContact"
                      defaultValue="WHATSAPP"
                      className={inputClass}
             >
                      <option value="WHATSAPP">
                        WhatsApp
                      </option>
                      <option value="PHONE">
                        Phone
                      </option>
                      <option value="EMAIL">
                        Email
                      </option>
                    </select>
                  </Field>
                </div>

                <Field label="Career goal">
                  <input
                    name="careerGoal"
                    className={inputClass}
                  />
                </Field>

                <Field label="Notes">
                  <textarea
                    name="notes"
                    rows={4}
                    className={textareaClass}
                    placeholder="Useful context about the prospect..."
                  />
                </Field>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!leadSaving) {
                        setLeadOpen(false);
                        setLeadError("");
                      }
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={leadSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {leadSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        Add Lead
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  compact = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  tone:
    | "blue"
    | "indigo"
    | "emerald"
    | "violet"
    | "amber";
  compact?: boolean;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 font-bold tracking-tight text-slate-950",
          compact ? "text-base" : "text-2xl",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function PipelineCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function PipelinePanel({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>

      {entries.length > 0 ? (
        <div className="mt-4 space-y-3">
          {entries.slice(0, 6).map(
            ([status, value]) => (
              <div
                key={status}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm font-medium text-slate-700">
                  {humanize(status)}
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 ring-1 ring-slate-200">
                  {value}
                </span>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          No activity recorded yet.
        </p>
      )}
    </div>
  );
}

function InfoBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-900">
        {value}
      </p>

      {detail && (
        <p className="mt-1 break-words text-xs text-slate-500">
          {detail}
        </p>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  href,
  action,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm ring-1 ring-slate-200">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>

      <a
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const textareaClass =
  "min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

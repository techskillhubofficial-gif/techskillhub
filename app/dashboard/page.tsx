"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Plus,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LeadTable, {
  type LeadTableItem,
  type LeadStatus,
} from "@/components/dashboard/LeadTable";

interface DashboardStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  enrolled: number;
  closed: number;
}

interface DashboardPeriod {
  currentMonth: {
    newLeads: number;
    enrollments: number;
  };
  previousMonth: {
    newLeads: number;
    enrollments: number;
  };
}

interface DashboardChanges {
  newLeads: number;
  enrollments: number;
}

interface GrowthPoint {
  name: string;
  leads: number;
  admissions: number;
}

interface DashboardActivity {
  id: string;
  initials: string;
  name: string;
  title: string;
  description?: string | null;
  type: string;
  activityType?: string;
  time: string;
  createdAt: string;
}

interface FollowUpSummary {
  pending: number;
  dueToday: number;
  overdue: number;
  qualifiedOpportunities: number;
}

interface DashboardLead extends LeadTableItem {
  updatedAt?: string;
}

interface DashboardResponse {
  success: boolean;
  generatedAt: string;
  stats: DashboardStats;
  period: DashboardPeriod;
  changes: DashboardChanges;
  growth: GrowthPoint[];
  activities: DashboardActivity[];
  todayFollowUps: Array<{
    id: string;
    scheduledAt: string;
    note?: string | null;
    status: string;
    lead: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      interestedProgram: string;
      status: LeadStatus;
    };
  }>;
  followUpSummary: FollowUpSummary;
  recentLeads: DashboardLead[];
}

const EMPTY_STATS: DashboardStats = {
  total: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
  enrolled: 0,
  closed: 0,
};

const EMPTY_PERIOD: DashboardPeriod = {
  currentMonth: {
    newLeads: 0,
    enrollments: 0,
  },
  previousMonth: {
    newLeads: 0,
    enrollments: 0,
  },
};

const EMPTY_CHANGES: DashboardChanges = {
  newLeads: 0,
  enrollments: 0,
};

const EMPTY_FOLLOW_UPS: FollowUpSummary = {
  pending: 0,
  dueToday: 0,
  overdue: 0,
  qualifiedOpportunities: 0,
};

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const rounded = Math.round(value);

  if (rounded > 0) {
    return `+${rounded}%`;
  }

  return `${rounded}%`;
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatFollowUpDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as DashboardResponse;

      if (!response.ok || !result.success) {
        throw new Error("Unable to load dashboard data.");
      }

      setData(result);
    } catch (fetchError) {
      console.error("Dashboard fetch error:", fetchError);

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = data?.stats ?? EMPTY_STATS;
  const period = data?.period ?? EMPTY_PERIOD;
  const changes = data?.changes ?? EMPTY_CHANGES;
  const growth = data?.growth ?? [];
  const activities = data?.activities ?? [];
  const followUpSummary =
    data?.followUpSummary ?? EMPTY_FOLLOW_UPS;
  const todayFollowUps = data?.todayFollowUps ?? [];
  const recentLeads = data?.recentLeads ?? [];

  const currentMonthLeads = period.currentMonth.newLeads;
  const currentMonthEnrollments = period.currentMonth.enrollments;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
            CRM Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[28px]">
            {getGreeting()}, Manvendra
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what is happening across your TechSkillHub CRM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={[
                "h-3.5 w-3.5",
                refreshing ? "animate-spin" : "",
              ].join(" ")}
            />
            Refresh
          </button>

          <a
            href="/dashboard/leads"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add lead
          </a>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CircleAlert className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs font-medium text-red-700">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="shrink-0 text-xs font-semibold text-red-700 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}

      <StatsGrid
        stats={stats}
        currentMonthLeads={currentMonthLeads}
        currentMonthEnrollments={currentMonthEnrollments}
        leadChange={changes.newLeads}
        enrollmentChange={changes.enrollments}
        loading={loading}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <AnalyticsChart data={growth} loading={loading} />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
        >
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">
                  TechSkill AI
                </p>

                <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-950">
                  CRM opportunity
                </h2>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {followUpSummary.qualifiedOpportunities} qualified{" "}
                        {followUpSummary.qualifiedOpportunities === 1
                          ? "opportunity"
                          : "opportunities"}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Qualified leads currently need attention from the
                        sales team.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricMini
                    label="Pending follow-ups"
                    value={followUpSummary.pending}
                  />

                  <MetricMini
                    label="Overdue"
                    value={followUpSummary.overdue}
                    danger={followUpSummary.overdue > 0}
                  />

                  <MetricMini
                    label="Due today"
                    value={followUpSummary.dueToday}
                  />

                  <MetricMini
                    label="New this month"
                    value={currentMonthLeads}
                  />
                </div>

                <a
                  href="/dashboard/leads"
                  className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
                >
                  Open CRM workspace
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </>
            )}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <RecentActivity activities={activities} loading={loading} />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Today
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-950">
                Follow-ups
              </h2>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
              <CalendarClock className="h-4 w-4 text-slate-600" />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[62px] animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : todayFollowUps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />

                <p className="mt-2 text-xs font-semibold text-slate-700">
                  No follow-ups due today
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Your CRM is clear for today.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayFollowUps.slice(0, 5).map((followUp) => (
                  <a
                    key={followUp.id}
                    href="/dashboard/leads"
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/40"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600">
                      {getInitials(followUp.lead.fullName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {followUp.lead.fullName}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {followUp.note || followUp.lead.interestedProgram}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold text-slate-600">
                        {formatFollowUpDate(followUp.scheduledAt)}
                      </p>

                      <Clock3 className="ml-auto mt-1 h-3 w-3 text-slate-300" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {todayFollowUps.length > 5 ? (
              <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
                +{todayFollowUps.length - 5} more follow-ups
              </p>
            ) : null}
          </div>
        </motion.section>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              CRM · Recent
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">
              Recent consultation leads
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              The latest leads entering your sales pipeline.
            </p>
          </div>

          <a
            href="/dashboard/leads"
            className="hidden items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 sm:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <LeadTable
          leads={recentLeads}
          loading={loading}
          onView={() => {
            window.location.href = "/dashboard/leads";
          }}
          onEdit={() => {
            window.location.href = "/dashboard/leads";
          }}
          onDelete={() => {
            window.location.href = "/dashboard/leads";
          }}
          onStatusChange={async (lead, status) => {
            try {
              const response = await fetch("/api/leads", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: lead.id,
                  status,
                }),
              });

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error(
                  result.message || "Unable to update lead status.",
                );
              }

              await fetchDashboard(true);
            } catch (statusError) {
              console.error("Dashboard status update error:", statusError);

              setError(
                statusError instanceof Error
                  ? statusError.message
                  : "Unable to update lead status.",
              );
            }
          }}
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <SystemStatus
          icon={CheckCircle2}
          label="CRM database"
          value="Connected"
        />

        <SystemStatus
          icon={Users}
          label="Live leads"
          value={`${stats.total} total`}
        />

        <SystemStatus
          icon={CalendarClock}
          label="Follow-up queue"
          value={`${followUpSummary.pending} pending`}
        />
      </div>
    </div>
  );
}

function MetricMini({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-[10px] font-medium leading-4 text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-lg font-bold tracking-[-0.03em]",
          danger ? "text-red-600" : "text-slate-900",
        ].join(" ")}
      >
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function SystemStatus({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_6px_22px_rgba(15,23,42,0.025)]">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
        <Icon className="h-4 w-4 text-emerald-600" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "TS";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
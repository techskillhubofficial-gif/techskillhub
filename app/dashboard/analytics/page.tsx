"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

type DashboardData = {
  success: boolean;
  stats: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    enrolled: number;
    closed: number;
  };
  admissionOperations: {
    applicationsPending: number;
    admissionsPending: number;
    paymentVerification: number;
    documentsPending: number;
  };
  period: {
    currentMonth: {
      newLeads: number;
      enrollments: number;
    };
    previousMonth: {
      newLeads: number;
      enrollments: number;
    };
    changes: {
      newLeads: number;
      enrollments: number;
    };
  };
  growth: Array<{
    name: string;
    leads: number;
    admissions: number;
  }>;
  followUpSummary: {
    pending: number;
    dueToday: number;
    overdue: number;
    qualifiedOpportunities: number;
  };
};

const number = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: typeof Users;
  description: string;
}) {
  const positive = typeof change === "number" && change >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-900">
          <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </div>

        {typeof change === "number" && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              positive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {typeof value === "number" ? number(value) : value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setError("");
      setRefreshing(true);

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const result = (await response.json()) as DashboardData & {
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load analytics.");
      }

      setData(result);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxLeads = useMemo(
    () =>
      Math.max(
        ...(data?.growth.map((item) => item.leads) ?? [1]),
        1,
      ),
    [data],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="font-semibold text-red-800 dark:text-red-300">
          Analytics could not be loaded
        </h2>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          {error || "No analytics data is available."}
        </p>
        <button
          type="button"
          onClick={loadAnalytics}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Try again
        </button>
      </div>
    );
  }

  const conversion =
    data.stats.total > 0
      ? Math.round((data.stats.enrolled / data.stats.total) * 1000) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <BarChart3 className="h-4 w-4" />
            Business Intelligence
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Understand leads, admissions, conversion and follow-up performance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Leads"
          value={data.stats.total}
          icon={Users}
          description="All leads in your accessible pipeline"
        />
        <MetricCard
          title="New Leads"
          value={data.period.currentMonth.newLeads}
          change={data.period.changes.newLeads}
          icon={TrendingUp}
          description="Created this month"
        />
        <MetricCard
          title="Enrollments"
          value={data.period.currentMonth.enrollments}
          change={data.period.changes.enrollments}
          icon={CheckCircle2}
          description="Current month"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversion}%`}
          icon={Target}
          description="Leads converted to enrollment"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Lead & Admission Growth
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Last {data.growth.length} months
              </p>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-8 flex h-64 items-end gap-2 overflow-x-auto">
            {data.growth.map((item) => {
              const height = Math.max(
                6,
                Math.round((item.leads / maxLeads) * 100),
              );

              return (
                <div
                  key={item.name}
                  className="flex min-w-[55px] flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {item.leads}
                  </span>

                  <div className="flex h-40 w-full max-w-12 items-end rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
                    <div
                      className="w-full rounded-md bg-slate-800 transition-all dark:bg-slate-200"
                      style={{ height: `${height}%` }}
                      title={`${item.leads} leads`}
                    />
                  </div>

                  <span className="text-[10px] font-medium text-slate-500">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Lead Pipeline
          </h2>

          <div className="mt-5 space-y-4">
            {[
              ["New", data.stats.new],
              ["Contacted", data.stats.contacted],
              ["Qualified", data.stats.qualified],
              ["Enrolled", data.stats.enrolled],
              ["Closed", data.stats.closed],
            ].map(([label, value]) => {
              const numericValue = Number(value);
              const percentage =
                data.stats.total > 0
                  ? (numericValue / data.stats.total) * 100
                  : 0;

              return (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {number(numericValue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                    <div
                      className="h-full rounded-full bg-slate-800 dark:bg-slate-200"
                      style={{
                        width: `${Math.min(100, percentage)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Follow-up Intelligence
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Pending", data.followUpSummary.pending],
              ["Due Today", data.followUpSummary.dueToday],
              ["Overdue", data.followUpSummary.overdue],
              ["Qualified", data.followUpSummary.qualifiedOpportunities],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {number(Number(value))}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Admission Operations
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Applications Pending", data.admissionOperations.applicationsPending],
              ["Admissions Pending", data.admissionOperations.admissionsPending],
              ["Payment Verification", data.admissionOperations.paymentVerification],
              ["Documents Pending", data.admissionOperations.documentsPending],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800"
              >
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {number(Number(value))}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Performance Snapshot
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500">Current Month Leads</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {number(data.period.currentMonth.newLeads)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Current Month Enrollments</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {number(data.period.currentMonth.enrollments)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Overall Pipeline Conversion</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {conversion}%
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  IndianRupee,
  Network,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface OverviewData {
  members: {
    total: number;
    active: number;
    teamLeaders: number;
    executives: number;
  };
  teams: {
    total: number;
    active: number;
  };
  applications: {
    total: number;
    pending: number;
  };
  leads: {
    total: number;
  };
  commissions: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    amounts: Record<string, number>;
  };
}

interface OverviewResponse {
  success: boolean;
  data?: OverviewData;
  message?: string;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-4 w-4 text-slate-300" />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

export default function GrowthNetworkPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tgn/overview", {
        cache: "no-store",
      });

      const result =
        (await response.json()) as OverviewResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message ?? "Unable to load Growth Network.",
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Growth Network.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const navigation = [
    {
      title: "Applications",
      description: "Review and onboard TGN applicants.",
      href: "/dashboard/growth-network/applications",
      icon: FileText,
    },
    {
      title: "Members",
      description: "Manage team leaders and executives.",
      href: "/dashboard/growth-network/members",
      icon: Users,
    },
    {
      title: "Teams",
      description: "View network teams and hierarchy.",
      href: "/dashboard/growth-network/teams",
      icon: Network,
    },
    {
      title: "Leads",
      description: "View leads generated through TGN.",
      href: "/dashboard/growth-network/leads",
      icon: UserCheck,
    },
    {
      title: "Commissions",
      description: "Track eligibility, approvals and payouts.",
      href: "/dashboard/growth-network/commissions",
      icon: IndianRupee,
    },
    {
      title: "Reports",
      description: "Review network performance and outcomes.",
      href: "/dashboard/growth-network/reports",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-full">
      <DashboardHeader
        title="Growth Network"
        description="Manage TGN inside the TechSkillHub CRM."
      />

      <main className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              TGN • CRM Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Growth Network Overview
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Track applications, members, teams, CRM leads and
              commission activity from one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Members"
            value={loading ? "—" : data?.members.total ?? 0}
            detail={
              loading
                ? "Loading..."
                : `${data?.members.active ?? 0} currently active`
            }
          />
          <StatCard
            icon={Network}
            label="Active Teams"
            value={loading ? "—" : data?.teams.active ?? 0}
            detail={
              loading
                ? "Loading..."
                : `${data?.teams.total ?? 0} total teams`
            }
          />
          <StatCard
            icon={UserCheck}
            label="TGN Leads"
            value={loading ? "—" : data?.leads.total ?? 0}
            detail="Existing CRM leads attributed to TGN"
          />
          <StatCard
            icon={FileText}
            label="Pending Applications"
            value={loading ? "—" : data?.applications.pending ?? 0}
            detail={
              loading
                ? "Loading..."
                : `${data?.applications.total ?? 0} total applications`
            }
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Network Structure
                </h2>
                <p className="text-xs text-slate-500">
                  Current TGN hierarchy
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Team Leaders</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {loading ? "—" : data?.members.teamLeaders ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Executives</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {loading ? "—" : data?.members.executives ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Commission Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Real commission records from the TGN database
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Pending</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {loading ? "—" : data?.commissions.pending ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Approved</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {loading ? "—" : data?.commissions.approved ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Paid</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {loading ? "—" : data?.commissions.paid ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Paid commission value</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {loading
                  ? "—"
                  : money(data?.commissions.amounts.PAID ?? 0)}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              Network Workspace
            </h2>
            <p className="text-sm text-slate-500">
              Continue working inside the existing CRM.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

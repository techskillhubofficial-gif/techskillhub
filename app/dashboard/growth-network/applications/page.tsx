"use client";

import {
  CheckCircle2,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

type Application = {
  id: string;
  applicationNo: string;
  memberType: "TEAM_LEADER" | "EXECUTIVE";
  status: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  sourceMember: {
    id: string;
    memberType: string;
    status: string;
    referralCode: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  } | null;
  createdAt: string;
};

type ResponseData = {
  success: boolean;
  applications?: Application[];
  counts?: Record<string, number>;
  message?: string;
};

const statusLabel = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const statusClass = (status: string) => {
  if (["APPROVED", "ACTIVE", "ONBOARDING"].includes(status)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (["REJECTED", "SUSPENDED"].includes(status)) {
    return "bg-red-50 text-red-700";
  }

  if (["UNDER_REVIEW", "INTERVIEW", "SHORTLISTED"].includes(status)) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-blue-50 text-blue-700";
};

export default function GrowthNetworkApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/tgn/applications${params.toString() ? `?${params}` : ""}`,
        { cache: "no-store" },
      );

      const result = (await response.json()) as ResponseData;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Unable to load TGN applications.",
        );
      }

      setApplications(result.applications ?? []);
      setCounts(result.counts ?? {});
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load TGN applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [load]);

  const total = Object.values(counts).reduce(
    (sum, value) => sum + value,
    0,
  );

  return (
    <div>
      <DashboardHeader
        title="TGN Applications"
        description="Review and manage Growth Network applications."
      />

      <main className="space-y-6 p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileText className="h-5 w-5 text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-950">
              {loading ? "—" : total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            <p className="mt-4 text-sm text-slate-500">Under Review</p>
            <p className="text-2xl font-semibold text-slate-950">
              {loading ? "—" : counts.UNDER_REVIEW ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Approved</p>
            <p className="text-2xl font-semibold text-slate-950">
              {loading ? "—" : counts.APPROVED ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="mt-4 text-sm text-slate-500">Rejected</p>
            <p className="text-2xl font-semibold text-slate-950">
              {loading ? "—" : counts.REJECTED ?? 0}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">
                Applications
              </h2>
              <p className="text-sm text-slate-500">
                Real TGN applications from the database.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicant..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                {Object.keys(counts).map((item) => (
                  <option key={item} value={item}>
                    {statusLabel(item)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-slate-600 hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Referral</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Applied</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >
                      <Users className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No applications found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Applications will appear here when submitted.
                      </p>
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {application.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {application.email} · {application.phone}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {application.applicationNo}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {application.memberType === "TEAM_LEADER"
                          ? "Team Leader"
                          : "Executive"}
                      </td>

                      <td className="px-5 py-4">
                        {application.sourceMember ? (
                          <>
                            <p className="text-sm font-medium text-slate-800">
                              {application.sourceMember.user.name ??
                                application.sourceMember.user.email}
                            </p>
                            <p className="text-xs text-blue-600">
                              {application.sourceMember.referralCode ??
                                "No code"}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Direct
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(application.status)}`}
                        >
                          {statusLabel(application.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          application.createdAt,
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <a
                          href={`/dashboard/growth-network/applications/${application.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

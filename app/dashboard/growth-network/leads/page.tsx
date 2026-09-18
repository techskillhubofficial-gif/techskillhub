"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  currentStatus: string;
  interestedProgram: string;
  source: string | null;
  createdAt: string;
  tgnSourceMember: {
    id: string;
    memberType: string;
    referralCode: string | null;
    status: string;
    user: {
      name: string | null;
      email: string;
    };
    team: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
  tgnOwner: {
    id: string;
    memberType: string;
    referralCode: string | null;
    user: {
      name: string | null;
      email: string;
    };
    team: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
  admissions: {
    id: string;
    admissionNo: string;
    status: string;
    totalFee: string | number;
    balanceFee: string | number;
    createdAt: string;
  }[];
  _count: {
    admissions: number;
    applications: number;
    counsellingSessions: number;
    registrationPayments: number;
  };
};

const statusOptions = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ENROLLED",
  "CLOSED",
];

export default function GrowthNetworkLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const query = params.toString();

      const response = await fetch(
        `/api/tgn/leads${query ? `?${query}` : ""}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load TGN leads.",
        );
      }

      setLeads(data.leads ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load TGN leads.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLeads();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, status]);

  const enrolledCount = leads.filter(
    (lead) => lead.status === "ENROLLED",
  ).length;

  const admissionCount = leads.filter(
    (lead) => lead.admissions.length > 0,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="Growth Network Leads"
        description="CRM leads attributed to the TechSkillHub Growth Network."
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="TGN Leads"
            value={leads.length}
          />

          <Stat
            label="Enrolled"
            value={enrolledCount}
          />

          <Stat
            label="With Admission"
            value={admissionCount}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search TGN leads..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative md:w-56">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>

                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => void loadLeads()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : leads.length === 0 ? (
            <div className="py-24 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No TGN leads found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Leads created through valid TGN referrals will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leads.map((lead) => {
                const source =
                  lead.tgnSourceMember ??
                  lead.tgnOwner;

                return (
                  <div
                    key={lead.id}
                    className="p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {lead.fullName}
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {lead.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {lead.interestedProgram}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                          <span>{lead.email}</span>
                          <span>{lead.phone}</span>
                          <span>
                            Created{" "}
                            {new Date(
                              lead.createdAt,
                            ).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          TGN Source
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {source?.user.name ||
                            source?.user.email ||
                            "Not recorded"}
                        </p>

                        {source?.referralCode && (
                          <p className="mt-1 text-xs text-blue-600">
                            {source.referralCode}
                          </p>
                        )}

                        {source?.team && (
                          <p className="mt-1 text-xs text-slate-500">
                            {source.team.name}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            Admissions
                          </p>

                          <p className="font-semibold text-slate-900">
                            {lead._count.admissions}
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                        >
                          CRM
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <Users className="h-5 w-5 text-blue-600" />
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

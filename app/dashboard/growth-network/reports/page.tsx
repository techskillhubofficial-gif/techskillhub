"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  RefreshCw,
  Users,
  UserPlus,
  GraduationCap,
  Wallet,
} from "lucide-react";

interface Report {
  overview: {
    totalMembers: number;
    activeMembers: number;
    teamLeaders: number;
    executives: number;
    teams: number;
    applications: number;
    pendingApplications: number;
    tgnLeads: number;
    admissions: number;
    approvedAdmissions: number;
    enrolledAdmissions: number;
    verifiedRevenue: number;
  };
  revenue: {
    total: number;
    REGISTRATION_FEE: number;
    COURSE_FEE: number;
    INSTALLMENT: number;
    EMI: number;
    OTHER: number;
  };
  commissions: {
    total: number;
    PENDING: number;
    ELIGIBLE: number;
    APPROVED: number;
    PAID: number;
    REJECTED: number;
  };
  memberReports: Array<{
    id: string;
    name: string;
    email: string;
    memberType: string;
    status: string;
    referralCode: string | null;
    team: { name: string; code: string } | null;
    leads: number;
    admissions: number;
    enrolled: number;
    verifiedRevenue: number;
    commissionPaid: number;
    commissionApproved: number;
  }>;
  recentAdmissions: Array<{
    id: string;
    admissionNo: string;
    studentName: string;
    status: string;
    totalFee: number;
    approvedAt: string | null;
  }>;
}

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function TgnReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tgn/reports", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load report");
      }

      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50/60">
        <div className="mx-auto max-w-[1500px] px-6 py-12 text-center text-sm text-slate-400 lg:px-10">
          Loading TGN reports...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-full bg-slate-50/60">
        <div className="mx-auto max-w-[1500px] px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || "Report unavailable"}
          </div>
        </div>
      </div>
    );
  }

  const o = report.overview;

  return (
    <div className="min-h-full bg-slate-50/60">
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
              <BarChart3 size={14} />
              Growth Network · Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              TGN Reports
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Live acquisition, admission, revenue and commission reporting.
            </p>
          </div>

          <button
            onClick={() => void load()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              { label: "TGN Leads", value: o.tgnLeads, icon: UserPlus },
              { label: "Admissions", value: o.admissions, icon: GraduationCap },
              { label: "Enrolled", value: o.enrolledAdmissions, icon: Users },
              {
                label: "Verified Revenue",
                value: money(o.verifiedRevenue),
                icon: Wallet,
              },
            ] as const
          ).map(({ label, value, icon: IconComponent }) => {

            return (
              <div
                key={String(label)}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </span>
                  <IconComponent size={18} className="text-blue-500" />
                </div>

                <div className="mt-3 text-2xl font-bold text-slate-950">
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Users size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Network overview
                </h2>
                <p className="text-xs text-slate-400">
                  Current TGN structure
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                ["Total members", o.totalMembers],
                ["Active members", o.activeMembers],
                ["Team Leaders", o.teamLeaders],
                ["Growth Executives", o.executives],
                ["Teams", o.teams],
                ["Applications", o.applications],
                ["Pending applications", o.pendingApplications],
                ["Approved admissions", o.approvedAdmissions],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="mt-1 text-xl font-bold text-slate-950">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <CircleDollarSign size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Revenue & commissions
                </h2>
                <p className="text-xs text-slate-400">
                  Verified financial activity only
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Registration fees", report.revenue.REGISTRATION_FEE],
                ["Course fees", report.revenue.COURSE_FEE],
                ["Installments", report.revenue.INSTALLMENT],
                ["EMI", report.revenue.EMI],
                ["Other", report.revenue.OTHER],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-900">
                    {money(Number(value))}
                  </span>
                </div>
              ))}             <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-slate-900">
                  Total verified revenue
                </span>
                <span className="text-xl font-bold text-slate-950">
                  {money(report.revenue.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Pending", report.commissions.PENDING],
                ["Eligible", report.commissions.ELIGIBLE],
                ["Approved", report.commissions.APPROVED],
                ["Paid", report.commissions.PAID],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="mt-1 font-bold text-slate-950">
                    {money(Number(value))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">
              Member performance
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Attribution and financial performance from live CRM data
            </p>
          </div>

          {report.memberReports.length === 0 ? (
            <div className="p-14 text-center text-sm text-slate-400">
              No TGN members yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Team</th>
                    <th className="px-4 py-4">Leads</th>
                    <th className="px-4 py-4">Admissions</th>
                    <th className="px-4 py-4">Enrolled</th>
                    <th className="px-4 py-4">Revenue</th>
                    <th className="px-4 py-4">Commission paid</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report.memberReports.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {member.email}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                        {member.memberType === "TEAM_LEADER"
                          ? "Team Leader"
                          : "Growth Executive"}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {member.team?.name || "—"}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {member.leads}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {member.admissions}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {member.enrolled}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {money(member.verifiedRevenue)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-emerald-600">
                        {money(member.commissionPaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">
              Recent TGN admissions
            </h2>
          </div>

          {report.recentAdmissions.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">
              No TGN-attributed admissions yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {report.recentAdmissions.map((admission) => (
                <div
                  key={admission.id}
                  className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {admission.studentName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {admission.admissionNo}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-slate-500">
                      {admission.status}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {money(admission.totalFee)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

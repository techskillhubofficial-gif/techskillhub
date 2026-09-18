"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleDollarSign,
  IndianRupee,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type Status =
  | "PENDING"
  | "ELIGIBLE"
  | "APPROVED"
  | "PAID"
  | "REJECTED";

interface Commission {
  id: string;
  amount: number;
  status: Status;
  eligibilityReason: string | null;
  createdAt: string;
  member: {
    id: string;
    memberType: string;
    referralCode: string | null;
    user: { name: string | null; email: string };
    team: { name: string; code: string } | null;
  };
  lead: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  admission: {
    id: string;
    admiadmissionNo: string;
    studentName: string;
    status: string;
    program: string;
    totalFee: number;
  } | null;
}

interface Member {
  id: string;
  memberType: string;
  status: string;
  user: { name: string | null; email: string };
  team: { name: string } | null;
}

interface Admission {
  id: string;
  admiadmissionNo: string;
  studentName: string;
  status: string;
  course: { id: string; title: string } | null;
  lead: {
    tgnSourceMemberId: string | null;
    tgnOwnerId: string | null;
  } | null;
  commissions: {
    id: string;
    memberId: string;
    status: string;
    amount: number;
  }[];
}

const statusLabel: Record<Status, string> = {
  PENDING: "Pending",
  ELIGIBLE: "Eligible",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

const statusClass: Record<Status, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ELIGIBLE: "border-blue-200 bg-blue-50 text-blue-700",
  APPROVED: "border-violet-200 bg-violet-50 text-violet-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CommissionsPage() {
  const [items, setItems] = useState<Commission[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [admissionId, setAdmissionId] = useState("");
  const [amount, setAmount] = useState("5000");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const q = new URLSearchParams();

      if (status !== "ALL") q.set("status", status);
      if (search.trim()) q.set("search", search.trim());

      const [cRes, aRes, mRes] = await Promise.all([
        fetch(`/api/tgn/commissions?${q}`, { cache: "no-store" }),
        fetch("/api/tgn/commissions?availableAdmissions=true", {
          cache: "no-store",
        }),
        fetch("/api/tgn/members?status=ACTIVE", {
          cache: "no-store",
        }),
      ]);

      const [c, a, m] = await Promise.all([
        cRes.json(),
        aRes.json(),
        mRes.json(),
      ]);

      if (!cRes.ok) throw new Error(c.error || "Failed to load commissions");

      setItems(c.commissions || []);
      setTotals(c.totals || {});
      setAdmissions(a.admissions || []);
      setMembers(m.members || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load commissions"
      );
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const availableAdmissions = admissions.filter((a) => {
    if (!memberId) return false;

    const attributed =
      a.lead?.tgnSourceMemberId === memberId ||
      a.lead?.tgnOwnerId === memberId;

    const existing = a.commissions.some(
      (c) => c.memberId === memberId && c.status !== "REJECTED"
    );

    return attributed && !existing;
  });

  async function runAction(id: string, action: string) {
    let reason: string | undefined;

    if (action === "REJECT") {
      reason = window.prompt("Enter rejection reason:")?.trim();

      if (!reason) return;
    }

    setBusy(id + action);
    setMessage("");

    try {
      const response = await fetch(`/api/tgn/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Action failed");

      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy("");
    }
  }

  async function createCommission() {
    if (!memberId || !admissionId) {
      setMessage("Select a member and admission.");
      return;
    }

    setBusy("create");
    setMessage("");

    try {
      const response = await fetch("/api/tgn/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          admissionId,
          amount: Number(amount),
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Could not create commission");

      setShowCreate(false);
      setMemberId("");
      setAdmissionId("");
      setAmount("5000");
      setNotes("");

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create commission"
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-full bg-slate-50/60">
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
              <CircleDollarSign size={14} />
              Growth Network · Finance
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              TGN Commissions
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Real commission lifecycle linked to CRM leads, admissions,
              payments and attendance.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
            >
              + Create commission
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total", "total"],
            ["Pending", "PENDING"],
            ["Eligible", "ELIGIBLE"],
            ["Approved", "APPROVED"],
            ["Paid", "PAID"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <IndianRupee size={18} className="text-blue-500" />
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-950">
                {money(totals[key] || 0)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-3.5 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search TGN member..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none lg:w-56"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-sm text-slate-400">
              Loading commissions...
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center">
              <CircleDollarSign
                size={42}
                className="mx-auto text-slate-200"
              />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No commissions found
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Commissions will be linked only to genuine TGN-attributed
                admissions.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-5 lg:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass[item.status]}`}
                        >
                          {statusLabel[item.status]}
                        </span>

                        <span className="text-xs text-slate-400">
                          {item.member.memberType === "TEAM_LEADER"
                            ? "Team Leader"
                            : "Growth Executive"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-950">
                        {item.member.user.name ||
                          item.member.user.email}
                      </h3>

                      <div className="mt-3 grid gap-4 md:grid-cols-3">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Lead
                          </span>

                          {item.lead ? (
                            <Link
                              href={`/dashboard/leads/${item.lead.id}`}
                              className="mt-1 block font-semibold text-blue-600 hover:underline"
                            >
                              {item.lead.fullName}
                            </Link>
                          ) : (
                            <span className="mt-1 block text-sm text-slate-500">
                              —
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Admission
                          </span>

                          <span className="mt-1 block font-semibold text-slate-800">
                            {item.admission?.admiadmissionNo || "—"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Eligibility
                          </span>

                          <span className="mt-1 block text-sm text-slate-500">
                            {item.eligibilityReason || "Not evaluated"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="xl:text-right">
                      <div className="text-2xl font-bold text-slate-950">
                        {money(item.amount)}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 xl:justify-end">
                        {(item.status === "PENDING" ||
                          item.status === "ELIGIBLE") && (
                          <button
                            disabled={busy === item.id + "CHECK_ELIGIBILITY"}
                            onClick={() =>
                              void runAction(
                                item.id,
                                "CHECK_ELIGIBILITY"
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Check eligibility
                          </button>
                        )}

                        {item.status === "ELIGIBLE" && (
                          <button
                            disabled={busy === item.id + "APPROVE"}
                            onClick={() =>
                              void runAction(item.id, "APPROVE")
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            <ShieldCheck
                              size={14}
                              className="mr-1 inline"
                            />
                            Approve
                          </button>
                        )}

                        {item.status === "APPROVED" && (
                          <button
                            disabled={busy === item.id + "MARK_PAID"}
                            onClick={() =>
                              void runAction(item.id, "MARK_PAID")
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            <CheckCircle2
                              size={14}
                              className="mr-1 inline"
                            />
                            Mark paid
                          </button>
                        )}

                        {!["PAID", "REJECTED"].includes(item.status) && (
                          <button
                            onClick={() =>
                              void runAction(item.id, "REJECT")
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                          >
                            <XCircle
                              size={14}
                              className="mr-1 inline"
                            />
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-950">
                Create commission
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a real TGN-attributed admission.
              </p>

              <div className="mt-6 space-y-4">
                <select
                  value={memberId}
                  onChange={(e) => {
                    setMemberId(e.target.value);
                    setAdmissionId("");
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="">Select TGN member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user.name || m.user.email} ·{" "}
                      {m.memberType === "TEAM_LEADER"
                        ? "Team Leader"
                        : "Growth Executive"}
                    </option>
                  ))}
                </select>

                <select
                  value={admissionId}
                  onChange={(e) => setAdmissionId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="">Select admission</option>
                  {availableAdmissions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.admiadmissionNo} · {a.studentName} ·{" "}
                      {a.course?.title || "Course"}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Commission amount"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  disabled={busy === "create"}
                  onClick={() => void createCommission()}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {busy === "create" ? "Creating..." : "Create commission"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

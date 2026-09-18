"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  type: string;
  mode: string;
  status: string;
  transactionId?: string | null;
  paymentDate: string;
  admission?: {
    admissionNo: string;
    studentName: string;
    program: string;
  } | null;
};

type PaymentResponse = {
  success: boolean;
  data?: Payment[];
  stats?: {
    total?: number;
    pending?: number;
    verified?: number;
    failed?: number;
    refunded?: number;
    totalAmount?: number;
    verifiedAmount?: number;
  };
  error?: string;
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const typeLabels: Record<string, string> = {
  REGISTRATION_FEE: "Registration Fee",
  COURSE_FEE: "Course Fee",
  INSTALLMENT: "Installment",
  EMI: "EMI",
  OTHER: "Other",
};

const modeLabels: Record<string, string> = {
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  RAZORPAY: "Razorpay",
  STRIPE: "Stripe",
  OTHER: "Other",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClass(status: string) {
  switch (status) {
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "FAILED":
      return "bg-red-50 text-red-700 border-red-200";
    case "REFUNDED":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentResponse["stats"]>({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async () => {
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

      const response = await fetch(
        `/api/payments${params.toString() ? `?${params}` : ""}`,
        {
          cache: "no-store",
        },
      );

      const result: PaymentResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load payments.");
      }

      setPayments(result.data || []);
      setStats(result.stats || {});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load payments.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(fetchPayments, 250);
    return () => window.clearTimeout(timer);
  }, [fetchPayments]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Finance</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track collections, verification and student payment history.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <IndianRupee className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Payments"
          value={stats?.total ?? 0}
          icon={<WalletCards className="h-5 w-5" />}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={<RefreshCw className="h-5 w-5" />}
        />
        <StatCard
          label="Verified Amount"
          value={stats?.verifiedAmount ?? 0}
          currency
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Amount"
          value={stats?.totalAmount ?? 0}
          currency
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, admission or transaction..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchPayments}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load payments</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <WalletCards className="h-5 w-5 text-slate-500" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No payments found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Payments will appear here when transactions are recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mode
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {payment.admission?.studentName || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {payment.admission?.admissionNo || "No admission"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {typeLabels[payment.type] || payment.type}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {modeLabels[payment.mode] || payment.mode}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {payment.transactionId || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(payment.status)}`}
                      >
                        {statusLabels[payment.status] || payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  currency = false,
  icon,
}: {
  label: string;
  value: number;
  currency?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {currency ? formatCurrency(value) : value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

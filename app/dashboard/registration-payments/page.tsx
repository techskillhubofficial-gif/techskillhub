"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

type RegistrationPayment = {
  id: string;
  registrationNo: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  amount: number;
  mode: string;
  transactionId?: string | null;
  status: string;
  proofUrl?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  submittedAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  lead?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    currentStatus?: string | null;
  } | null;
  course?: {
    id: string;
    title: string;
  } | null;
  application?: {
    id: string;
    applicationNo?: string | null;
  } | null;
};

type RegistrationPaymentResponse = {
  success: boolean;
  data?: RegistrationPayment[];
  error?: string;
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  FAILED: "Rejected",
};

const modeLabels: Record<string, string> = {
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status) {
    case "VERIFIED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default function RegistrationPaymentsPage() {
  const [payments, setPayments] = useState<RegistrationPayment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<RegistrationPayment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const fetchPayments = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status) {
          params.set("status", status);
        }

        const response = await fetch(
          `/api/registration-payments${
            params.toString() ? `?${params.toString()}` : ""
          }`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result: RegistrationPaymentResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Unable to load registration payments.",
          );
        }

        setPayments(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load registration payments.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPayments();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchPayments]);

  const stats = useMemo(() => {
    const pending = payments.filter(
      (payment) => payment.status === "PENDING",
    );

    const verified = payments.filter(
      (payment) => payment.status === "VERIFIED",
    );

    const rejected = payments.filter(
      (payment) => payment.status === "FAILED",
    );

    return {
      total: payments.length,
      pending: pending.length,
      verified: verified.length,
      rejected: rejected.length,
      pendingAmount: pending.reduce(
        (total, payment) => total + payment.amount,
        0,
      ),
      verifiedAmount: verified.reduce(
        (total, payment) => total + payment.amount,
        0,
      ),
    };
  }, [payments]);

  async function updatePayment(
    payment: RegistrationPayment,
    action: "VERIFY" | "REJECT",
  ) {
    try {
      setActionLoading(true);
      setActionError("");

      if (action === "REJECT" && !rejectReason.trim()) {
        setActionError("Please provide a rejection reason.");
        return;
      }

      const response = await fetch(
        `/api/registration-payments/${payment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            rejectionReason:
              action === "REJECT" ? rejectReason.trim() : undefined,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            `Unable to ${
              action === "VERIFY" ? "verify" : "reject"
            } payment.`,
        );
      }

      setSelectedPayment(null);
      setRejectReason("");
      await fetchPayments(true);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update payment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <ClipboardCheck className="h-4 w-4" />
            Registration
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Registration Payments
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Review ₹5,000 registration payments, inspect payment proof,
            and confirm or reject manual payment submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchPayments(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<WalletCards className="h-5 w-5" />}
        />

        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
        />

        <StatCard
          label="Verified"
          value={stats.verified}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="green"
        />

        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5" />}
          tone="red"
        />

        <StatCard
          label="Verified Value"
          value={stats.verifiedAmount}
          currency
          icon={<IndianRupee className="h-5 w-5" />}
          tone="blue"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, registration, email, phone or UTR..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="FAILED">Rejected</option>
          </select>
        </div>

        {error ? (
          <div className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load registration payments
              </p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ClipboardCheck className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No registration payments found
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Manual registration payment submissions will appear here
              when students reserve their seat and submit payment
              details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <TableHeading>Student</TableHeading>
                  <TableHeading>Registration</TableHeading>
                  <TableHeading>Course</TableHeading>
                  <TableHeading>Amount</TableHeading>
                  <TableHeading>Payment</TableHeading>
                  <TableHeading>Proof</TableHeading>
                  <TableHeading>Status</TableHeading>
                  <TableHeading>Submitted</TableHeading>
                  <TableHeading>Action</TableHeading>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {payment.studentName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {payment.studentEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {payment.registrationNo}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {payment.studentPhone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-[190px] text-sm font-medium text-slate-700">
                        {payment.course?.title || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Registration fee
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {modeLabels[payment.mode] || payment.mode}
                      </p>

                      <p className="mt-0.5 max-w-[150px] truncate text-xs text-slate-500">
                        {payment.transactionId || "No transaction ID"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {payment.proofUrl ? (
                        <button
                          type="button"
                          onClick={() => window.open(payment.proofUrl!, "_blank")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View proof
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Not uploaded
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          payment.status,
                        )}`}
                      >
                        {statusLabels[payment.status] || payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(payment.submittedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setActionError("");
                          setRejectReason("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Review
                        <ChevronRightIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayment && (
        <ReviewDrawer
          payment={selectedPayment}
          loading={actionLoading}
          error={actionError}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onClose={() => {
            if (!actionLoading) {
              setSelectedPayment(null);
              setActionError("");
              setRejectReason("");
            }
          }}
          onVerify={() => updatePayment(selectedPayment, "VERIFY")}
          onReject={() => updatePayment(selectedPayment, "REJECT")}
        />
      )}
    </section>
  );
}

function ReviewDrawer({
  payment,
  loading,
  error,
  rejectReason,
  onRejectReasonChange,
  onClose,
  onVerify,
  onReject,
}: {
  payment: RegistrationPayment;
  loading: boolean;
  error: string;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onClose: () => void;
  onVerify: () => void;
  onReject: () => void;
}) {
  const canVerify =
    payment.status === "PENDING" &&
    Boolean(payment.transactionId || payment.proofUrl);

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close payment review"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Payment Review
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {payment.registrationNo}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-[0_16px_35px_rgba(37,99,235,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-100">
                  Registration Payment
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {formatCurrency(payment.amount)}
                </p>
              </div>

              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                {statusLabels[payment.status] || payment.status}
              </span>
            </div>

            <p className="mt-4 text-xs text-blue-100">
              This payment reserves the registration/application step. It
              does not by itself approve admission or create enrollment.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <DetailSection title="Student">
              <DetailRow label="Name" value={payment.studentName} />
              <DetailRow label="Email" value={payment.studentEmail} />
              <DetailRow label="Phone" value={payment.studentPhone} />
            </DetailSection>

            <DetailSection title="Program">
              <DetailRow
                label="Course"
                value={payment.course?.title || "—"}
              />

              <DetailRow
                label="Registration No."
                value={payment.registrationNo}
              />

              <DetailRow
                label="Application"
                value={
                  payment.application?.applicationNo ||
                  "Not created yet"
                }
              />
            </DetailSection>

            <DetailSection title="Payment">
              <DetailRow
                label="Amount"
                value={formatCurrency(payment.amount)}
              />

              <DetailRow
                label="Mode"
                value={modeLabels[payment.mode] || payment.mode}
              />

              <DetailRow
                label="Transaction / UTR"
                value={payment.transactionId || "Not provided"}
              />

              <DetailRow
                label="Submitted"
                value={formatDate(payment.submittedAt)}
              />

              {payment.verifiedAt && (
                <DetailRow
                  label="Reviewed"
                  value={formatDate(payment.verifiedAt)}
                />
              )}
            </DetailSection>

            {payment.proofUrl && (
              <DetailSection title="Payment Proof">
                <button
                  type="button"
                  onClick={() =>
                    window.open(payment.proofUrl!, "_blank")
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Open uploaded proof
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Opens the stored payment document in a new tab.
                    </p>
                  </div>

                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </button>
              </DetailSection>
            )}

            {payment.notes && (
              <DetailSection title="Student Notes">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {payment.notes}
                </div>
              </DetailSection>
            )}

            {payment.rejectionReason && (
              <DetailSection title="Rejection Reason">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {payment.rejectionReason}
                </div>
              </DetailSection>
            )}

            {payment.status === "PENDING" && (
              <DetailSection title="Admin Decision">
                <div className="space-y-4">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rejection reason
                    </p>

                    <textarea
                      value={rejectReason}
                      onChange={(event) =>
                        onRejectReasonChange(event.target.value)
                      }
                      rows={4}
                      placeholder="Required only when rejecting the payment..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {!canVerify && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      Verification requires a transaction ID or uploaded
                      payment proof.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={onReject}
                      disabled={loading || !rejectReason.trim()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={onVerify}
                      disabled={loading || !canVerify}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Verify Payment
                    </button>
                  </div>
                </div>
              </DetailSection>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </h3>

      <div className="space-y-2">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-slate-100 bg-white px-4 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>

      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function StatCard({
  label,
  value,
  currency = false,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number;
  currency?: boolean;
  icon: React.ReactNode;
  tone?: "blue" | "amber" | "green" | "red";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {currency
          ? formatCurrency(value)
          : value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M7.5 5 12.5 10 7.5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

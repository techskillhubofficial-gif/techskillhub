"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  Copy,
  Clock3,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  LockKeyhole,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  type: string;
  mode: string;
  transactionId?: string | null;
  status: string;
  paymentDate: string;
  verifiedAt?: string | null;
  proofUrl?: string | null;
  notes?: string | null;
  receipt?: {
    receiptNumber: string;
    issuedAt: string;
  } | null;
};

type AdmissionDocument = {
  id: string;
  documentType: string;
  label: string;
  required: boolean;
  status: string;
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
};

type Admission = {
  id: string;
  admissionNo: string;
  leadId?: string | null;
  userId?: string | null;
  courseId?: string | null;

  studentName: string;
  studentEmail: string;
  studentPhone: string;
  program: string;

  batchName?: string | null;
  counsellor?: string | null;

  totalFee: number;
  registrationFee: number;

  status: string;

  submittedAt: string;
  createdAt: string;

  notes?: string | null;
  rejectionReason?: string | null;

  payments?: Payment[];
  documents?: AdmissionDocument[];

  course?: {
    id: string;
    title: string;
    slug?: string | null;
    price?: number;
    duration?: string | null;
  } | null;

  lead?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
};

type Stats = {
  total?: number;
  pending?: number;
  paymentVerification?: number;
  documentsPending?: number;
  approved?: number;
  rejected?: number;
  enrolled?: number;
};

const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["PENDING", "Pending"],
  ["PAYMENT_VERIFICATION", "Payment verification"],
  ["DOCUMENTS_PENDING", "Documents pending"],
  ["APPROVED", "Approved"],
  ["REJECTED", "Rejected"],
  ["ENROLLED", "Enrolled"],
] as const;

const PAYMENT_MODES = [
  ["UPI", "UPI"],
  ["BANK_TRANSFER", "Bank transfer"],
  ["CASH", "Cash"],
  ["RAZORPAY", "Razorpay"],
  ["STRIPE", "Stripe"],
  ["OTHER", "Other"],
] as const;

const PAYMENT_TYPES = [
  ["REGISTRATION_FEE", "Registration fee"],
  ["COURSE_FEE", "Course fee"],
  ["INSTALLMENT", "Installment"],
  ["EMI", "EMI"],
  ["OTHER", "Other"],
] as const;

const DOCUMENT_LABELS: Record<string, string> = {
  GOVERNMENT_ID: "Aadhaar / Government ID",
  PASSPORT_PHOTO: "Passport-size Photograph",
  TENTH_MARKSHEET: "10th Marksheet",
  TWELFTH_MARKSHEET: "12th Marksheet",
  COLLEGE_DOCUMENT: "College / Graduation Document",
  ADDRESS_PROOF: "Address Proof",
  OTHER: "Other Document",
};

function currency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function dateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function readable(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function statusClass(status: string) {
  switch (status) {
    case "APPROVED":
    case "ENROLLED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    case "PAYMENT_VERIFICATION":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "DOCUMENTS_PENDING":
      return "border-violet-200 bg-violet-50 text-violet-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function documentStatusClass(status: string) {
  switch (status) {
    case "VERIFIED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    case "UPLOADED":
    case "UNDER_REVIEW":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

async function apiJson(
  url: string,
  init?: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.message ||
        body?.error ||
        "Something went wrong.",
    );
  }

  return body;
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
      <motion.div
        initial={{
          opacity: 0,
          y: 16,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        className={[
          "flex max-h-[94vh] w-full flex-col overflow-hidden",
          "rounded-t-[24px] border border-slate-200 bg-white shadow-2xl",
          "sm:rounded-[24px]",
          wide ? "max-w-5xl" : "max-w-2xl",
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function Kpi({
  title,
  value,
  Icon,
  tone = "blue",
}: {
  title: string;
  value: number;
  Icon: typeof UserRound;
  tone?: "blue" | "amber" | "violet" | "emerald";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-600"
      : tone === "violet"
        ? "bg-violet-50 text-violet-600"
        : tone === "emerald"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-blue-50 text-blue-600";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <div
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl",
            toneClass,
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] =
    useState<Admission[]>([]);

  const [stats, setStats] = useState<Stats>({});

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [detail, setDetail] =
    useState<Admission | null>(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] =
    useState(false);

  const [enrollmentSuccess, setEnrollmentSuccess] =
    useState<{
      studentName: string;
      email: string;
      temporaryPassword?: string | null;
      alreadyEnrolled: boolean;
    } | null>(null);

  const fetchAdmissions = useCallback(
    async (manual = false) => {
      try {
        if (manual) {
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

        const result = await apiJson(
          `/api/admissions${
            params.toString()
              ? `?${params.toString()}`
              : ""
          }`,
        );

        setAdmissions(
          result.data ||
            result.admissions ||
            [],
        );

        setStats(result.stats || {});
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admissions.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status],
  );

  const openDetail = useCallback(
    async (id: string) => {
      setDetailLoading(true);
      setError("");

      try {
        const result = await apiJson(
          `/api/admissions/${id}`,
        );

        setDetail(
          result.admission ||
            result.data ||
            null,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admission.",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAdmissions();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [fetchAdmissions]);

  async function updateStatus(nextStatus: string) {
    if (!detail) return;

    setError("");

    try {
      const result = await apiJson(
        `/api/admissions/${detail.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      setDetail(
        result.admission ||
          result.data ||
          null,
      );

      await fetchAdmissions(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update admission.",
      );
    }
  }

  async function paymentAction(
    paymentId: string,
    action: "VERIFY" | "REJECT" | "REFUND",
  ) {
    setError("");

    try {
      await apiJson(
        `/api/payments/${paymentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            action,
          }),
        },
      );

      if (detail) {
        await openDetail(detail.id);
      }

      await fetchAdmissions(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update payment.",
      );
    }
  }

  async function enroll() {
    if (!detail) return;

    if (!detail.courseId) {
      setError(
        "A real course must be linked before enrollment.",
      );
      return;
    }

    try {
      setError("");

      const result = await apiJson(
        "/api/enrollments",
        {
          method: "POST",
          body: JSON.stringify({
            admissionId: detail.id,
          }),
        },
      );

      await openDetail(detail.id);
      await fetchAdmissions(true);

      setEnrollmentSuccess({
        studentName: detail.studentName,
        email: detail.studentEmail,
        temporaryPassword:
          result.temporaryPassword || null,
        alreadyEnrolled: Boolean(
          result.alreadyEnrolled,
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to enroll student.",
      );
    }
  }

  const visibleAdmissions = useMemo(
    () => admissions,
    [admissions],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Admissions
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Admissions Workspace
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Verify payments, collect documents,
            approve applications and enroll
            students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New admission
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          <span className="flex-1">
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          title="Total applications"
          value={stats.total || 0}
          Icon={FileText}
        />

        <Kpi
          title="Pending review"
          value={stats.pending || 0}
          Icon={Clock3}
          tone="amber"
        />

        <Kpi
          title="Payment verification"
          value={stats.paymentVerification || 0}
          Icon={CreditCard}
          tone="violet"
        />

        <Kpi
          title="Approved"
          value={stats.approved || 0}
          Icon={BadgeCheck}
          tone="emerald"
        />

        <Kpi
          title="Enrolled"
          value={stats.enrolled || 0}
          Icon={ShieldCheck}
          tone="emerald"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search admission, student, phone or program..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-blue-400 sm:w-52"
            >
              {STATUS_OPTIONS.map(
                ([value, text]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {text}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() =>
              void fetchAdmissions(true)
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw
              className={[
                "h-3.5 w-3.5",
                refreshing
                  ? "animate-spin"
                  : "",
              ].join(" ")}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : visibleAdmissions.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No admissions found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Try changing the search or status
              filter, or create a new admission.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Admission
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Student
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Program
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Fee
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Payment
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Created
                  </th>

                  <th className="px-5 py-3" />
                </tr>
              </thead>

              <tbody>
                {visibleAdmissions.map(
                  (admission) => {
                    const payments =
                      admission.payments || [];

                    const verified =
                      payments
                        .filter(
                          (payment) =>
                            payment.status ===
                            "VERIFIED",
                        )
                        .reduce(
                          (sum, payment) =>
                            sum + payment.amount,
                          0,
                        );

                    const pending =
                      payments
                        .filter(
                          (payment) =>
                            payment.status ===
                            "PENDING",
                        )
                        .reduce(
                          (sum, payment) =>
                            sum + payment.amount,
                          0,
                        );

                    return (
                      <tr
                        key={admission.id}
                        className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-900">
                            {admission.admissionNo}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {dateTime(
                              admission.createdAt,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {admission.studentName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {admission.studentEmail}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-slate-700">
                            {admission.program}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {admission.course?.title ||
                              "Course not linked"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-800">
                            {currency(
                              admission.totalFee,
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Reg.{" "}
                            {currency(
                              admission.registrationFee,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-emerald-600">
                            {currency(verified)}
                          </p>

                          {pending > 0 ? (
                            <p className="mt-1 text-[10px] text-amber-600">
                              {currency(
                                pending,
                              )}{" "}
                              pending
                            </p>
                          ) : (
                            <p className="mt-1 text-[10px] text-slate-400">
                              No pending payment
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2.5 py-1",
                              "text-[10px] font-bold",
                              statusClass(
                                admission.status,
                              ),
                            ].join(" ")}
                          >
                            {readable(
                              admission.status,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(
                            admission.createdAt ||
                              admission.submittedAt,
                          ).toLocaleDateString(
                            "en-IN",
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              void openDetail(
                                admission.id,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-70 transition hover:bg-blue-50 hover:text-blue-600"
                            aria-label={`Open ${admission.studentName}`}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail ? (
        <AdmissionDetail
          admission={detail}
          loading={detailLoading}
          onClose={() => setDetail(null)}
          onRefresh={() =>
            openDetail(detail.id)
          }
          onStatusChange={updateStatus}
          onPaymentAction={paymentAction}
          onEnroll={enroll}
          onOpenPayment={() =>
            setPaymentOpen(true)
          }
          onOpenDocuments={() =>
            setDocumentsOpen(true)
          }
        />
      ) : null}

      {paymentOpen && detail ? (
        <RecordPayment
          admission={detail}
          onClose={() =>
            setPaymentOpen(false)
          }
          onSaved={async () => {
            setPaymentOpen(false);
            await openDetail(detail.id);
            await fetchAdmissions(true);
          }}
        />
      ) : null}

      {documentsOpen && detail ? (
        <DocumentsModal
          admission={detail}
          onClose={() =>
            setDocumentsOpen(false)
          }
          onSaved={async () => {
            await openDetail(detail.id);
            await fetchAdmissions(true);
          }}
        />
      ) : null}

      {createOpen ? (
        <CreateAdmission
          onClose={() =>
            setCreateOpen(false)
          }
          onCreated={async (id) => {
            setCreateOpen(false);
            await fetchAdmissions(true);

            if (id) {
              await openDetail(id);
            }
          }}
        />
      ) : null}

      {enrollmentSuccess ? (
        <EnrollmentSuccessModal
          result={enrollmentSuccess}
          onClose={() =>
            setEnrollmentSuccess(null)
          }
        />
      ) : null}
    </section>
  );
}

function EnrollmentSuccessModal({
  result,
  onClose,
}: {
  result: {
    studentName: string;
    email: string;
    temporaryPassword?: string | null;
    alreadyEnrolled: boolean;
  };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!result.temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(
        result.temporaryPassword,
      );
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  const hasNewPassword =
    Boolean(result.temporaryPassword) &&
    !result.alreadyEnrolled;

  return (
    <Modal
      title={
        result.alreadyEnrolled
          ? "Enrollment already completed"
          : "Enrollment successful"
      }
      subtitle={
        result.alreadyEnrolled
          ? "This student already has an active enrollment."
          : "The student account and course enrollment have been created."
      }
      onClose={onClose}
    >
      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950">
                {result.alreadyEnrolled
                  ? "Student is already enrolled"
                  : "Student enrolled successfully"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {result.alreadyEnrolled
                  ? "No new account credentials were generated."
                  : "The admission has completed the enrollment workflow and the student account is ready."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Student account
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Student"
              value={result.studentName}
            />

            <DetailItem
              label="Login email"
              value={result.email}
            />
          </div>
        </div>

        {hasNewPassword ? (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Temporary password
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Give this password to the student securely. It
                  should not be posted in a public channel.
                </p>
              </div>

              <LockKeyhole className="h-5 w-5 shrink-0 text-blue-600" />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-h-11 flex-1 items-center overflow-hidden rounded-xl border border-blue-200 bg-white px-3">
                <code className="w-full overflow-x-auto whitespace-nowrap text-sm font-bold tracking-[0.08em] text-slate-900">
                  {result.temporaryPassword}
                </code>
              </div>

              <button
                type="button"
                onClick={() => void copyPassword()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy password"}
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
              Security reminder: this temporary password is shown
              here because it was just generated. Share it securely
              and ask the student to change it after first login.
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <Check className="h-3.5 w-3.5" />
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AdmissionDetail({
  admission,
  loading,
  onClose,
  onRefresh,
  onStatusChange,
  onPaymentAction,
  onEnroll,
  onOpenPayment,
  onOpenDocuments,
}: {
  admission: Admission;
  loading: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onStatusChange: (
    status: string,
  ) => Promise<void>;
  onPaymentAction: (
    paymentId: string,
    action: "VERIFY" | "REJECT" | "REFUND",
  ) => Promise<void>;
  onEnroll: () => Promise<void>;
  onOpenPayment: () => void;
  onOpenDocuments: () => void;
}) {
  const payments = admission.payments || [];
  const documents = admission.documents || [];

  const verifiedPaid = payments
    .filter(
      (payment) =>
        payment.status === "VERIFIED",
    )
    .reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

  const pendingPayments = payments
    .filter(
      (payment) =>
        payment.status === "PENDING",
    )
    .reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

  const balance = Math.max(
    admission.totalFee - verifiedPaid,
    0,
  );

  const requiredDocuments =
    documents.filter(
      (document) => document.required,
    );

  const verifiedRequired =
    requiredDocuments.filter(
      (document) =>
        document.status === "VERIFIED",
    );

  const documentsComplete =
    requiredDocuments.length > 0 &&
    verifiedRequired.length ===
      requiredDocuments.length;

  const canVerifyPayment =
    admission.status ===
      "PAYMENT_VERIFICATION" &&
    payments.some(
      (payment) => payment.status === "PENDING",
    );

  const canOpenDocuments =
    admission.status ===
      "DOCUMENTS_PENDING";

  const canApprove =
    admission.status ===
      "DOCUMENTS_PENDING" &&
    documentsComplete;

  const canEnroll =
    admission.status === "APPROVED" &&
    Boolean(admission.courseId);

  const canReject =
    admission.status !== "ENROLLED" &&
    admission.status !== "REJECTED";

  return (
    <Modal
      title={admission.studentName}
      subtitle={admission.admissionNo}
      onClose={onClose}
      wide
    >
      <div className="space-y-5 p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {admission.studentName}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {admission.admissionNo}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {admission.studentEmail}
                    </span>

                    <span>
                      {admission.studentPhone}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={[
                  "inline-flex w-fit rounded-full border px-3 py-1.5",
                  "text-[10px] font-bold",
                  statusClass(admission.status),
                ].join(" ")}
              >
                {readable(admission.status)}
              </span>
            </div>

            {admission.course ? (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-500">
                    Linked course
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {admission.course.title}
                  </p>
                </div>

                <BadgeCheck className="h-5 w-5 text-blue-600" />
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                No real course is linked to this
                admission. Enrollment will remain
                unavailable until a course is linked.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Fee position
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {currency(
                    admission.totalFee,
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">
                  Verified
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-600">
                  {currency(verifiedPaid)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">
                  Balance
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {currency(balance)}
                </p>
              </div>
            </div>

            {pendingPayments > 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                {currency(
                  pendingPayments,
                )}{" "}
                awaiting payment verification.
              </div>
            ) : null}
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Application
                </p>

                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  Program & details
                </h3>
              </div>

              <FileText className="h-5 w-5 text-slate-300" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Program"
                value={admission.program}
              />

              <DetailItem
                label="Batch"
                value={
                  admission.batchName ||
                  "—"
                }
              />

              <DetailItem
                label="Counsellor"
                value={
                  admission.counsellor ||
                  "—"
                }
              />

              <DetailItem
                label="Registration fee"
                value={currency(
                  admission.registrationFee,
                )}
              />

              <DetailItem
                label="Submitted"
                value={dateTime(
                  admission.submittedAt,
                )}
              />

              <DetailItem
                label="Lead"
                value={
                  admission.lead?.fullName ||
                  "Direct admission"
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Payments
                </p>

                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  Payment history
                </h3>
              </div>

              {admission.status !==
                "REJECTED" &&
              admission.status !==
                "ENROLLED" ? (
                <button
                  type="button"
                  onClick={onOpenPayment}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Record payment
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                  <CircleDollarSign className="mx-auto h-5 w-5 text-slate-300" />
                  <p className="mt-2 text-xs text-slate-500">
                    No payments recorded.
                  </p>
                </div>
              ) : (
                payments.map(
                  (payment) => (
                    <div
                      key={payment.id}
                      className="rounded-xl border border-slate-200 p-3.5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <CircleDollarSign className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {currency(
                                payment.amount,
                              )}{" "}
                              ·{" "}
                              {readable(
                                payment.type,
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {readable(
                                payment.mode,
                              )}{" "}
                              ·{" "}
                              {payment.transactionId ||
                                "No transaction ID"}{" "}
                              ·{" "}
                              {dateTime(
                                payment.paymentDate,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "rounded-full border px-2.5 py-1",
                              "text-[10px] font-bold",
                              payment.status ===
                              "VERIFIED"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : payment.status ===
                                    "FAILED"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : payment.status ===
                                      "REFUNDED"
                                    ? "border-slate-200 bg-slate-100 text-slate-600"
                                    : "border-amber-200 bg-amber-50 text-amber-700",
                            ].join(" ")}
                          >
                            {readable(
                              payment.status,
                            )}
                          </span>

                          {payment.status ===
                          "PENDING" ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  void onPaymentAction(
                                    payment.id,
                                    "VERIFY",
                                  )
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[10px] font-bold text-white transition hover:bg-emerald-700"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Verify
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void onPaymentAction(
                                    payment.id,
                                    "REJECT",
                                  )
                                }
                                className="inline-flex h-8 items-center rounded-lg border border-red-200 px-3 text-[10px] font-bold text-red-600 transition hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}

                          {payment.status ===
                          "VERIFIED" ? (
                            <>
                              {payment.receipt ? (
                                <a
                                  href={`/api/payments/${payment.id}/receipt`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Receipt
                                </a>
                              ) : null}

                              <button
                                type="button"
                                onClick={() =>
                                  void onPaymentAction(
                                    payment.id,
                                    "REFUND",
                                  )
                                }
                                className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-500 transition hover:bg-slate-50"
                              >
                                Refund
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Documents
              </p>

              <h3 className="mt-1 text-sm font-bold text-slate-900">
                Admission document checklist
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {verifiedRequired.length} of{" "}
                {requiredDocuments.length}{" "}
                required documents verified.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenDocuments}
              disabled={
                admission.status !==
                  "DOCUMENTS_PENDING" &&
                admission.status !==
                  "APPROVED" &&
                admission.status !==
                  "ENROLLED"
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileCheck2 className="h-4 w-4" />
              {admission.status ===
                "PAYMENT_VERIFICATION" ||
              admission.status === "PENDING"
                ? "Documents locked"
                : "Manage documents"}
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {requiredDocuments.map(
              (document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3"
                >
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      document.status ===
                      "VERIFIED"
                        ? "bg-emerald-100 text-emerald-600"
                        : document.status ===
                            "REJECTED"
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    {document.status ===
                    "VERIFIED" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {document.label ||
                        DOCUMENT_LABELS[
                          document.documentType
                        ] ||
                        readable(
                          document.documentType,
                        )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {readable(
                        document.status,
                      )}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <WorkflowPanel
          admission={admission}
          documentsComplete={
            documentsComplete
          }
          canVerifyPayment={
            canVerifyPayment
          }
          canOpenDocuments={
            canOpenDocuments
          }
          canApprove={canApprove}
          canEnroll={canEnroll}
          canReject={canReject}
          onOpenDocuments={
            onOpenDocuments
          }
          onApprove={() =>
            void onStatusChange(
              "APPROVED",
            )
          }
          onEnroll={onEnroll}
          onReject={() =>
            void onStatusChange(
              "REJECTED",
            )
          }
          onRefresh={onRefresh}
        />
      </div>
    </Modal>
  );
}

function WorkflowPanel({
  admission,
  documentsComplete,
  canVerifyPayment,
  canOpenDocuments,
  canApprove,
  canEnroll,
  canReject,
  onOpenDocuments,
  onApprove,
  onEnroll,
  onReject,
  onRefresh,
}: {
  admission: Admission;
  documentsComplete: boolean;
  canVerifyPayment: boolean;
  canOpenDocuments: boolean;
  canApprove: boolean;
  canEnroll: boolean;
  canReject: boolean;
  onOpenDocuments: () => void;
  onApprove: () => void;
  onEnroll: () => Promise<void>;
  onReject: () => void;
  onRefresh: () => Promise<void>;
}) {
  let title = "Move this admission forward";
  let description =
    "Complete the current stage before continuing.";

  if (
    admission.status ===
    "PAYMENT_VERIFICATION"
  ) {
    title = "Verify payment first";
    description =
      "The submitted payment must be verified before document collection is unlocked.";
  }

  if (
    admission.status ===
    "DOCUMENTS_PENDING"
  ) {
    title = "Complete document verification";
    description = documentsComplete
      ? "All required documents are verified. The admission can now be approved."
      : "Upload and verify every required document before approval.";
  }

  if (admission.status === "APPROVED") {
    title = "Ready for enrollment";
    description = admission.courseId
      ? "The admission is approved and linked to a real course."
      : "A real course must be linked before enrollment.";
  }

  if (admission.status === "ENROLLED") {
    title = "Enrollment completed";
    description =
      "This admission has completed the normal workflow.";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Workflow
          </p>

          <h3 className="mt-1 text-sm font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {admission.status ===
          "PAYMENT_VERIFICATION" ? (
            <>
              <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700">
                <LockKeyhole className="h-3.5 w-3.5" />
                Documents locked
              </span>

              <button
                type="button"
                disabled={!canVerifyPayment}
                onClick={() =>
                  void onRefresh()
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </>
          ) : null}

          {admission.status ===
          "DOCUMENTS_PENDING" ? (
            <>
              <button
                type="button"
                onClick={onOpenDocuments}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-white"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Documents
              </button>

              <button
                type="button"
                disabled={!canApprove}
                onClick={onApprove}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                Approve
              </button>
            </>
          ) : null}

          {admission.status ===
          "APPROVED" ? (
            <button
              type="button"
              disabled={!canEnroll}
              onClick={() =>
                void onEnroll()
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Enroll student
            </button>
          ) : null}

          {canReject ? (
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              Reject
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DocumentsModal({
  admission,
  onClose,
  onSaved,
}: {
  admission: Admission;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [documents, setDocuments] =
    useState<AdmissionDocument[]>(
      admission.documents || [],
    );

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState("");

  const [error, setError] =
    useState("");

  const loadDocuments = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiJson(
          `/api/admissions/${admission.id}/documents`,
        );

        setDocuments(
          result.data ||
            result.documents ||
            [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load documents.",
        );
      } finally {
        setLoading(false);
      }
    },
    [admission.id],
  );

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function upload(
    documentId: string,
    file: File,
  ) {
    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Document must be 10 MB or smaller.",
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PDF, JPG, PNG or WEBP documents are supported.",
      );
      return;
    }

    const document = documents.find(
      (item) =>
        item.id === documentId,
    );

    if (!document) return;

    try {
      setBusy(documentId);
      setError("");

      const form = new FormData();

      form.append("file", file);
      form.append(
        "documentType",
        document.documentType,
      );
      form.append(
        "label",
        document.label,
      );

      const response = await fetch(
        `/api/admissions/${admission.id}/documents`,
        {
          method: "POST",
          body: form,
          cache: "no-store",
        },
      );

      const result =
        await response.json().catch(
          () => null,
        );

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Unable to upload document.",
        );
      }

      await loadDocuments();
      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload document.",
      );
    } finally {
      setBusy("");
    }
  }

  async function review(
    documentId: string,
    status: "VERIFIED" | "REJECTED",
  ) {
    let rejectionReason = "";

    if (status === "REJECTED") {
      rejectionReason =
        window.prompt(
          "Enter the rejection reason:",
        )?.trim() || "";

      if (!rejectionReason) {
        setError(
          "A rejection reason is required.",
        );
        return;
      }
    }

    try {
      setBusy(documentId);
      setError("");

      await apiJson(
        `/api/admissions/${admission.id}/documents/${documentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            rejectionReason,
          }),
        },
      );

      await loadDocuments();
      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update document.",
      );
    } finally {
      setBusy("");
    }
  }

  const requiredDocuments =
    documents.filter(
      (document) => document.required,
    );

  const verifiedRequired =
    requiredDocuments.filter(
      (document) =>
        document.status === "VERIFIED",
    );

  return (
    <Modal
      title="Admission documents"
      subtitle={`${admission.studentName} · ${verifiedRequired.length}/${requiredDocuments.length} required verified`}
      onClose={onClose}
      wide
    >
      <div className="space-y-4 p-5 sm:p-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="text-sm font-bold text-slate-900">
                Document verification
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Every required document must
                be verified before this admission
                can be approved.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(
              (document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />

                        <p className="text-sm font-bold text-slate-900">
                          {document.label ||
                            DOCUMENT_LABELS[
                              document.documentType
                            ] ||
                            readable(
                              document.documentType,
                            )}
                        </p>

                        {document.required ? (
                          <span className="text-[10px] font-semibold text-red-500">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Optional
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {document.fileName ||
                          "No file uploaded"}

                        {document.fileSize
                          ? ` · ${(
                              document.fileSize /
                              1024 /
                              1024
                            ).toFixed(
                              1,
                            )} MB`
                          : ""}
                      </p>

                      {document.rejectionReason ? (
                        <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">
                          {document.rejectionReason}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full border px-2.5 py-1",
                          "text-[10px] font-semibold",
                          documentStatusClass(
                            document.status,
                          ),
                        ].join(" ")}
                      >
                        {readable(
                          document.status,
                        )}
                      </span>

                      {document.fileUrl ? (
                        <a
                          href={
                            document.fileUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                      ) : null}

                      <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700">
                        <UploadCloud className="h-3.5 w-3.5" />

                        {busy ===
                        document.id
                          ? "Uploading..."
                          : document.fileUrl
                            ? "Replace"
                            : "Upload"}

                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={
                            busy ===
                            document.id
                          }
                          onChange={(event) => {
                            const file =
                              event.target
                                .files?.[0];

                            if (file) {
                              void upload(
                                document.id,
                                file,
                              );
                            }

                            event.currentTarget.value =
                              "";
                          }}
                        />
                      </label>

                      {document.fileUrl &&
                      (document.status ===
                        "UPLOADED" ||
                        document.status ===
                          "UNDER_REVIEW") ? (
                        <>
                          <button
                            type="button"
                            disabled={
                              busy ===
                              document.id
                            }
                            onClick={() =>
                              void review(
                                document.id,
                                "VERIFIED",
                              )
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Verify
                          </button>

                          <button
                            type="button"
                            disabled={
                              busy ===
                              document.id
                            }
                            onClick={() =>
                              void review(
                                document.id,
                                "REJECTED",
                              )
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function RecordPayment({
  admission,
  onClose,
  onSaved,
}: {
  admission: Admission;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [amount, setAmount] =
    useState(
      String(
        admission.registrationFee ||
          5000,
      ),
    );

  const [type, setType] =
    useState("REGISTRATION_FEE");

  const [mode, setMode] =
    useState("UPI");

  const [transactionId, setTransactionId] =
    useState("");

  const [proofUrl, setProofUrl] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");

      await apiJson("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          admissionId: admission.id,
          amount: Number(amount),
          type,
          mode,
          transactionId,
          proofUrl,
          notes,
        }),
      });

      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record payment.",
      );
    } finally {
      setBusy(false);
    }
  }

  const verifiedPaid =
    (admission.payments || [])
      .filter(
        (payment) =>
          payment.status === "VERIFIED",
      )
      .reduce(
        (sum, payment) =>
          sum + payment.amount,
        0,
      );

  const balance = Math.max(
    admission.totalFee -
      verifiedPaid,
    0,
  );

  return (
    <Modal
      title="Record payment"
      subtitle={`${admission.studentName} · Balance ${currency(balance)}`}
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-4 p-5 sm:p-6"
      >
        {error ? (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        <Field
          label="Amount"
          value={amount}
          onChange={setAmount}
          type="number"
          required
        />

        <Select
          label="Payment type"
          value={type}
          onChange={setType}
          options={PAYMENT_TYPES}
        />

        <Select
          label="Payment mode"
          value={mode}
          onChange={setMode}
          options={PAYMENT_MODES}
        />

        <Field
          label="Transaction ID"
          value={transactionId}
          onChange={setTransactionId}
          placeholder="UPI / bank reference"
        />

        <Field
          label="Proof URL"
          value={proofUrl}
          onChange={setProofUrl}
          placeholder="Optional receipt/screenshot URL"
        />

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Notes
          </span>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}

            Record & send for verification
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CreateAdmission({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (
    id: string,
  ) => Promise<void>;
}) {
  const [leads, setLeads] =
    useState<any[]>([]);

  const [courses, setCourses] =
    useState<any[]>([]);

  const [leadId, setLeadId] =
    useState("");

  const [courseId, setCourseId] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [program, setProgram] =
    useState("");

  const [fee, setFee] =
    useState("");

  const [registration, setRegistration] =
    useState("5000");

  const [batch, setBatch] =
    useState("");

  const [counsellor, setCounsellor] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    Promise.all([
      apiJson("/api/leads"),
      apiJson("/api/courses"),
    ])
      .then(([leadResult, courseResult]) => {
        setLeads(
          leadResult.leads ||
            leadResult.data ||
            [],
        );

        setCourses(
          courseResult.courses ||
            courseResult.data ||
            [],
        );
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load options.",
        );
      });
  }, []);

  function selectLead(id: string) {
    setLeadId(id);

    const lead = leads.find(
      (item) => item.id === id,
    );

    if (!lead) return;

    setName(lead.fullName);
    setEmail(lead.email);
    setPhone(lead.phone);
    setProgram(
      lead.interestedProgram,
    );

    const normalized =
      String(
        lead.interestedProgram ||
          "",
      )
        .trim()
        .toLowerCase();

    const normalizedSlug =
      normalized.replace(
        /\s+/g,
        "-",
      );

    const course = courses.find(
      (item) =>
        String(
          item.title || "",
        )
          .trim()
          .toLowerCase() ===
          normalized ||
        String(
          item.slug || "",
        )
          .trim()
          .toLowerCase() ===
          normalizedSlug,
    );

    if (course) {
      setCourseId(course.id);
      setFee(
        String(
          course.price ??
            course.fee ??
            "",
        ),
      );

      setError("");
    } else {
      setCourseId("");
      setFee("");

      setError(
        `No active course is linked to "${lead.interestedProgram}". Please select a real course manually.`,
      );
    }
  }

  function selectCourse(id: string) {
    setCourseId(id);

    const course = courses.find(
      (item) => item.id === id,
    );

    if (!course) return;

    setProgram(course.title);

    setFee(
      String(
        course.price ??
          course.fee ??
          "",
      ),
    );
  }

  async function submit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");

      if (!courseId) {
        throw new Error(
          "Please select a real course before creating the admission.",
        );
      }

      const result =
        await apiJson(
          "/api/admissions",
          {
            method: "POST",
            body: JSON.stringify({
              leadId,
              courseId,
              studentName: name,
              studentEmail: email,
              studentPhone: phone,
              program,
              totalFee: Number(fee),
              registrationFee:
                Number(registration),
              batchName: batch,
              counsellor,
            }),
          },
        );

      await onCreated(
        result.admission?.id ||
          result.data?.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create admission.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="New admission"
      subtitle="Create an application and link the real course."
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-4 p-5 sm:p-6"
      >
        {error ? (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
            {error}
          </div>
        ) : null}

        <Select
          label="Lead"
          value={leadId}
          onChange={selectLead}
          options={[
            ["", "Select a lead"],
            ...leads.map(
              (lead) =>
                [
                  lead.id,
                  `${lead.fullName} · ${lead.interestedProgram}`,
                ] as [
                  string,
                  string,
                ],
            ),
          ]}
        />

        <Select
          label="Course"
          value={courseId}
          onChange={selectCourse}
          options={[
            ["", "Select course"],
            ...courses
              .filter(
                (course) =>
                  course.published !==
                  false,
              )
              .map(
                (course) =>
                  [
                    course.id,
                    `${course.title} · ${currency(
                      course.price ??
                        course.fee ??
                        0,
                    )}`,
                  ] as [
                    string,
                    string,
                  ],
              ),
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Student name"
            value={name}
            onChange={setName}
            required
          />

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          <Field
            label="Phone"
            value={phone}
            onChange={setPhone}
            required
          />

          <Field
            label="Program"
            value={program}
            onChange={setProgram}
            required
          />

          <Field
            label="Total fee"
            value={fee}
            onChange={setFee}
            type="number"
            required
          />

          <Field
            label="Registration fee"
            value={registration}
            onChange={setRegistration}
            type="number"
            required
          />

          <Field
            label="Batch"
            value={batch}
            onChange={setBatch}
            placeholder="e.g. Design 2026"
          />

          <Field
            label="Counsellor"
            value={counsellor}
            onChange={setCounsellor}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              busy || !courseId
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}

            Create admission
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-blue-400"
        >
          {options.map(
            ([optionValue, text]) => (
              <option
                key={optionValue}
                value={optionValue}
              >
                {text}
              </option>
            ),
          )}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
      </div>
    </label>
  );
}
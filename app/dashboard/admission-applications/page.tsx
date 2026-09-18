"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type Consent = {
  id?: string;
  consentType: string;
  accepted: boolean;
  acceptedAt?: string | null;
};

type AuditEvent = {
  id?: string;
  eventType: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  actorType?: string | null;
  actorId?: string | null;
  description?: string | null;
  createdAt: string;
};

type RegistrationPayment = {
  id: string;
  registrationNo: string;
  amount: number;
  mode: string;
  transactionId?: string | null;
  status: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
};

type Application = {
  id: string;
  applicationNo: string;
  status: string;

  studentName: string;
  studentEmail: string;
  studentPhone: string;

  program: string;

  course?: {
    id: string;
    title: string;
    slug?: string | null;
    price?: number | null;
  } | null;

  lead?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status?: string | null;
    currentStatus?: string | null;
  } | null;

  registrationPayment?: RegistrationPayment | null;

  consents?: Consent[];

  auditEvents?: AuditEvent[];

  baseFee?: number | null;
  concessionPercent?: number | null;
  concessionAmount?: number | null;
  totalFee?: number | null;
  registrationFee?: number | null;
  firstLectureFee?: number | null;
  balanceFee?: number | null;

  submittedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  [key: string]: unknown;
};

type ApiResponse = {
  success: boolean;
  data?: Application[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["DRAFT", "Draft"],
  ["SUBMITTED", "Submitted"],
  ["UNDER_REVIEW", "Under review"],
  ["CHANGES_REQUESTED", "Changes requested"],
  ["APPROVED", "Approved"],
] as const;

function currency(value: unknown) {
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

function readable(value?: string | null) {
  if (!value) return "—";

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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "UNDER_REVIEW":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "CHANGES_REQUESTED":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "SUBMITTED":
      return "border-violet-200 bg-violet-50 text-violet-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function paymentStatusClass(status?: string | null) {
  switch (status) {
    case "VERIFIED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "FAILED":
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

async function apiJson(
  url: string,
  init: RequestInit = {},
) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.message ||
        body?.error ||
        "Unable to load admission applications.",
    );
  }

  return body as ApiResponse;
}

function Kpi({
  title,
  value,
  Icon,
  tone = "blue",
}: {
  title: string;
  value: number;
  Icon: typeof FileText;
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

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-1 text-sm font-medium text-slate-800">
        {value || "—"}
      </div>
    </div>
  );
}

function ApplicationDrawer({
  application,
  onClose,
  reviewLoading,
  reviewAction,
  reviewNote,
  setReviewNote,
  onReviewAction,
  admissionLoading,
  onCreateAdmission,
}: {
  application: Application;
  onClose: () => void;
  reviewLoading: boolean;
  reviewAction: string;
  reviewNote: string;
  setReviewNote: (value: string) => void;
  onReviewAction: (action: string, note?: string) => Promise<void>;
  admissionLoading: boolean;
  onCreateAdmission: () => Promise<void>;
}) {
  const consents = application.consents || [];
  const auditEvents = application.auditEvents || [];
  const payment = application.registrationPayment;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/30 backdrop-blur-[2px]">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 34,
        }}
        className="flex h-full w-full max-w-3xl flex-col bg-[#F7F9FC] shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                Admission application
              </p>

              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                  statusClass(application.status),
                ].join(" ")}
              >
                {readable(application.status)}
              </span>
            </div>

            <h2 className="mt-2 truncate text-xl font-bold tracking-tight text-slate-950">
              {application.applicationNo}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Submitted {dateTime(application.submittedAt || application.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close application"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-950">
                    {application.studentName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {application.course?.title || application.program}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {application.studentEmail}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {application.studentPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Section
              title="Applicant"
              icon={<UserRound className="h-4 w-4" />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Student name" value={application.studentName} />
                <Field label="Email" value={application.studentEmail} />
                <Field label="Phone" value={application.studentPhone} />
                <Field label="Program" value={application.program} />
                <Field
                  label="Course"
                  value={application.course?.title || "Course not linked"}
                />
                <Field
                  label="Course fee"
                  value={currency(application.course?.price)}
                />
              </div>
            </Section>

            <Section
              title="Registration payment"
              icon={<CreditCard className="h-4 w-4" />}
            >
              {payment ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {payment.registrationNo}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {payment.mode.replaceAll("_", " ")}
                      </p>
                    </div>

                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                        paymentStatusClass(payment.status),
                      ].join(" ")}
                    >
                      {readable(payment.status)}
                    </span>
                                    <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Amount" value={currency(payment.amount)} />
                    <Field
                      label="Transaction / UTR"
                      value={payment.transactionId || "—"}
                    />
                    <Field
                      label="Verified at"
                      value={dateTime(payment.verifiedAt)}
                    />
                  </div>
                </div>
              </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No registration payment is linked.
                </p>
              )}
            </Section>

            <Section
              title="Financial snapshot"
              icon={<FileText className="h-4 w-4" />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Base fee" value={currency(application.baseFee)} />
                <Field
                  label="Concession"
                  value={`${application.concessionPercent ?? 0}% · ${currency(application.concessionAmount)}`}
                />
                <Field
                  label="Total fee"
                  value={currency(application.totalFee)}
                />
                <Field
                  label="Registration fee"
                  value={currency(application.registrationFee)}
                />
                <Field
                  label="First lecture fee"
                  value={currency(application.firstLectureFee)}
                />
                <Field
                  label="Balance fee"
                  value={currency(application.balanceFee)}
                />
              </div>
            </Section>

            <Section
              title="Consent records"
              icon={<ShieldCheck className="h-4 w-4" />}
            >
              {consents.length > 0 ? (
                <div className="space-y-2">
                  {consents.map((consent, index) => (
                    <div
                      key={consent.id || `${consent.consentType}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {readable(consent.consentType)}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {dateTime(consent.acceptedAt)}
                        </p>
                      </div>

                      {consent.accepted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Accepted
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-600">
                          Not accepted
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No consent records found.
                </p>
              )}
            </Section>

            <Section
              title="CRM linkage"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Lead"
                  value={application.lead?.fullName || "Not linked"}
                />
                <Field
                  label="Lead status"
                  value={readable(application.lead?.status)}
                />
                <Field
                  label="CRM lifecycle"
                  value={readable(application.lead?.currentStatus)}
                />
                <Field
                  label="Lead email"
                  value={application.lead?.email || "—"}
                />
              </div>
            </Section>

            <Section
              title="Audit history"
              icon={<Clock3 className="h-4 w-4" />}
            >
              {auditEvents.length > 0 ? (
                <div className="relative space-y-4">
                  {auditEvents.map((event, index) => (
                    <div
                      key={event.id || `${event.eventType}-${index}`}
                      className="relative pl-7"
                    >
                      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />

                      {index < auditEvents.length - 1 ? (
                        <span className="absolute bottom-[-18px] left-[5px] top-4 w-px bg-slate-200" />
                      ) : null}

                      <p className="text-xs font-bold text-slate-800">
                        {readable(event.eventType)}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        {event.fromStatus
                          ? `${readable(event.fromStatus)} → `
                          : ""}
                        {readable(event.toStatus)}
                      </p>

                      {event.description ? (
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {event.description}
                        </p>
                      ) : null}

                      <p className="mt-1 text-[10px] text-slate-400">
                        {readable(event.actorType)} · {dateTime(event.createdAt)}
              </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No audit events found.
                </p>
              )}
            </Section>

            {["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(
              application.status,
            ) ? (
              <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">
                      Application review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Review this application and move it through the approved
                      admin review workflow. These actions do not approve
                      payment or create enrollment.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="application-review-note"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Review note
                    <span className="ml-1 font-normal text-slate-400">
                      Required for changes or rejection
                    </span>
                  </label>

                  <textarea
                    id="application-review-note"
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    disabled={reviewLoading}
                    rows={4}
                    placeholder="Add a clear review note, missing requirement, or approval comment..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.status === "SUBMITTED" ? (
                    <button
                      type="button"
                      disabled={reviewLoading}
                      onClick={() => onReviewAction("UNDER_REVIEW")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewLoading && reviewAction === "UNDER_REVIEW" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Clock3 className="h-4 w-4" />
                      )}
                      Start review
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={reviewLoading}
                    onClick={() => {
                      const note = reviewNote.trim();

                      if (!note) {
                        window.alert(
                          "Please add a review note before requesting changes.",
                        );
                        return;
                      }

                      onReviewAction("CHANGES_REQUESTED", note);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewLoading && reviewAction === "CHANGES_REQUESTED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    Request changes
                  </button>

                  <button
                    type="button"
                    disabled={reviewLoading}
                    onClick={() => {
                      const note = reviewNote.trim();

                      if (
                        !window.confirm(
                          "Approve this admission application? This only changes the application review status and does not enroll the student.",
                        )
                      ) {
                        return;
                      }

                      onReviewAction(
                        "APPROVED",
                        note || undefined,
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewLoading && reviewAction === "APPROVED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve application
                  </button>

                  <button
                    type="button"
                    disabled={reviewLoading}
                    onClick={() => {
                      const note = reviewNote.trim();

                      if (!note) {
                        window.alert(
                          "Please add a reason before rejecting this application.",
                        );
                        return;
                      }

                      if (
                        !window.confirm(
                          "Reject this admission application? This action changes the application review status.",
                        )
                      ) {
                        return;
                      }

                      onReviewAction("REJECTED", note);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewLoading && reviewAction === "REJECTED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Reject
                  </button>
                </div>

                {reviewLoading ? (
                  <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating application review status...
                  </div>
                ) : null}
              </div>
            ) : application.status === "APPROVED" ? (
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">
                      Application approved
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The application has passed admin review. Create the
                      admission record to move this student into the
                      Admissions Workspace. This will not enroll the student.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Review
                      </p>
                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        Approved
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Registration
                      </p>
                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        {payment?.status === "VERIFIED"
                          ? "₹5,000 verified"
                          : "Verification required"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Enrollment
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-700">
                        Not yet created
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    admissionLoading ||
                    payment?.status !== "VERIFIED"
                  }
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Create the admission record for this approved application? The verified ₹5,000 registration payment will be recorded against the new admission. This will not enroll the student.",
                      )
                    ) {
                      return;
                    }

                    void onCreateAdmission();
                  }}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {admissionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {admissionLoading
                    ? "Creating admission..."
                    : "Create Admission"}
                </button>

                {payment?.status !== "VERIFIED" ? (
                  <p className="mt-2 text-[11px] font-semibold text-amber-700">
                    The verified registration payment is required before an
                    admission can be created.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Review complete
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      This application is currently{" "}
                      <span className="font-semibold text-slate-700">
                        {readable(application.status)}
                      </span>
                      . No further review action is available from this
                      workflow stage.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdmissionApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] =
    useState<Application | null>(null);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [admissionLoading, setAdmissionLoading] = useState(false);

  const fetchApplications = useCallback(
    async (manual = false, requestedPage = pagination.page) => {
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

        params.set("page", String(requestedPage));
        params.set("pageSize", "25");

        const result = await apiJson(
          `/api/admission-applications?${params.toString()}`,
        );

        const nextApplications = result.data || [];
        setApplications(nextApplications);

        setSelected((current) => {
          if (!current) return null;
          return (
            nextApplications.find(
              (application: Application) =>
                application.id === current.id,
            ) || null
          );
        });

        setPagination(
          result.pagination || {
            page: requestedPage,
            pageSize: 25,
            total: result.data?.length || 0,
            totalPages: 1,
          },
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admission applications.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.page, search, status],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchApplications(false, 1);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [search, status]);

  const stats = useMemo(() => {
    const total = pagination.total || applications.length;

    return {
      total,
      submitted: applications.filter(
        (application) => application.status === "SUBMITTED",
      ).length,
      underReview: applications.filter(
        (application) => application.status === "UNDER_REVIEW",
      ).length,
      changesRequested: applications.filter(
        (application) => application.status === "CHANGES_REQUESTED",
      ).length,
      approved: applications.filter(
        (application) => application.status === "APPROVED",
      ).length,
    };
  }, [applications, pagination.total]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Applications
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Admission Applications
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Review submitted admission applications, verify their registration
            linkage and inspect the complete application audit trail.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchApplications(true, 1)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              refreshing ? "animate-spin" : "",
            ].join(" ")}
          />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          <span className="flex-1">{error}</span>

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
          value={stats.total}
          Icon={FileText}
        />

        <Kpi
          title="Submitted"
          value={stats.submitted}
          Icon={Clock3}
          tone="amber"
        />

        <Kpi
          title="Under review"
          value={stats.underReview}
          Icon={Search}
          tone="blue"
        />

        <Kpi
          title="Changes requested"
          value={stats.changesRequested}
          Icon={AlertCircle}
          tone="amber"
        />

        <Kpi
          title="Approved"
          value={stats.approved}
          Icon={BadgeCheck}
          tone="emerald"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search application, student, phone, email or program..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-blue-400 sm:w-52"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => void fetchApplications(true, pagination.page)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw
              className={[
                "h-3.5 w-3.5",
                refreshing ? "animate-spin" : "",
              ].join(" ")}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No admission applications found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Submitted applications will appear here automatically after the
              verified registration flow is completed.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Application
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Student
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Program
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Registration
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Fee
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Submitted
                    </th>

                    <th className="px-5 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => {
                    const payment = application.registrationPayment;

                    return (
                      <tr
                        key={application.id}
                        className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-900">
                            {application.applicationNo}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {dateTime(application.createdAt)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {application.studentName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {application.studentEmail}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {application.studentPhone}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-slate-700">
                            {application.course?.title ||
                              application.program}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {application.program}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {payment ? (
                            <>
                              <p className="text-xs font-semibold text-slate-800">
                                {payment.registrationNo}
                              </p>

                              <p className="mt-1 text-[10px] text-emerald-600">
                                {currency(payment.amount)} ·{" "}
                                {readable(payment.status)}
                              </p>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Not linked
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-800">
                            {currency(application.totalFee)}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Balance {currency(application.balanceFee)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2.5 py-1",
                              "text-[10px] font-bold",
                              statusClass(application.status),
                            ].join(" ")}
                          >
                            {readable(application.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {dateTime(
                            application.submittedAt ||
                              application.createdAt,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelected(application)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-70 transition hover:bg-blue-50 hover:text-blue-600"
                            aria-label={`Open ${application.applicationNo}`}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                {applications.length > 0
                  ? (pagination.page - 1) * pagination.pageSize + 1
                  : 0}{" "}
               –{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total,
                )}{" "}
                of {pagination.total.toLocaleString("en-IN")}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    void fetchApplications(
                      true,
                      pagination.page - 1,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-2 text-xs font-semibold text-slate-500">
                  {pagination.page} /{" "}
                  {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  type="button"
                  disabled={
                    pagination.page >= pagination.totalPages
                  }
                  onClick={() =>
                    void fetchApplications(
                      true,
                      pagination.page + 1,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selected ? (
        <ApplicationDrawer
          application={selected}
          onClose={() => {
            if (!reviewLoading && !admissionLoading) {
              setSelected(null);
              setReviewNote("");
              setReviewAction("");
            }
          }}
          reviewLoading={reviewLoading}
          reviewAction={reviewAction}
          reviewNote={reviewNote}
          setReviewNote={setReviewNote}
          admissionLoading={admissionLoading}
          onCreateAdmission={async () => {
            if (!selected) return;

            setAdmissionLoading(true);
            setError("");

            try {
              const result = await apiJson(
                `/api/admission-applications/${selected.id}/admission`,
                {
                  method: "POST",
                },
              );

              window.alert(
                result.message ||
                  "Admission created successfully.",
              );

              await fetchApplications(true, pagination.page);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Unable to create admission.",
              );
            } finally {
              setAdmissionLoading(false);
            }
          }}
          onReviewAction={async (
            action: string,
            note?: string,
          ) => {
            setReviewLoading(true);
            setReviewAction(action);
            setError("");

            try {
              const payload: {
                status: string;
                notes?: string;
                reason?: string;
              } = {
                status: action,
              };

              if (action === "REJECTED") {
                payload.reason = note?.trim() || "";
              } else if (
                action === "CHANGES_REQUESTED" ||
                action === "APPROVED"
              ) {
                if (note?.trim()) {
                  payload.notes = note.trim();
                }
              }

              if (
                action === "CHANGES_REQUESTED" &&
                !payload.notes
              ) {
                throw new Error(
                  "Please provide a clear explanation for the requested changes.",
                );
              }

              if (
                action === "REJECTED" &&
                !payload.reason
              ) {
                throw new Error(
                  "Please provide a rejection reason.",
                );
              }

              await apiJson(
                `/api/admission-applications/${selected.id}`,
                {
                  method: "PATCH",
                  body: JSON.stringify(payload),
                },
              );

              setReviewNote("");
              setReviewAction("");

              await fetchApplications(true, pagination.page);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Unable to update application review status.",
              );
            } finally {
              setReviewLoading(false);
            }
          }}
        />
      ) : null}
    </section>
  );
}

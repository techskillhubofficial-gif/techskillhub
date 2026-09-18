"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  CreditCard,
  FileCheck2,
  Loader2,
  LockKeyhole,
  ReceiptIndianRupee,
  ShieldCheck,
  UploadCloud,
  WalletCards,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string | null;
  duration: string | null;
  price: number;
};

type RegistrationResponse = {
  success: boolean;
  message?: string;
  registrationPayment?: {
    id: string;
    registrationNo: string;
    amount: number;
    status: string;
    mode: string;
    course: {
      id: string;
      title: string;
    };
  };
};

const REGISTRATION_FEE = 5000;

const UPI_ID = process.env.NEXT_PUBLIC_TECHSKILLHUB_UPI_ID || "";
const BANK_NAME = process.env.NEXT_PUBLIC_TECHSKILLHUB_BANK_NAME || "";
const BANK_ACCOUNT_NAME =
  process.env.NEXT_PUBLIC_TECHSKILLHUB_BANK_ACCOUNT_NAME || "";
const BANK_ACCOUNT_NUMBER =
  process.env.NEXT_PUBLIC_TECHSKILLHUB_BANK_ACCOUNT_NUMBER || "";
const BANK_IFSC = process.env.NEXT_PUBLIC_TECHSKILLHUB_BANK_IFSC || "";
const BANK_BRANCH = process.env.NEXT_PUBLIC_TECHSKILLHUB_BANK_BRANCH || "";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function cleanPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function maskAccount(value: string) {
  if (!value) return "";
  if (value.length <= 4) return value;
  return `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  );
}

function PaymentDetail({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access is optional; the value remains visible.
    }
  }

  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>

      {copyable && (
        <button
          type="button"
          onClick={copyValue}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function RegistrationPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState("");

  const [courseId, setCourseId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [mode, setMode] = useState<"UPI" | "BANK_TRANSFER">("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationResponse["registrationPayment"] | null>(
    null,
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId) ?? null,
    [courses, courseId],
  );

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoadingCourses(true);

        const response = await fetch("/api/courses", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load courses.");
        }

        if (active) {
          setCourses(data.courses ?? []);
        }
      } catch (err) {
        if (active) {
          setCourseError(
            err instanceof Error
              ? err.message
              : "Unable to load courses right now.",
          );
        }
      } finally {
        if (active) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  function handleProofChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setProof(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Payment proof must be 10 MB or smaller.");
      event.target.value = "";
      setProof(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Upload a PDF, JPG, PNG, or WEBP payment proof.");
      event.target.value = "";
      setProof(null);
      return;
    }

    setError("");
    setProof(file);
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(null);

    if (!courseId) {
      setError("Please select the program you want to register for.");
      return;
    }

    if (!studentName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!studentEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const normalizedPhone = cleanPhone(studentPhone);

    if (normalizedPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your UTR / transaction ID.");
      return;
    }

    if (!proof) {
      setError("Please upload your payment proof.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/registration-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim().toLowerCase(),
          studentPhone: normalizedPhone,
          courseId,
          mode,
          transactionId: transactionId.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data: RegistrationResponse = await response.json();

      if (!response.ok || !data.success || !data.registrationPayment) {
        throw new Error(
          data.message || "Unable to create your registration.",
        );
      }

      const registrationPayment = data.registrationPayment;

      const formData = new FormData();
      formData.append("file", proof);
      formData.append("studentEmail", studentEmail.trim().toLowerCase());

      const proofResponse = await fetch(
        `/api/registration-payments/${registrationPayment.id}/proof`,
        {
          method: "POST",
          body: formData,
        },
      );

      const proofData = await proofResponse.json();

      if (!proofResponse.ok || !proofData.success) {
        throw new Error(
          proofData.message ||
            "Registration was created, but payment proof could not be uploaded. Please contact admissions with your registration number.",
        );
      }

      setSuccess(registrationPayment);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your registration.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-12 sm:px-8">
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-6 py-10 text-white sm:px-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
                Registration submitted
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Your registration is now under verification.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                We have received your ₹5,000 registration payment details and
                proof. Our admissions team will verify the payment before your
                application can continue.
              </p>
            </div>

            <div className="space-y-6 p-6 sm:p-10">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Your registration number
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-2xl font-bold tracking-wide text-slate-950">
                    {success.registrationNo}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard
                        ?.writeText(success.registrationNo)
                        .catch(() => undefined)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy number
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Program
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {success.course.title}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Amount
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {formatINR(success.amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 font-bold text-amber-600">
                    Pending verification
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-900">
                      What happens next?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Once your registration payment is verified, you can use
                      your registration number with your registered email or
                      mobile number to continue the full admission application.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/apply?registrationNo=${encodeURIComponent(
                    success.registrationNo
                  )}&email=${encodeURIComponent(studentEmail.trim().toLowerCase())}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Continue to application
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to TechSkillHub
                </Link>
              </div>

              <p className="text-center text-xs leading-5 text-slate-400">
                Keep your registration number safe. It is used to connect your
                registration payment with your admission application.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo/Full-logo.png"
              alt="TechSkillHub"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
              <LockKeyhole className="h-4 w-4 text-emerald-500" />
              Secure registration
            </div>

            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back to website
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Step 1 · Registration
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Reserve your place at TechSkillHub
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Select your program and submit the ₹5,000 registration payment
            details. Your seat/application reservation becomes active after our
            team verifies the payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={submitRegistration}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-8">
              <section>
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
             <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Choose your program
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your registration will be linked to this course.
                    </p>
                  </div>
                </div>

                {loadingCourses ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading available programs...
                  </div>
                ) : courseError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {courseError}
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={courseId}
                      onChange={(event) => setCourseId(event.target.value)}
                      className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    >
                      <option value="">Select a program</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} · {course.duration || "Program"}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  </div>
                )}

                {selectedCourse && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="font-bold text-blue-950">
                      {selectedCourse.title}
                    </p>
                    {selectedCourse.description && (
                      <p className="mt-1 text-sm leading-5 text-blue-900/70">
                        {selectedCourse.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedCourse.level && (
                        <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {selectedCourse.level}
                        </span>
                      )}
                      {selectedCourse.duration && (
                        <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {selectedCourse.duration}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="border-t border-slate-100 pt-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Applicant details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Use the same details you will use in your admission
                      application.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={studentName}
                    onChange={setStudentName}
                    placeholder="Enter your full name"
                  />

                  <Field
                    label="Email address"
                    type="email"
                    value={studentEmail}
                    onChange={setStudentEmail}
                    placeholder="you@example.com"
                  />

                  <Field
                    label="Mobile number"
                    value={studentPhone}
                    onChange={(value) => setStudentPhone(cleanPhone(value))}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </section>

              <section className="border-t border-slate-100 pt-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ReceiptIndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Registration payment
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      The registration fee is fixed by the server at ₹5,000.
                    </p>
                  </div>
                </div>

                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Registration fee
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {formatINR(REGISTRATION_FEE)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
                      Seat reservation
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMode("UPI")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      mode === "UPI"
                        ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <WalletCards className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">UPI</p>
                        <p className="text-xs text-slate-500">
                          Pay using your UPI app
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("BANK_TRANSFER")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      mode === "BANK_TRANSFER"
                        ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Banknote className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Bank transfer
                        </p>
                        <p className="text-xs text-slate-500">
                          NEFT / IMPS / bank transfer
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                  {mode === "UPI" ? (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <WalletCards className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-bold text-slate-900">
                          UPI payment details
                        </p>
                      </div>

                      {UPI_ID ? (
                        <PaymentDetail
                          label="UPI ID"
                          value={UPI_ID}
                          copyable
                        />
                      ) : (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-bold text-amber-900">
                            UPI details are not configured yet.
                          </p>
                          <p className="mt-1 text-xs leading-5 text-amber-800">
                            Configure NEXT_PUBLIC_TECHSKILLHUB_UPI_ID before
                            publishing this payment method.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-bold text-slate-900">
                          Bank transfer details
                        </p>
                      </div>

                      {BANK_NAME || BANK_ACCOUNT_NUMBER ? (
                        <div>
                          <PaymentDetail
                            label="Bank"
                            value={BANK_NAME}
                          />
                          <PaymentDetail
                            label="Account name"
                            value={BANK_ACCOUNT_NAME}
                          />
                          <PaymentDetail
                            label="Account number"
                            value={maskAccount(BANK_ACCOUNT_NUMBER)}
                          />
                          <PaymentDetail
                            label="IFSC"
                            value={BANK_IFSC}
                            copyable
                          />
                          <PaymentDetail
                            label="Branch"
                            value={BANK_BRANCH}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-bold text-amber-900">
                            Bank details are not configured yet.
                          </p>
                          <p className="mt-1 text-xs leading-5 text-amber-800">
                            Configure the TechSkillHub bank environment
                            variables before publishing this payment method.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-5">
                  <Field
                    label="UTR / transaction ID"
                    value={transactionId}
                    onChange={setTransactionId}
                    placeholder="Enter the transaction reference"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Enter the exact transaction reference shown by your bank or
                    UPI app.
                  </p>
                </div>
              </section>

              <section className="border-t border-slate-100 pt-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Payment proof
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Upload a clear screenshot or document showing the payment
                      transaction.
                    </p>
                  </div>
                </div>

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleProofChange}
                    className="sr-only"
                  />

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <UploadCloud className="h-6 w-6 text-blue-600" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-800">
                    {proof ? proof.name : "Upload payment proof"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PDF, JPG, PNG or WEBP · Maximum 10 MB
                  </p>
                </label>
              </section>

              <section className="border-t border-slate-100 pt-8">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-800">
                    Additional note
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </span>

                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Anything our admissions team should know?"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold leading-6 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Payment verification
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your registration is not automatically approved. The
                      TechSkillHub admissions team will verify the transaction
                      and payment proof before marking the registration as
                      confirmed.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loadingCourses}
                className="flex h-13 w-full items-center justify-center gap-2 roundedxl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting registration...
                  </>
                ) : (
                  <>
                    Submit ₹5,000 registration
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                By submitting, you confirm that the payment information and
                applicant details provided are accurate.
              </p>
            </div>
          </form>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ReceiptIndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Registration
                  </p>
                  <p className="text-xl font-bold text-slate-950">
                    {formatINR(REGISTRATION_FEE)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Reserves your application/payment slot",
                  "Payment is manually verified by TechSkillHub",
                  "You receive a unique registration number",
                  "Full admission application follows verification",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm leading-5 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Secure & verified
                  </p>
                  <p className="text-xs text-slate-500">
                    Your payment proof is handled privately.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Registration payment confirms your payment submission for
                verification. It does not by itself mean admission approval or
                enrollment.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/30">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                Need help?
              </p>

              <p className="mt-3 text-lg font-bold">
                Keep your transaction details ready.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                If your payment has already been made, keep the UTR and proof
                available so our admissions team can verify it quickly.
              </p>

              <a
                href="mailto:techskillhubofficial@gmail.com"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-blue-300"
              >
                techskillhubofficial@gmail.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

 "use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ExternalLink,
  Send,
  Save,
  RotateCcw,
  AlertCircle,
  MessageSquareText,
  Award,
} from "lucide-react";

type AssignmentType =
  | "THEORY"
  | "PRACTICAL"
  | "PROJECT"
  | "CASE_STUDY";

type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "GRADED";

type Assignment = {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string | null;
  course: {
    id: string;
    title: string;
  };
  module?: {
    id: string;
    title: string;
  } | null;
  lesson?: {
    id: string;
    title: string;
  } | null;
};

type Submission = {
  id: string;
  status: SubmissionStatus;
  content: string | null;
  submissionUrl: string | null;
  fileUrl: string | null;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

type ApiResponse = {
  assignment: Assignment;
  submission: Submission | null;
};

const typeLabels: Record<AssignmentType, string> = {
  THEORY: "Theory",
  PRACTICAL: "Practical",
  PROJECT: "Project",
  CASE_STUDY: "Case Study",
};

const statusLabels: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  CHANGES_REQUESTED: "Changes Requested",
  GRADED: "Graded",
};

function formatDate(value: string | null) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClasses(status: SubmissionStatus) {
  switch (status) {
    case "GRADED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CHANGES_REQUESTED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "UNDER_REVIEW":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "SUBMITTED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default function AssignmentWorkspace({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [content, setContent] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/student/assignments/${assignmentId}/submission`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load assignment.");
      }

      setData(result);
      setContent(result.submission?.content ?? "");
      setSubmissionUrl(result.submission?.submissionUrl ?? "");
      setFileUrl(result.submission?.fileUrl ?? "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssignment();
  }, [assignmentId]);

  const status = data?.submission?.status ?? null;

  const canEdit = useMemo(() => {
    if (!status) return true;

    return (
      status === "DRAFT" ||
      status === "SUBMITTED" ||
      status === "CHANGES_REQUESTED"
    );
  }, [status]);

  const isResubmission = status === "CHANGES_REQUESTED";

  const save = async (action: "DRAFT" | "SUBMIT" | "RESUBMIT") => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/student/assignments/${assignmentId}/submission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim() || undefined,
            submissionUrl: submissionUrl.trim() || undefined,
            fileUrl: fileUrl.trim() || undefined,
            action,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save submission.");
      }

      setData((current) =>
        current
          ? {
              ...current,
              submission: result.submission,
            }
          : current
      );

      setMessage(
        action === "DRAFT"
          ? "Draft saved successfully."
          : isResubmission
            ? "Assignment resubmitted successfully."
            : "Assignment submitted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save submission."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/student-portal/learning"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to open assignment</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { assignment, submission } = data;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/student-portal/learning"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {typeLabels[assignment.type]}
                  </span>

                  {submission && (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        submission.status
                      )}`}
                    >
                      {statusLabels[submission.status]}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {assignment.title}
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                  {assignment.course.title}
                  {assignment.module ? ` · ${assignment.module.title}` : ""}
                  {assignment.lesson ? ` · ${assignment.lesson.title}` : ""}
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    Assignment Brief
                  </div>

                  <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {assignment.description}
                  </div>
                </div>

                {submission?.feedback && (
                  <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <MessageSquareText className="h-4 w-4" />
                      Mentor / Admin Feedback
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {submission?.status === "GRADED" && (
                  <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                        <Award className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          Final Result
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-950">
                          {submission.score ?? 0}
                          {submission.maxScore !== null
                            ? ` / ${submission.maxScore}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="content"
                      className="mb-2 block text-sm font-semibold text-slate-900"
                    >
                      Your Submission
                    </label>

                    <textarea
                      id="content"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      disabled={!canEdit || saving}
                      maxLength={20000}
                      rows={12}
                      placeholder="Write your answer, explanation, analysis, solution, or project details here..."
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <div className="mt-2 text-right text-xs text-slate-400">
                      {content.length.toLocaleString("en-IN")} / 20,000
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="submissionUrl"
                        className="mb-2 block text-sm font-semibold text-slate-900"
                      >
                        Project / Work URL
                      </label>

                      <input
                        id="submissionUrl"
                        type="url"
                        value={submissionUrl}
                        onChange={(event) =>
                          setSubmissionUrl(event.target.value)
                        }
                        disabled={!canEdit || saving}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="fileUrl"
                        className="mb-2 block text-sm font-semibold text-slate-900"
                      >
                        File URL
                      </label>

                      <input
                        id="fileUrl"
                        type="url"
                        value={fileUrl}
                        onChange={(event) => setFileUrl(event.target.value)}
                        disabled={!canEdit || saving}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                      {message}
                    </div>
                  )}

                  {canEdit ? (
                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => void save("DRAFT")}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Draft
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void save(isResubmission ? "RESUBMIT" : "SUBMIT")
                        }
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isResubmission ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}

                        {isResubmission ? "Resubmit Assignment" : "Submit Assignment"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      {submission?.status === "GRADED"
                        ? "This assignment has been graded."
                        : "Your submission is currently under review."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-950">
                Assignment Details
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-400">Type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {typeLabels[assignment.type]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-400">Due Date</p>
                    <p className="mt-1 text-sm font-semild text-slate-800">
                      {formatDate(assignment.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-400">Submission Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {submission
                        ? statusLabels[submission.status]
                        : "Not started"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {submission?.submissionUrl && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-950">
                  Submitted Work
                </h2>

                <a
                  href={submission.submissionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open Project URL
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {submission?.fileUrl && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-950">
                  Submitted File
                </h2>

                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open File
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-bold text-blue-950">
                Submission guidance
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-900">
                <li>• Save a draft while working.</li>
                <li>• Submit only when your work is ready for review.</li>
                <li>• Check mentor feedback if changes are requested.</li>
                <li>• Resubmit after making the requested improvements.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

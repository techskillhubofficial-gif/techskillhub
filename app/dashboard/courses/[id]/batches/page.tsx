"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Batch = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  startDate: string | null;
  endDate: string | null;
  instructorId: string | null;
  instructor: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  _count?: {
    enrollments: number;
  };
};

type Enrollment = {
  id: string;
  userId: string;
  status: string;
  enrolledAt: string;
  batchId: string | null;
  batch: {
    id: string;
    name: string;
    code: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
};

type Instructor = {
  id: string;
  name: string | null;
  email: string;
  role: "MENTOR" | "ADMIN";
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const STATUS_OPTIONS = [
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
] as const;

function formatDate(value: string | null) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function statusClasses(status: Batch["status"]) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "UPCOMING":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "COMPLETED":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "ARCHIVED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function initials(name: string | null, email: string) {
  const value = name?.trim() || email;

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

export default function BatchManagementPage({ params }: Props) {
  const [courseId, setCourseId] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [studentSearch, setStudentSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "UPCOMING" as Batch["status"],
    startDate: "",
    endDate: "",
    instructorId: "",
  });

  useEffect(() => {
    params.then(({ id }) => setCourseId(id));
  }, [params]);

  async function loadBatches(id = courseId) {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/courses/${id}/batches`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load batches.");
      }

      const nextBatches: Batch[] = Array.isArray(data.batches)
        ? data.batches
        : [];

      setBatches(nextBatches);

      setSelectedBatchId((current) => {
        if (
          current &&
          nextBatches.some((batch) => batch.id === current)
        ) {
          return current;
        }

        return nextBatches[0]?.id || "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load batches.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents(batchId: string) {
    if (!courseId || !batchId) {
      setEnrollments([]);
      return;
    }

    setLoadingStudents(true);
    setError("");

    try {
      const response = await fetch(
        `/api/courses/${courseId}/batches/${batchId}/enrollments`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load students.",
        );
      }

      setEnrollments(
        Array.isArray(data.enrollments)
          ? data.enrollments
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load students.",
      );
    } finally {
      setLoadingStudents(false);
    }
  }

  async function loadInstructors() {
    if (!courseId) return;

    try {
      const response = await fetch("/api/users?role=MENTOR", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      setInstructors(
        Array.isArray(data.users) ? data.users : [],
      );
    } catch {
      // Instructor loading is optional. Batch creation still works.
    }
  }

  useEffect(() => {
    if (!courseId) return;

    void loadBatches(courseId);
    void loadInstructors();
  }, [courseId]);

  useEffect(() => {
    if (!selectedBatchId) {
      setEnrollments([]);
      return;
    }

    void loadStudents(selectedBatchId);
  }, [selectedBatchId]);

  async function createBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!courseId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/courses/${courseId}/batches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            description: form.description.trim() || undefined,
            status: form.status,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            instructorId: form.instructorId || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create batch.",
        );
      }

      setSuccess("Batch created successfully.");

      setForm({
        name: "",
        code: "",
        description: "",
        status: "UPCOMING",
        startDate: "",
        endDate: "",
        instructorId: "",
      });

      setShowCreate(false);

      await loadBatches(courseId);

      if (data.batch?.id) {
        setSelectedBatchId(data.batch.id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create batch.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function assignStudents(enrollmentIds: string[]) {
    if (!courseId || !selectedBatchId || !enrollmentIds.length) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/courses/${courseId}/batches/${selectedBatchId}/enrollments`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollmentIds,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to assign students.",
        );
      }

      setSuccess(
        `${enrollmentIds.length} ${
          enrollmentIds.length === 1 ? "student" : "students"
        } assigned to the batch.`,
      );

      await Promise.all([
        loadStudents(selectedBatchId),
        loadBatches(courseId),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign students.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedBatch =
    batches.find((batch) => batch.id === selectedBatchId) || null;

  const filteredEnrollments = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const name =
        enrollment.user.name?.toLowerCase() || "";

      const email =
        enrollment.user.email.toLowerCase();

      const phone =
        enrollment.user.phone?.toLowerCase() || "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });
  }, [enrollments, studentSearch]);

  if (loading && !courseId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Users className="h-4 w-4" />
            Course Batches
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Batch Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Organize enrolled students into batches, assign mentors,
            and control the attendance roster for each lecture.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowCreate(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create batch
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <Check className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total batches
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-950">
            {batches.length}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Active batches
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-700">
            {
              batches.filter(
                (batch) => batch.status === "ACTIVE",
              ).length
            }
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Selected students
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-700">
            {enrollments.length}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-950">
              Batches
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a batch to manage its students.
            </p>
          </div>

          <div className="max-h-[650px] overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : batches.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-800">
                  No batches yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Create the first batch for this course.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {batches.map((batch) => {
                  const active =
                    batch.id === selectedBatchId;

                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() =>
                        setSelectedBatchId(batch.id)
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-blue-200 bg-blue-50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">
                            {batch.name}
                          </div>
                          <div className="mt-1 text-xs font-semibold tracking-wide text-slate-500">
                            {batch.code}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${statusClasses(
                            batch.status,
                          )}`}
                        >
                          {batch.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {batch._count?.enrollments ?? 0}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(batch.startDate)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          {!selectedBatch ? (
            <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
              <div>
                <Users className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                <h2 className="font-bold text-slate-900">
                  Select a batch
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a batch from the left to manage its students.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-950">
                        {selectedBatch.name}
                      </h2>

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {selectedBatch.code}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses(
                          selectedBatch.status,
                        )}`}
                      >
                        {selectedBatch.status}
                      </span>
                    </div>

                    {selectedBatch.description ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedBatch.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(selectedBatch.startDate)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {formatDate(selectedBatch.endDate)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-4 w-4" />
                      {selectedBatch.instructor?.name ||
                        "No mentor"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-100 p-5">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={studentSearch}
                    onChange={(event) =>
                      setStudentSearch(event.target.value)
                    }
                    placeholder="Search students..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {loadingStudents ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Users className="h-7 w-7 text-slate-400" />
                  </div>

                  <h3 className="font-bold text-slate-900">
                    No students assigned
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    This batch does not have any students assigned yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3">
                          Student
                        </th>
                        <th className="px-5 py-3">
                          Email
                        </th>
                        <th className="px-5 py-3">
                          Enrollment
                        </th>
                        <th className="px-5 py-3 text-right">
                          Batch
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredEnrollments.map(
                        (enrollment) => (
                          <tr
                            key={enrollment.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                                  {initials(
                                    enrollment.user.name,
                                    enrollment.user.email,
                                  )}
                                </div>

                                <div>
                                  <div className="font-semibold text-slate-900">
                                    {enrollment.user.name ||
                                      "Unnamed student"}
                                  </div>

                                  {enrollment.user.phone ? (
                                    <div className="text-xs text-slate-500">
                                      {enrollment.user.phone}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {enrollment.user.email}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                {enrollment.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="text-xs font-semibold text-slate-500">
                                {enrollment.batch?.code ||
                                  "Unassigned"}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Create new batch
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a reusable student group for this course.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={createBatch}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Batch name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Digital Marketing Batch 01"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Batch code
                  </label>
                  <input
                    required
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value.toUpperCase(),
                      })
                    }
                    placeholder="DM-SEP26-01"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Optional batch description..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status:
                            event.target.value as Batch["status"],
                        })
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      {STATUS_OPTIONS.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        startDate: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        endDate: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mentor / instructor
                </label>

                <div className="relative">
                  <select
                    value={form.instructorId}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        instructorId: event.target.value,
                      })
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">
                      No instructor assigned
                    </option>

                    {instructors.map(
                      (instructor) => (
                        <option
                          key={instructor.id}
                          value={instructor.id}
                        >
                          {instructor.name ||
                            instructor.email}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                {instructors.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">
                    No mentors were returned by the available user endpoint.
                    You can create the batch without assigning one.
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {saving ? "Creating..." : "Create batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

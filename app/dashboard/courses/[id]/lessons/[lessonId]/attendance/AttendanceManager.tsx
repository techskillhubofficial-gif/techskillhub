"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Search,
  Users,
  XCircle,
} from "lucide-react";

type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED";

type AttendanceSource =
  | "MANUAL"
  | "GOOGLE_MEET";

type Batch = {
  id: string;
  name: string;
  code: string;
  status: string;
};

type AttendanceRecord = {
  id: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  joinedAt: string | null;
  leftAt: string | null;
  durationMinutes: number | null;
  notes: string | null;
  markedById: string | null;
  createdAt: string;
  updatedAt: string;
};

type Student = {
  enrollmentId: string;
  enrollmentStatus: string;
  enrolledAt: string;
  batchId: string | null;
  batch: Batch | null;
  student: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
  };
  attendance: AttendanceRecord | null;
};

type Props = {
  courseId: string;
  lessonId: string;
};

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
}> = [
  {
    value: "PRESENT",
    label: "Present",
  },
  {
    value: "ABSENT",
    label: "Absent",
  },
  {
    value: "LATE",
    label: "Late",
  },
  {
    value: "EXCUSED",
    label: "Excused",
  },
];

function initials(
  name: string | null | undefined,
  email: string | null | undefined,
) {
  const value =
    name?.trim() ||
    email?.trim() ||
    "Student";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function statusLabel(
  status: AttendanceStatus,
) {
  return (
    STATUS_OPTIONS.find(
      (option) =>
        option.value === status,
    )?.label || status
  );
}

function statusClasses(
  status: AttendanceStatus,
) {
  switch (status) {
    case "PRESENT":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ABSENT":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "LATE":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "EXCUSED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function AttendanceManager({
  courseId,
  lessonId,
}: Props) {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [selectedBatchId, setSelectedBatchId] =
    useState("");

  const [lecture, setLecture] = useState<{
    id: string;
    title: string;
    scheduledAt: string | null;
    endsAt: string | null;
  } | null>(null);

  const [statuses, setStatuses] =
    useState<
      Record<string, AttendanceStatus>
    >({});

  const [sources, setSources] =
    useState<
      Record<string, AttendanceSource>
    >({});

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadBatches =
    useCallback(async () => {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/batches`,
          {
            cache: "no-store",
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load batches.",
          );
        }

        const nextBatches: Batch[] =
          Array.isArray(data.batches)
            ? data.batches
            : [];

        setBatches(nextBatches);

        setSelectedBatchId(
          (current) => {
            if (
              current &&
              nextBatches.some(
                (batch) =>
                  batch.id === current,
              )
            ) {
              return current;
            }

            return nextBatches[0]?.id || "";
          },
        );
      } catch (err) {
        console.error(
          "LOAD BATCHES ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load batches.",
        );
      }
    }, [courseId]);

  const loadAttendance =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const query =
          selectedBatchId
            ? `?batchId=${encodeURIComponent(
                selectedBatchId,
              )}`
            : "";

        const response = await fetch(
          `/api/courses/${courseId}/lessons/${lessonId}/attendance${query}`,
          {
            cache: "no-store",
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load attendance.",
          );
        }

        const records: Student[] =
          Array.isArray(data.records)
            ? data.records.filter(
                (record: unknown): record is Student =>
                  Boolean(record) &&
                  typeof record ===
                    "object",
              )
            : [];

        setStudents(records);

        setLecture(
          data.lecture
            ? {
                id: data.lecture.id,
                title:
                  data.lecture.title,
                scheduledAt:
                  data.lecture
                    .scheduledAt ?? null,
                endsAt:
                  data.lecture.endsAt ??
                  null,
              }
            : null,
        );

        const nextStatuses: Record<
          string,
          AttendanceStatus
        > = {};

        const nextSources: Record<
          string,
          AttendanceSource
        > = {};

        for (const record of records) {
          nextStatuses[
            record.enrollmentId
          ] =
            record.attendance
              ?.status || "ABSENT";

          nextSources[
            record.enrollmentId
          ] =
            record.attendance
              ?.source || "MANUAL";
        }

        setStatuses(nextStatuses);
        setSources(nextSources);
      } catch (err) {
        console.error(
          "LOAD ATTENDANCE ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      courseId,
      lessonId,
      selectedBatchId,
    ]);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  const filteredStudents =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return students;
      }

      return students.filter(
        (record) => {
          const name =
            record.student?.name
              ?.toLowerCase() || "";

          const email =
            record.student?.email
              ?.toLowerCase() || "";

          const phone =
            record.student?.phone
              ?.toLowerCase() || "";

          return (
            name.includes(query) ||
            email.includes(query) ||
            phone.includes(query)
          );
        },
      );
    }, [search, students]);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    for (const student of students) {
      const status =
        statuses[student.enrollmentId] ||
        "ABSENT";

      if (status === "PRESENT") {
        present += 1;
      } else if (status === "ABSENT") {
        absent += 1;
      } else if (status === "LATE") {
        late += 1;
      } else if (status === "EXCUSED") {
        excused += 1;
      }
    }

    return {
      total: students.length,
      present,
      absent,
      late,
      excused,
    };
  }, [students, statuses]);

  const setAll =
    (status: AttendanceStatus) => {
      setStatuses((current) => {
        const next = {
          ...current,
        };

        for (const student of students) {
          next[
            student.enrollmentId
          ] = status;
        }

        return next;
      });
    };

  const saveAttendance =
    async () => {
      if (!students.length) {
        return;
      }

      setSaving(true);
      setError("");
      setMessage("");

      try {
        const response = await fetch(
          `/api/courses/${courseId}/lessons/${lessonId}/attendance`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              batchId:
                selectedBatchId ||
                undefined,
              records: students.map(
                (student) => ({
                  enrollmentId:
                    student.enrollmentId,
                  status:
                    statuses[
                      student.enrollmentId
                    ] || "ABSENT",
                  source:
                    sources[
                      student.enrollmentId
                    ] || "MANUAL",
                  joinedAt:
                    student.attendance
                      ?.joinedAt ??
                    null,
                  leftAt:
                    student.attendance
                      ?.leftAt ??
                    null,
                  durationMinutes:
                    student.attendance
                      ?.durationMinutes ??
                    null,
                  notes:
                    student.attendance
                      ?.notes ??
                    null,
                }),
              ),
            }),
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save attendance.",
          );
        }

        setMessage(
          data.message ||
            `Attendance saved for ${students.length} ${
              students.length === 1
                ? "student"
                : "students"
            }.`,
        );

        await loadAttendance();
      } catch (err) {
        console.error(
          "SAVE ATTENDANCE ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to save attendance.",
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
              Lecture Attendance
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {lecture?.title ||
                "Lecture Attendance"}
            </h1>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {lecture?.scheduledAt
                  ? formatDate(
                      lecture.scheduledAt,
                    )
                  : "Schedule not set"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {counts.total} students
              </span>
            </div>
          </div>

          <div className="min-w-[260px]">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch
            </label>

            <div className="relative">
              <select
                value={selectedBatchId}
                onChange={(event) =>
                  setSelectedBatchId(
                    event.target.value,
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {batches.length === 0 ? (
                  <option value="">
                    No batches available
                  </option>
                ) : (
                  batches.map(
                    (batch) => (
                      <option
                        key={batch.id}
                        value={batch.id}
                      >
                        {batch.name} ·{" "}
                        {batch.code}
                      </option>
                    ),
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-950">
            {counts.total}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Present
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {counts.present}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            Absent
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-700">
            {counts.absent}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Late
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-700">
            {counts.late}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Excused
          </div>
          <div className="mt-1 text-2xl font-bold text-sky-700">
            {counts.excused}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search students..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setAll("PRESENT")
              }
              disabled={
                !students.length ||
                saving
              }
              className="rounded-xl borderer-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all present
            </button>

            <button
              type="button"
              onClick={() =>
                setAll("ABSENT")
              }
              disabled={
                !students.length ||
                saving
              }
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all absent
            </button>

            <button
              type="button"
              onClick={saveAttendance}
              disabled={
                !students.length ||
                saving
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving
                ? "Saving..."
                : "Save attendance"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading attendance...
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4">
              <Users className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900">
              No students in this batch
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Assign active or completed
              course enrollments to this
              batch to manage attendance.
            </p>
          </div>
        ) : filteredStudents.length ===
          0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No students match “{search}”.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">
                    Student
                  </th>
                  <th className="px-5 py-3">
                    Attendance
                  </th>
                  <th className="px-5 py-3">
                    Source
                  </th>
                  <th className="px-5 py-3">
                    Previous
                  </th>
                  <th className="px-5 py-3 text-right">
                    Enrollment
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(
                  (record) => {
                    const student =
                      record.student;

                    const currentStatus =
                      statuses[
                        record.enrollmentId
                      ] || "ABSENT";

                    const currentSource =
                      sources[
                        record.enrollmentId
                      ] || "MANUAL";

                    return (
                      <tr
                        key={
                          record.enrollmentId
                        }
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                              {student?.image ? (
                                <img
                                  src={
                                    student.image
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initials(
                                  student?.name,
                                  student?.email,
                                )
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-semibold text-slate-900">
                                {student?.name ||
                                  "Unnamed student"}
                              </div>
                              <div className="truncate text-xs text-slate-500">
                                {student?.email ||
                                  "No email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={
                              currentStatus
                            }
                            onChange={(
                              event,
                            ) =>
                              setStatuses(
                                (current) => ({
                                  ...current,
                                  [record.enrollmentId]:
                                    event
                                      .target
                                      .value as AttendanceStatus,
                                }),
                              )
                            }
                            disabled={saving}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition focus:ring-4 focus:ring-blue-100 ${statusClasses(
                              currentStatus,
                            )}`}
                          >
                            {STATUS_OPTIONS.map(
                              (option) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={
                              currentSource
                            }
                            onChange={(
                              event,
                            ) =>
                              setSources(
                                (current) => ({
                                  ...current,
                                  [record.enrollmentId]:
                                    event
                                      .target
                                      .value as AttendanceSource,
                                }),
                              )
                            }
                            disabled={saving}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="MANUAL">
                              Manual
                            </option>
                            <option value="GOOGLE_MEET">
                              Google Meet
                            </option>
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          {record.attendance ? (
                            <div className="space-y-1">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                                  record
                                    .attendance
                                    .status,
                                )}`}
                              >
                                {statusLabel(
                                  record
                                    .attendance
                                    .status,
                                )}
                              </span>

                              <div className="text-xs text-slate-400">
                                {formatDate(
                                  record
                                    .attendance
                                    .updatedAt,
                                )}
                              </div>
                            </div>
                      ) : (
                            <span className="text-sm text-slate-400">
                              Not marked
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {record.enrollmentStatus}
                            {record.batch
                              ? ` · ${record.batch.code}`
                              : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Manual attendance can be
              marked directly. Google Meet
              attendance requires actual
              participation timing.
            </span>

            {selectedBatchId ? (
              <span className="font-semibold text-slate-600">
                Batch:{" "}
                {
                  batches.find(
                    (batch) =>
                      batch.id ===
                      selectedBatchId,
                  )?.code
                }
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {students.length > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">
              Attendance is batch-specific.
            </div>
            <div className="mt-1 text-blue-700">
              Only active or completed
              enrollments assigned to the
              selected batch are shown.
              Changing the batch changes the
              attendance roster.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

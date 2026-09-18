"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Enrollment = {
  id: string;

  progress: number;

  status:
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";

  enrolledAt: string;

  course: {
    id: string;
    title: string;
    slug: string;
    duration: string;
  };
};

type Admission = {
  id: string;

  admissionNo: string;

  program: string;

  batchName?: string | null;

  status: string;

  totalFee: number;

  registrationFee: number;

  createdAt: string;
};

type Student = {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  image?: string | null;

  emailVerified: boolean;

  createdAt: string;

  enrollments: Enrollment[];

  admissions: Admission[];

  currentCourse:
    | Enrollment["course"]
    | null;

  currentProgress: number;

  currentEnrollmentStatus:
    | string
    | null;

  currentEnrollmentId:
    | string
    | null;

  latestAdmission:
    | Admission
    | null;
};

type StudentsResponse = {
  success: boolean;

  data?: Student[];

  stats?: {
    total?: number;
    active?: number;
    completed?: number;
    pendingAccounts?: number;
  };

  error?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function statusLabel(
  status: string | null,
) {
  if (!status) {
    return "Not enrolled";
  }

  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function statusClass(
  status: string | null,
) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "CANCELLED":
      return "border-slate-200 bg-slate-50 text-slate-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentsPage() {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [stats, setStats] =
    useState<
      StudentsResponse["stats"]
    >({});

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selected, setSelected] =
    useState<Student | null>(null);

  /* =======================================================
     FETCH STUDENTS
  ======================================================= */

  const fetchStudents =
    useCallback(
      async (refresh = false) => {
        try {
          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const params =
            new URLSearchParams();

          if (search.trim()) {
            params.set(
              "search",
              search.trim(),
            );
          }

          const response =
            await fetch(
              `/api/students${
                params.toString()
                  ? `?${params}`
                  : ""
              }`,
              {
                cache: "no-store",
              },
            );

          const result =
            (await response.json()) as StudentsResponse;

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.error ||
                "Unable to load students.",
            );
          }

          setStudents(
            result.data || [],
          );

          setStats(
            result.stats || {},
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load students.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [search],
    );

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => fetchStudents(),
        250,
      );

    return () =>
      window.clearTimeout(timer);
  }, [fetchStudents]);

  /* =======================================================
     AVERAGE PROGRESS
  ======================================================= */

  const completionAverage =
    useMemo(() => {
      if (!students.length) {
        return 0;
      }

      return Math.round(
        students.reduce(
          (sum, student) =>
            sum +
            student.currentProgress,
          0,
        ) / students.length,
      );
    }, [students]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Students
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Student Workspace
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage enrolled students,
            learning progress and account
            status.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchStudents(true)
          }
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats?.total ?? 0}
          icon={
            <Users className="h-5 w-5" />
          }
        />

        <StatCard
          label="Active"
          value={stats?.active ?? 0}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
        />

        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={
            <BookOpen className="h-5 w-5" />
          }
        />

        <StatCard
          label="Avg. Progress"
          value={`${completionAverage}%`}
          icon={
            <Clock3 className="h-5 w-5" />
          }
        />
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* SEARCH */}

        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search student by name, email or phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ERROR */}

        {error ? (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          /* LOADING */

          <div className="flex min-h-72 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : students.length === 0 ? (
          /* EMPTY */

          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <UserRound className="h-6 w-6 text-slate-400" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-900">
              No students found
            </h2>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Students will appear here
              automatically after an
              admission is enrolled.
            </p>
          </div>
        ) : (
          /* DATA TABLE */

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-4">
                    Student
                  </th>

                  <th className="px-5 py-4">
                    Program
                  </th>

                  <th className="px-5 py-4">
                    Progress
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Joined
                  </th>

                  <th className="px-5 py-4" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map(
                  (student) => (
                    <tr
                      key={student.id}
                      className="group cursor-pointer transition hover:bg-slate-50/70"
                      onClick={() =>
                        setSelected(
                          student,
                        )
                      }
                    >
                      {/* STUDENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                            {student.name
                              .split(" ")
                              .map(
                                (part) =>
                                  part[0],
                              )
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {student.name}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PROGRAM */}

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {student
                            .currentCourse
                            ?.title ||
                            student
                              .latestAdmission
                              ?.program ||
                            "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {student
                            .latestAdmission
                            ?.batchName ||
                            "No batch assigned"}
                        </p>
                      </td>

                      {/* PROGRESS */}

                      <td className="px-5 py-4">
                        <div className="w-40">
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              Progress
                            </span>

                            <span className="font-semibold text-slate-700">
                              {
                                student.currentProgress
                              }
                              %
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{
                                width: `${student.currentProgress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                            student.currentEnrollmentStatus,
                          )}`}
                        >
                          {statusLabel(
                            student.currentEnrollmentStatus,
                          )}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          student.createdAt,
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-blue-600" />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT DETAIL DRAWER */}

      {selected ? (
        <div className="fixed inset-0 z-50">
          {/* BACKDROP */}

          <button
            aria-label="Close student details"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
            onClick={() =>
              setSelected(null)
            }
          />

          {/* DRAWER */}

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            {/* DRAWER HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Student
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {selected.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DRAWER BODY */}

            <div className="space-y-6 p-6">
              {/* PROFILE */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {selected.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selected
                        .currentCourse
                        ?.title ||
                        selected
                          .latestAdmission
                          ?.program ||
                        "Student"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                      selected.currentEnrollmentStatus,
                    )}`}
                  >
                    {statusLabel(
                      selected.currentEnrollmentStatus,
                    )}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ContactItem
                    icon={
                      <Mail className="h-4 w-4" />
                    }
                    value={
                      selected.email
                    }
                  />

                  <ContactItem
                    icon={
                      <Phone className="h-4 w-4" />
                    }
                    value={
                      selected.phone ||
                      "No phone"
                    }
                  />
                </div>
              </div>

              {/* LEARNING */}

              <section>
                <SectionTitle title="Learning" />

                <div className="rounded-2xl border border-slate-200 bg-white">
                  {selected
                    .enrollments
                    .length ? (
                    selected.enrollments.map(
                      (enrollment) => (
                        <div
                          key={
                            enrollment.id
                          }
                          className="border-b border-slate-100 p-4 last:border-0"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {
                                  enrollment
                                    .course
                                    .title
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Enrolled{" "}
                                {formatDate(
                                  enrollment.enrolledAt,
                                )}
                              </p>
                            </div>

                            <span
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(
                                enrollment.status,
                              )}`}
                            >
                              {statusLabel(
                                enrollment.status,
                              )}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs">
                              <span className="text-slate-500">
                                Course progress
                              </span>

                              <span className="font-semibold text-slate-700">
                                {
                                  enrollment.progress
                                }
                                %
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                  width: `${enrollment.progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="p-4 text-sm text-slate-500">
                      No course enrollment
                      found.
                    </p>
                  )}
                </div>
              </section>

              {/* ADMISSION HISTORY */}

              <section>
                <SectionTitle title="Admission history" />

                <div className="rounded-2xl border border-slate-200 bg-white">
                  {selected
                    .admissions
                    .length ? (
                    selected.admissions.map(
                      (admission) => (
                        <div
                          key={
                            admission.id
                          }
                          className="border-b border-slate-100 p-4 last:border-0"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {
                                  admission.admissionNo
                                }
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  admission.program
                                }

                                {admission.batchName
                                  ? ` · ${admission.batchName}`
                                  : ""}
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              ₹
                              {admission.totalFee.toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="p-4 text-sm text-slate-500">
                      No admission history
                      found.
                    </p>
                  )}
                </div>
              </section>

              {/* ACCOUNT */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="font-semibold text-blue-900">
                      Account status
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      {selected.emailVerified
                        ? "Email is verified."
                        : "Email is not verified yet. The student can still be managed from the admin workspace."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
      {title}
    </h3>
  );
}

/* =========================================================
   CONTACT ITEM
========================================================= */

function ContactItem({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
      <span className="shrink-0 text-slate-400">
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}
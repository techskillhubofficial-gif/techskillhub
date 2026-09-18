 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  PlayCircle,
  Presentation,
  ClipboardList,
  Send,
  RotateCcw,
  Award,
} from "lucide-react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  order: number;
};

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

type AssignmentSubmission = {
  id: string;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string | null;
  createdAt: string;
  submission?: AssignmentSubmission | null;
};

type Progress = {
  id: string;
  completed: boolean;
  startedAt: string | null;
  lastViewedAt: string | null;
  completedAt: string | null;
} | null;

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  scheduledAt: string | null;
  endsAt: string | null;
  meetingUrl: string | null;
  presentationUrl: string | null;
  studyMaterialUrl: string | null;
  instructorNotes: string | null;
  resources: Resource[];
  assignments: Assignment[];
  progress: Progress;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
  assignments: Assignment[];
};

type LearningData = {
  success: boolean;
  enrolled: boolean;
  enrollment: {
    id: string;
    status: string;
    enrolledAt: string;
  } | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    duration: string;
    thumbnail: string | null;
    modules: Module[];
  } | null;
  progress: {
    completedLectures: number;
    totalLectures: number;
    percentage: number;
  };
};

const assignmentTypeLabels: Record<AssignmentType, string> = {
  THEORY: "Theory",
  PRACTICAL: "Practical",
  PROJECT: "Project",
  CASE_STUDY: "Case Study",
};

const submissionStatusLabels: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  CHANGES_REQUESTED: "Changes requested",
  GRADED: "Graded",
};

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isUpcoming(value: string | null) {
  return !!value && new Date(value).getTime() > Date.now();
}

function assignmentTypeClasses(type: AssignmentType) {
  switch (type) {
    case "THEORY":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "PRACTICAL":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PROJECT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CASE_STUDY":
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function submissionStatusClasses(status: SubmissionStatus) {
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

function assignmentActionLabel(
  submission: AssignmentSubmission | null | undefined,
) {
  if (!submission) return "Start assignment";

  switch (submission.status) {
    case "DRAFT":
      return "Continue";
    case "CHANGES_REQUESTED":
      return "Resubmit";
    case "GRADED":
      return "View result";
    case "UNDER_REVIEW":
      return "View submission";
    case "SUBMITTED":
      return "View submission";
  }
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const submission = assignment.submission ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <ClipboardList className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="font-semibold text-slate-950">
              {assignment.title}
            </h5>

            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${assignmentTypeClasses(
                assignment.type,
              )}`}
            >
              {assignmentTypeLabels[assignment.type]}
            </span>

            {submission && (
              <span
                className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${submissionStatusClasses(
                  submission.status,
                )}`}
              >
                {submissionStatusLabels[submission.status]}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {assignment.dueDate && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Due {formatDateTime(assignment.dueDate)}
              </span>
            )}

            {submission?.status === "GRADED" &&
              submission.score !== null && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <Award className="h-3.5 w-3.5" />
                  Score {submission.score}
                  {submission.maxScore !== null
                    ? ` / ${submission.maxScore}`
                    : ""}
                </span>
              )}
          </div>
        </div>

        <Link
          href={`/student-portal/assignments/${assignment.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
        >
          {assignmentActionLabel(submission)}
          {submission?.status === "CHANGES_REQUESTED" ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : submission?.status === "GRADED" ? (
            <Award className="h-3.5 w-3.5" />
          ) : submission?.status === "UNDER_REVIEW" ||
            submission?.status === "SUBMITTED" ? (
            <ExternalLink className="h-3.5 w-3.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </Link>
      </div>
    </div>
  );
}

export default function LearningWorkspace({
  initialData,
}: {
  initialData: LearningData;
}) {
  const [data, setData] = useState(initialData);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    initialData.course?.modules.slice(0, 1).map((module) => module.id) ?? [],
  );
  const [updatingLesson, setUpdatingLesson] = useState<string | null>(null);

  const modules = data.course?.modules ?? [];

  const allLessons = useMemo(
    () => modules.flatMap((module) => module.lessons),
    [modules],
  );

  const allAssignments = useMemo(
    () => [
      ...modules.flatMap((module) => module.assignments),
      ...allLessons.flatMap((lesson) => lesson.assignments),
    ],
    [modules, allLessons],
  );

  const nextLesson =
    allLessons.find((lesson) => !lesson.progress?.completed) ?? null;

  const upcomingClasses = allLessons
    .filter((lesson) => isUpcoming(lesson.scheduledAt))
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() -
        new Date(b.scheduledAt!).getTime(),
    )
    .slice(0, 3);

  const assignmentSummary = useMemo(() => {
    const uniqueAssignments = Array.from(
      new Map(allAssignments.map((assignment) => [assignment.id, assignment])).values(),
    );

    return {
      total: uniqueAssignments.length,
      completed: uniqueAssignments.filter(
        (assignment) => assignment.submission?.status === "GRADED",
      ).length,
      pending: uniqueAssignments.filter(
        (assignment) =>
          !assignment.submission ||
          assignment.submission.status === "DRAFT" ||
          assignment.submission.status === "CHANGES_REQUESTED",
      ).length,
    };
  }, [allAssignments]);

  function toggleModule(moduleId: string) {
    setExpandedModules((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId],
    );
  }

  async function markComplete(lesson: Lesson) {
    setUpdatingLesson(lesson.id);

    try {
      const response = await fetch("/api/student/learning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: !lesson.progress?.completed,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update progress.");
      }

      setData((current) => {
        if (!current.course) return current;

        const updatedModules = current.course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((item) =>
            item.id === lesson.id
              ? {
                  ...item,
                  progress: result.progress,
                }
              : item,
          ),
        }));

        const completedLectures = updatedModules
          .flatMap((module) => module.lessons)
          .filter((item) => item.progress?.completed).length;

        const totalLectures = updatedModules.flatMap(
          (module) => module.lessons,
        ).length;

        return {
          ...current,
          course: {
            ...current.course,
            modules: updatedModules,
          },
          progress: {
            completedLectures,
            totalLectures,
            percentage:
              totalLectures > 0
                ? Math.round((completedLectures / totalLectures) * 100)
                : 0,
          },
        };
      });
    } catch (error) {
      console.error(error);
      window.alert(
        "We couldn't update your lecture progress. Please try again.",
      );
    } finally {
      setUpdatingLesson(null);
    }
  }

  if (!data.enrolled || !data.course) {
    return (
      <section className="mx-auto max-w-3xl py-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-950">
            Your learning space is not active yet
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Learning content becomes available after your course enrollment is
            activated by TechSkillHub.
          </p>

          <Link
            href="/student-portal"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                <GraduationCap className="h-4 w-4" />
                My Learning
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {data.course.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
                {data.course.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium">
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {data.course.duration}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {modules.length} {modules.length === 1 ? "Module" : "Modules"}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {data.progress.totalLectures}{" "}
                  {data.progress.totalLectures === 1 ? "Lecture" : "Lectures"}
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-50">
                  Course progress
                </span>
                <span className="font-bold text-white">
                  {data.progress.percentage}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${data.progress.percentage}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-blue-100">
                {data.progress.completedLectures} of{" "}
                {data.progress.totalLectures} lectures completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {assignmentSummary.total > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assignments
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {assignmentSummary.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Graded
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {assignmentSummary.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Needs attention
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {assignmentSummary.pending}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {nextLesson && (
        <section className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <PlayCircle className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Continue learning
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-slate-950">
                  {nextLesson.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lecture {nextLesson.order}
                  {nextLesson.scheduledAt
                    ? ` • ${formatDate(nextLesson.scheduledAt)}`
                    : ""}
                </p>
              </div>
            </div>

            <Link
              href={`/student-portal/learning/${nextLesson.id}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open lecture
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {upcomingClasses.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Live classes
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Upcoming classes
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingClasses.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(lesson.scheduledAt)}
                </div>

                <h3 className="mt-3 font-bold text-slate-950">
                  {lesson.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {formatTime(lesson.scheduledAt)}
                  {lesson.endsAt ? ` – ${formatTime(lesson.endsAt)}` : ""}
                </p>

                {lesson.meetingUrl && (
                  <a
                    href={lesson.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Join Google Meet
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Curriculum
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Course curriculum
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Work through your modules, lectures and assignments as you progress.
          </p>
        </div>

        {modules.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FolderOpen className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-950">
              Curriculum coming soon
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Your course team hasn't published any modules or lectures yet.
              Once they publish the curriculum, it will appear here
              automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((module) => {
              const expanded = expandedModules.includes(module.id);
              const completed = module.lessons.filter(
                (lesson) => lesson.progress?.completed,
              ).length;

              return (
                <div
                  key={module.id}
                  className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                      {String(module.order).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-950">
                        {module.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {completed} of {module.lessons.length} lectures
                        completed
                        {module.assignments.length > 0
                          ? ` • ${module.assignments.length} assignment${
                              module.assignments.length === 1 ? "" : "s"
                            }`
                          : ""}
                      </p>
                    </div>

                    {expanded ? (
                      <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-100">
                      {module.description && (
                        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 text-sm leading-6 text-slate-600 sm:px-6">
                          {module.description}
                        </div>
                      )}

                      {module.assignments.length > 0 && (
                        <div className="border-b border-slate-100 bg-indigo-50/30 px-5 py-5 sm:px-6">
                          <div className="mb-3 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-indigo-600" />
                            <h4 className="text-sm font-bold text-slate-950">
                              Module assignments
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {module.assignments.map((assignment) => (
                              <AssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {module.lessons.length === 0 ? (
                        <div className="px-5 py-6 text-sm text-slate-500 sm:px-6">
                          Lectures for this module have not been published yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="px-5 py-5 sm:px-6"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    lesson.progress?.completed
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {lesson.progress?.completed ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <span className="text-xs font-bold">
                                      {String(lesson.order).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-semibold text-slate-950">
                                      {lesson.title}
                                    </h4>

                                    {lesson.scheduledAt && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                                        <Clock3 className="h-3 w-3" />
                                        {formatDate(lesson.scheduledAt)}
                                      </span>
                                    )}
                                  </div>

                                  {lesson.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                      {lesson.description}
                                    </p>
                                  )}

                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                                    {lesson.resources.length > 0 && (
                                      <span className="inline-flex items-center gap-1">
                                        <FileText className="h-3.5 w-3.5" />
                                        {lesson.resources.length} resource
                                        {lesson.resources.length === 1 ? "" : "s"}
                                      </span>
                                    )}

                                    {lesson.assignments.length > 0 && (
                                      <span className="inline-flex items-center gap-1">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        {lesson.assignments.length} assignment
                                        {lesson.assignments.length === 1 ? "" : "s"}
                                      </span>
                                    )}

                                    {lesson.presentationUrl && (
                                      <span className="inline-flex items-center gap-1">
                                        <Presentation className="h-3.5 w-3.5" />
                                        Presentation
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-2">
                                  <Link
                                    href={`/student-portal/learning/${lesson.id}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    Open
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>

                                  <button
                                    type="button"
                                    disabled={updatingLesson === lesson.id}
                                    onClick={() => markComplete(lesson)}
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                      lesson.progress?.completed
                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                  >
                                    {lesson.progress?.completed
                                      ? "Completed"
                                      : updatingLesson === lesson.id
                                        ? "Saving..."
                                        : "Mark complete"}
                                  </button>
                                </div>
                              </div>

                              {lesson.assignments.length > 0 && (
                                <div className="mt-4 ml-0 border-t border-slate-100 pt-4 sm:ml-14">
                                  <div className="mb-3 flex items-center gap-2">
                                    <Send className="h-3.5 w-3.5 text-blue-600" />
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                      Practice & evaluation
                                    </p>
                                  </div>

                                  <div className="space-y-3">
                                    {lesson.assignments.map((assignment) => (
                                      <AssignmentCard
                                        key={assignment.id}
                                        assignment={assignment}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

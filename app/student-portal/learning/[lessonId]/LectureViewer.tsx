"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  PlayCircle,
  Presentation,
  Sparkles,
} from "lucide-react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  moduleTitle: string;
  scheduledAt: string | null;
  endsAt: string | null;
  meetingUrl: string | null;
  presentationUrl: string | null;
  studyMaterialUrl: string | null;
  instructorNotes: string | null;
  resources: Resource[];
  assignments: Assignment[];
  completed: boolean;
};

type Props = {
  enrollmentId: string;
  course: {
    title: string;
    slug: string;
  };
  lesson: Lesson;
  previousLesson: {
    id: string;
    title: string;
  } | null;
  nextLesson: {
    id: string;
    title: string;
  } | null;
};

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LectureViewer({
  course,
  lesson,
  previousLesson,
  nextLesson,
}: Props) {
  const [completed, setCompleted] = useState(lesson.completed);
  const [saving, setSaving] = useState(false);

  async function toggleComplete() {
    setSaving(true);

    try {
      const response = await fetch("/api/student/learning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update lecture progress.");
      }

      setCompleted(!completed);
    } catch {
      window.alert("Unable to update your lecture progress. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href="/student-portal/learning"
            className="inline-flex items-center gap-2 font-medium transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            My Learning
          </Link>

          <ChevronRight className="h-4 w-4 text-slate-300" />

          <span>{course.title}</span>

          <ChevronRight className="h-4 w-4 text-slate-300" />

          <span className="font-medium text-slate-900">
            {lesson.moduleTitle}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-8 text-white sm:px-8 sm:py-10">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                      Lecture {lesson.order}
                    </span>

                    {completed && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                  </div>

                  <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
                    {lesson.title}
                  </h1>

                  {lesson.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50 sm:text-base">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  {lesson.scheduledAt && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      {formatDate(lesson.scheduledAt)}
                    </div>
                  )}

                  {lesson.meetingUrl && (
                    <a
                      href={lesson.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Join Google Meet
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={toggleComplete}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      completed
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {saving
                      ? "Saving..."
                      : completed
                        ? "Lecture Completed"
                        : "Mark as Complete"}
                  </button>
                </div>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                {(lesson.presentationUrl || lesson.studyMaterialUrl) && (
                  <section>
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Learning Materials
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        Core lecture resources
                      </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {lesson.presentationUrl && (
                        <a
                          href={lesson.presentationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                        >
                          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <Presentation className="h-5 w-5" />
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                Lecture Presentation
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Open the lecture PPT / presentation
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400 transition group-hover:text-blue-600" />
                          </div>
                        </a>
                      )}

                      {lesson.studyMaterialUrl && (
                        <a
                          href={lesson.studyMaterialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                        >
                          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                Study Material
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Open the lecture reading material
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400 transition group-hover:text-blue-600" />
                          </div>
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {lesson.instructorNotes && (
                  <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Instructor Notes
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                          {lesson.instructorNotes}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {lesson.resources.length > 0 && (
                  <section>
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Resources
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        Additional learning resources
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {lesson.resources.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FolderOpen className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
                              {resource.title}
                            </p>
                            {resource.description && (
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {resource.description}
                              </p>
                            )}
                          </div>

                          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {lesson.assignments.length > 0 && (
                  <section>
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Practice
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        Related assignments
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {lesson.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="rounded-2xl border border-slate-200 p-5"
                        >
                          <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <ClipboardList className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold text-slate-900">
                                {assignment.title}
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {assignment.description}
                              </p>

                              {assignment.dueDate && (
                                <p className="mt-3 text-xs font-medium text-slate-500">
                                  Due: {formatDate(assignment.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!lesson.presentationUrl &&
                  !lesson.studyMaterialUrl &&
                  !lesson.resources.length &&
                  !lesson.assignments.length && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-800">
                        Lecture materials are being prepared
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Check back here when your instructor publishes the
                        resources.
                      </p>
                    </div>
                  )}
              </div>
            </section>

            <div className="mt-6 flex items-center justify-between gap-4">
              {previousLesson ? (
                <Link
                  href={`/student-portal/learning/${previousLesson.id}`}
                  className="group flex max-w-[48%] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Previous Lecture
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {previousLesson.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/student-portal/learning/${nextLesson.id}`}
                  className="group flex max-w-[48%] items-center gap-3 rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-right text-white shadow-sm transition hover:bg-blue-700"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-blue-100">
                      Next Lecture
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {nextLesson.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-blue-100" />
                </Link>
              ) : (
                <Link
                  href="/student-portal/learning"
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <GraduationCap className="h-4 w-4" />
                  Back to My Learning
                </Link>
              )}
            </div>
          </main>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Course
                  </p>
                  <h2 className="mt-1 font-bold leading-6 text-slate-900">
                    {course.title}
                  </h2>
                </div>
              </div>

              <Link
                href="/student-portal/learning"
                className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
              >
                View full curriculum
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Your Progress
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    completed
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {completed ? "Completed" : "In Progress"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Lecture {lesson.order}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    completed ? "w-full bg-emerald-500" : "w-1/2 bg-blue-600"
                  }`}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      price: true,
      published: true,
      createdAt: true,
      instructor: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          lessons: true,
          assignments: true,
          enrollments: true,
        },
      },
    },
  });

  const publishedCount = courses.filter((course) => course.published).length;
  const totalLessons = courses.reduce(
    (total, course) => total + course._count.lessons,
    0
  );
  const totalStudents = courses.reduce(
    (total, course) => total + course._count.enrollments,
    0
  );

  return (
    <main className="min-h-full bg-slate-50/60 px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <BookOpen className="h-4 w-4" />
              Education
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Courses
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your TechSkillHub learning programs, curriculum,
              assignments and enrolled students from one place.
            </p>
          </div>

          <Link
            href="/dashboard/courses/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Courses</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {courses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Published Programs
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Enrolled Students
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {totalStudents}
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              No courses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first TechSkillHub learning program to start adding
              lessons, assignments and students.
            </p>

            <Link
              href="/dashboard/courses/new"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="p-6 sm:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            course.published
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              course.published
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                        {course.title}
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {course.description}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                        <span className="font-medium">
                          {course.duration}
                        </span>

                        <span className="font-semibold text-slate-950">
                          ₹{course.price.toLocaleString("en-IN")}
                        </span>

                        {course.instructor?.name && (
                          <span>
                            Instructor:{" "}
                            <span className="font-medium text-slate-800">
                              {course.instructor.name}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Manage Course
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Lessons</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {course._count.lessons}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <ClipboardList className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Assignments</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {course._count.assignments}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <Users className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Students</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {course._count.enrollments}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <p className="mt-6 text-center text-xs text-slate-400">
            {totalLessons} total lessons across all courses
          </p>
        )}
      </div>
    </main>
  );
}

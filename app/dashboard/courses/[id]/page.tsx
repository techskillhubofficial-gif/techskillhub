import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseCurriculumManager from "./CourseCurriculumManager";

export const dynamic = "force-dynamic";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
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
          email: true,
        },
      },
      _count: {
        select: {
          modules: true,
          lessons: true,
          assignments: true,
          enrollments: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          ← Back to Courses
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                  <span>Course Management</span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    {course.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                  {course.title}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {course.description}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 px-5 py-4 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  Course Fee
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  ₹
                  {Math.round(course.price).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <Meta
                label="Duration"
                value={course.duration}
              />

              <Meta
                label="Instructor"
                value={
                  course.instructor?.name ||
                  course.instructor?.email ||
                  "Not assigned"
                }
              />

              <Meta
                label="Created"
                value={course.createdAt.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Modules"
            value={course._count.modules}
          />

          <Stat
            label="Lectures"
            value={course._count.lessons}
          />

          <Stat
            label="Assignments"
            value={course._count.assignments}
          />

          <Stat
            label="Students"
            value={course._count.enrollments}
          />
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Curriculum
          </span>

          <span className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400">
            Assignments
          </span>

          <span className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400">
            Students
          </span>
        </div>

        <CourseCurriculumManager
          courseId={course.id}
        />
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

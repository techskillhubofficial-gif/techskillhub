import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  Headphones,
  Play,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date | null | undefined) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function statusLabel(status?: string | null) {
  if (!status) return "Active";

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function StudentPortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,

      admissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          admissionNo: true,
          status: true,
          batchName: true,
          totalFee: true,
          registrationFee: true,
          balanceFee: true,
          approvedAt: true,
          createdAt: true,
          documents: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              documentType: true,
              status: true,
              createdAt: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              duration: true,
            },
          },
        },
      },

      enrollments: {
        where: {
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
        },
        orderBy: { enrolledAt: "desc" },
        take: 1,
        select: {
          id: true,
          progress: true,
          status: true,
          enrolledAt: true,
          courseId: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              duration: true,
              modules: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  order: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      order: true,
                      scheduledAt: true,
                      endsAt: true,
                      meetingUrl: true,
                      presentationUrl: true,
                      studyMaterialUrl: true,
                    },
                  },
                },
              },
              assignments: {
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                  id: true,
                  title: true,
                  description: true,
                  dueDate: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },

      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          status: true,
          type: true,
          paymentDate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!student) {
    redirect("/login");
  }

  const admission = student.admissions[0] ?? null;
  const enrollment = student.enrollments[0] ?? null;
  const course = enrollment?.course ?? admission?.course ?? null;

  const modules = enrollment?.course.modules ?? [];
  const lessons = modules.flatMap((module) => module.lessons);

  const completedProgress = enrollment
    ? await prisma.lectureProgress.findMany({
        where: {
          enrollmentId: enrollment.id,
          completed: true,
        },
        select: {
          lessonId: true,
        },
      })
    : [];

  const completedIds = new Set(
    completedProgress.map((progress) => progress.lessonId),
  );

  const completedLectures = completedIds.size;
  const totalLectures = lessons.length;

  const calculatedProgress =
    totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : Math.max(0, Math.min(100, enrollment?.progress ?? 0));

  const nextIncompleteLesson =
    lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null;

  const nextScheduledLesson =
    lessons
      .filter(
        (lesson) =>
          lesson.scheduledAt && lesson.scheduledAt.getTime() >= Date.now(),
      )
      .sort(
        (a, b) =>
          (a.scheduledAt?.getTime() ?? 0) -
          (b.scheduledAt?.getTime() ?? 0),
      )[0] ?? null;

  const nextLesson = nextScheduledLesson ?? nextIncompleteLesson;

  const upcomingAssignments =
    enrollment?.course.assignments
      .filter(
        (assignment) =>
          !assignment.dueDate || assignment.dueDate.getTime() >= Date.now(),
      )
      .slice(0, 3) ?? [];

  const admissionDocuments = student.admissions.flatMap(
    (admissionRecord) => admissionRecord.documents,
  );

  const requiredDocuments = admissionDocuments.filter(
    (document) => document.documentType !== "OTHER",
  );

  const verifiedDocuments = requiredDocuments.filter(
    (document) => document.status === "VERIFIED",
  ).length;

  const pendingDocuments = requiredDocuments.filter(
    (document) =>
      document.status !== "VERIFIED" &&
      document.status !== "REJECTED",
  ).length;

  const verifiedPayments = student.payments.filter(
    (payment) => payment.status === "VERIFIED",
  );

  const paidAmount = verifiedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const totalFee = admission ? Number(admission.totalFee) : 0;
  const balanceFee = admission
    ? Number(admission.balanceFee)
    : Math.max(0, totalFee - paidAmount);

  const firstName =
    student.name?.trim().split(/\s+/)[0] || "Student";

  const initials =
    student.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TS";

  const moduleProgress = modules.map((module) => {
    const completed = module.lessons.filter((lesson) =>
      completedIds.has(lesson.id),
    ).length;

    return {
      ...module,
      completed,
      total: module.lessons.length,
      percentage:
        module.lessons.length > 0
          ? Math.round((completed / module.lessons.length) * 100)
          : 0,
    };
  });

  const nextAction = pendingDocuments > 0
    ? {
        label: "Complete your documents",
        detail: `${pendingDocuments} required document${pendingDocuments > 1 ? "s" : ""} still need attention.`,
        href: "/student-portal/documents",
        icon: FileText,
      }
    : nextLesson
      ? {
          label: nextScheduledLesson ? "Your next live class" : "Continue learning",
          detail: nextLesson.title,
          href: `/student-portal/learning/${nextLesson.id}`,
          icon: nextScheduledLesson ? CalendarDays : Play,
        }
      : balanceFee > 0
        ? {
            label: "Payment overview",
            detail: `${formatCurrency(balanceFee)} remaining on your program.`,
            href: "/student-portal/payments",
            icon: CreditCard,
          }
        : {
            label: "Explore your learning space",
            detail: "Your curriculum and academic activity will appear here.",
            href: "/student-portal/learning",
            icon: BookOpen,
          };

  const ActionIcon = nextAction.icon;

  return (
    <div className="space-y-7 pb-10">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] border border-blue-500/20 bg-[linear-gradient(135deg,#0b4fe8_0%,#2563eb_48%,#4338ca_100%)] px-6 py-7 text-white shadow-[0_24px_60px_rgba(37,99,235,0.18)] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-[38%] h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[24%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-white/10" />

        <div className="relative grid gap-9 lg:grid-cols-[1fr_390px] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              TechSkillHub Student OS
            </div>

            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[42px] lg:text-[48px]">
              {getGreeting()}, {firstName}.
            </h1>

            <p className="mt-4 max-w-2xl text-[14px] leading-6 text-blue-50/85 sm:text-[15px]">
              Your complete academic workspace for learning, live classes,
              progress, documents and everything you need to move forward.
            </p>

            {course && (
              <div className="mt-7 flex flex-wrap gap-2.5">
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                    Current program
                  </p>
                  <p className="mt-1 text-[13px] font-bold">{course.title}</p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                    Status
                  </p>
                  <p className="mt-1 text-[13px] font-bold">
                    {statusLabel(admission?.status)}
                  </p>
                </div>

                {course.duration && (
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                      Duration
                    </p>
                    <p className="mt-1 text-[13px] font-bold">
                      {course.duration}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-white/65">
                  Overall course progress
                </p>
                <p className="mt-1 text-[38px] font-bold tracking-[-0.04em]">
                  {calculatedProgress}%
                </p>
              </div>

              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <div
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: `conic-gradient(rgba(255,255,255,0.95) ${calculatedProgress * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
                  }}
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${calculatedProgress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-white/60">
              <span>
                {completedLectures} of {totalLectures} lectures completed
              </span>
              <span>{enrollment ? "Active learning" : "Awaiting enrollment"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI ROW */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/student-portal/learning"
          className="group rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_35px_rgba(37,99,235,0.08)]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Learning
          </p>
          <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            {completedLectures}/{totalLectures}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">Lectures completed</p>
        </Link>

        <Link
          href="/student-portal/calendar"
          className="group rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_35px_rgba(16,185,129,0.08)]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Next class
          </p>
          <p className="mt-1 truncate text-[16px] font-bold text-slate-950">
            {nextScheduledLesson?.title ?? "No class scheduled"}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            {nextScheduledLesson
              ? formatDateTime(nextScheduledLesson.scheduledAt)
              : "Your live classes will appear here"}
          </p>
        </Link>

        <Link
          href="/student-portal/assignments"
          className="group rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_35px_rgba(139,92,246,0.08)]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Assignments
          </p>
          <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            {upcomingAssignments.length}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            Active academic tasks
          </p>
        </Link>

        <Link
          href="/student-portal/payments"
          className="group rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_14px_35px_rgba(245,158,11,0.08)]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-600" />
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Fee balance
          </p>
          <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            {formatCurrency(balanceFee)}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            {formatCurrency(paidAmount)} verified
          </p>
        </Link>
      </section>

      {/* MAIN WORKSPACE */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">

        {/* CONTINUE */}
        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Continue learning
              </p>
              <h2 className="mt-1 text-[21px] font-bold tracking-[-0.03em] text-slate-950">
                Pick up where you left off
              </h2>
            </div>

            <Link
              href="/student-portal/learning"
              className="hidden items-center gap-1 text-[12px] font-bold text-blue-600 sm:flex"
            >
              View learning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6 sm:p-7">
            {nextLesson ? (
              <div className="relative overflow-hidden rounded-[20px] border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-5 sm:p-6">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/50 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">
                        {nextScheduledLesson ? "Upcoming class" : "Next lecture"}
                      </span>

                      {nextLesson.meetingUrl && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                          Live
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-[20px] font-bold tracking-[-0.025em] text-slate-950">
                      {nextLesson.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 max-w-2xl text-[13px] leading-6 text-slate-500">
                      {nextLesson.description ||
                        "Your next learning activity is ready when you are."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500">
                      {nextLesson.scheduledAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDateTime(nextLesson.scheduledAt)}
                        </span>
                      )}

                      {nextLesson.presentationUrl && (
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          Presentation available
                        </span>
                      )}

                      {nextLesson.studyMaterialUrl && (
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          Study material
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/student-portal/learning/${nextLesson.id}`}
                    className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
                  >
                    {nextScheduledLesson ? "View class" : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                  <BookOpen className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-[17px] font-bold text-slate-950">
                  Your learning space is ready
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-[13px] leading-6 text-slate-500">
                  Your course team will publish modules, lectures and live
                  classes here. Everything will appear automatically as it is
                  released.
                </p>

                <Link
                  href="/student-portal/learning"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Open My Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ACADEMIC SNAPSHOT */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Academic snapshot
            </p>
            <h2 className="mt-1 text-[21px] font-bold tracking-[-0.03em] text-slate-950">
              Where you stand
            </h2>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-500">
                  Course progress
                </span>
                <span className="text-[12px] font-bold text-slate-900">
                  {calculatedProgress}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${calculatedProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Modules
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {modules.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Lectures
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {totalLectures}
                </p>
              </div>
            </div>

            <Link
              href="/student-portal/documents"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-slate-900">
                  Documents
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {verifiedDocuments}/{requiredDocuments.length || 0} required
                  documents verified
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* CURRICULUM + ACTION CENTER */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">

        <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Curriculum
              </p>
              <h2 className="mt-1 text-[21px] font-bold tracking-[-0.03em] text-slate-950">
                Your course structure
              </h2>
            </div>

            <Link
              href="/student-portal/learning"
              className="flex items-center gap-1 text-[12px] font-bold text-blue-600"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {moduleProgress.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {moduleProgress.slice(0, 4).map((module) => (
                <div key={module.id} className="px-6 py-5 sm:px-7">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-600">
                          {String(module.order).padStart(2, "0")}
                        </span>
                        <p className="truncate text-[13px] font-bold text-slate-900">
                          {module.title}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-[11px] font-bold text-slate-500">
                      {module.completed}/{module.total}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${module.percentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{module.percentage}% complete</span>
                    <span>
                      {module.total === 0
                        ? "No lectures"
                        : module.completed === module.total
                          ? "Completed"
                          : "In progress"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[14px] font-bold text-slate-900">
                Curriculum not published yet
              </p>
              <p className="mx-auto mt-1 max-w-md text-[12px] leading-5 text-slate-500">
                Your modules and lectures will appear automatically once your
                course team publishes them.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Action center
            </p>
            <h2 className="mt-1 text-[21px] font-bold tracking-[-0.03em] text-slate-950">
              What needs your attention
            </h2>
          </div>

          <div className="p-5">
            <Link
              href={nextAction.href}
              className="group rounded-[20px] border border-blue-100 bg-blue-50/50 p-5 block transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <ActionIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-600">
                    Recommended next step
                  </p>

                  <p className="mt-2 text-[14px] font-bold text-slate-950">
                    {nextAction.label}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {nextAction.detail}
                  </p>
                </div>

                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </div>
            </Link>

            <div className="mt-3 divide-y divide-slate-100 rounded-[20px] border border-slate-200">
              <Link
                href="/student-portal/documents"
                className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-900">
                    Document verification
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {verifiedDocuments} verified
                    {pendingDocuments > 0
                      ? ` · ${pendingDocuments} pending`
                      : " · All required documents complete"}
                  </p>
                </div>
              </Link>

              <Link
                href="/student-portal/payments"
                className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <CreditCard className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-900">
                    Payment overview
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {formatCurrency(paidAmount)} verified ·{" "}
                    {formatCurrency(balanceFee)} balance
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}    <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Your workspace
          </p>
          <h2 className="mt-1 text-[21px] font-bold tracking-[-0.03em] text-slate-950">
            Everything you need
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              href: "/student-portal/learning",
              icon: BookOpen,
              title: "My Learning",
              detail: "Curriculum, lectures and resources",
              className: "text-blue-600 bg-blue-50",
            },
            {
              href: "/student-portal/assignments",
              icon: ClipboardList,
              title: "Assignments",
              detail: "Tasks, submissions and feedback",
              className: "text-violet-600 bg-violet-50",
            },
            {
              href: "/student-portal/attendance",
              icon: UsersRound,
              title: "Attendance",
              detail: "Live class participation",
              className: "text-emerald-600 bg-emerald-50",
            },
            {
              href: "/student-portal/performance",
              icon: Trophy,
              title: "Performance",
              detail: "Results and academic growth",
              className: "text-amber-600 bg-amber-50",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.className}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                </div>

                <p className="mt-6 text-[13px] font-bold text-slate-950">
                  {item.title}
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  {item.detail}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ENROLLMENT FOOTER */}
      {admission && (
        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-bold text-slate-950">
                    {course?.title ?? "Your program"}
                  </p>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                    {statusLabel(admission.status)}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Admission {admission.admissionNo} · Created{" "}
                  {formatDate(admission.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-7 text-right">
              <div className="hidden sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Total fee
                </p>
                <p className="mt-1 text-[14px] font-bold text-slate-950">
                  {formatCurrency(totalFee)}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Balance
                </p>
                <p className="mt-1 text-[14px] font-bold text-slate-950">
                  {formatCurrency(balanceFee)}
                </p>
              </div>

              <Link
                href="/student-portal/payments"
                className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 sm:flex"
              >
                Payments
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SUPPORT */}
      <div className="flex flex-col items-center justify-center gap-2 pt-2 text-center sm:flex-row">
        <Headphones className="h-4 w-4 text-slate-400" />
        <p className="text-[11px] text-slate-500">
          Need help with your learning journey?
        </p>
        <Link
          href="/contact"
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
        >
          Contact TechSkillHub Support
        </Link>
      </div>
    </div>
  );
}

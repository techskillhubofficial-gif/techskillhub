"use client";

import {
  BookOpen,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Target,
} from "lucide-react";

const PLATFORM_ITEMS = [
  {
    icon: BookOpen,
    title: "Courses & Lessons",
    description: "Follow structured learning paths.",
  },
  {
    icon: FolderKanban,
    title: "Projects & Assignments",
    description: "Apply skills through practical work.",
  },
  {
    icon: CheckCircle2,
    title: "Progress Tracking",
    description: "See your learning activity in one place.",
  },
  {
    icon: Target,
    title: "Career Development",
    description: "Stay focused on your next professional step.",
  },
];

export function PlatformExperience() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/70 py-14 md:py-18">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              TechSkillHub Platform
            </span>

            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Everything you need to keep learning, building and progressing.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              TechSkillHub connects structured learning, practical work,
              assignments and progress tracking in one digital experience.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span>A connected workspace for your learning journey</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.3)] md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Your learning workspace
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  One place to learn, work and track progress
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PLATFORM_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">
              <p className="text-sm font-semibold text-blue-950">
                Learn → Build → Track → Prepare
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-700/80">
                A structured experience designed around practical career
                development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

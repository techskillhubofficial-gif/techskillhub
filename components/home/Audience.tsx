"use client";

import {
  BriefcaseBusiness,
  GraduationCap,
  Users,
  Compass,
} from "lucide-react";
import Link from "next/link";

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Build practical skills alongside your education and start creating work you can demonstrate.",
  },
  {
    icon: Compass,
    title: "Graduates",
    description:
      "Move beyond academic knowledge with practical projects, portfolio development and career-focused learning.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Working Professionals",
    description:
      "Develop new skills, explore new directions and strengthen your professional capabilities.",
  },
  {
    icon: Users,
    title: "Aspiring Professionals",
    description:
      "If you are still figuring out your direction, start with guidance and explore the path that fits your goals.",
  },
];

export function Audience() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/70 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Who it is for
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">
            Built for different stages of the career journey.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Whether you are starting out, changing direction or developing new
            capabilities, TechSkillHub gives you a structured place to learn,
            build and grow.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {AUDIENCES.map((audience) => {
            const Icon = audience.icon;

            return (
              <article
                key={audience.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {audience.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {audience.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/consultation"
            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Not sure where you fit? Get Career Guidance
          </Link>
        </div>
      </div>
    </section>
  );
}

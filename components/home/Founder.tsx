"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Code2 } from "lucide-react";

const founders = [
  {
    name: "Manvendrasinh Solanki",
    role: "Co-Founder & CEO",
    icon: BriefcaseBusiness,
    description:
      "Driving the vision, product direction and long-term strategy of TechSkillHub with a focus on practical learning, career development and accessible digital education.",
    tags: ["Vision", "Product", "Growth"],
    accent: "from-blue-600 to-indigo-600",
  },
  {
    name: "Mehul Khatiwal",
    role: "Co-Founder & COO",
    icon: Code2,
    description:
      "Leading execution, operations and learning experience with a focus on structured delivery, design and building a consistent experience for learners.",
    tags: ["Operations", "Design", "Execution"],
    accent: "from-indigo-600 to-violet-600",
  },
];

export function Founder() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Meet the founders
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
            Building the platform behind the learning experience.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            TechSkillHub brings together practical education, technology and
            career development in one connected learning experience.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {founders.map((founder, index) => {
            const Icon = founder.icon;

            return (
              <article
                key={founder.name}
                className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)] md:p-8"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${founder.accent} text-white shadow-lg`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-950 md:text-2xl">
                      {founder.name}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      {founder.role}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-[15px] leading-7 text-slate-600">
                  {founder.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {founder.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="mx-auto mt-10 max-w-5xl rounded-[28px] border border-blue-100 bg-blue-50/60 px-7 py-10 text-center md:px-12 md:py-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            Our mission
          </p>

          <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950 md:text-3xl">
            Building India's future workforce.
          </h3>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
            We are building more than a course library — a connected
            experience where learners can choose a path, develop practical
            skills, build projects, track progress and prepare for the
            workplace.
          </p>

          <Link
            href="/consultation"
            className="mt-7 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-50"
          >
            Get Career Guidance
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

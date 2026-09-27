import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Code2,
  Palette,
  Sparkles,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { flagshipPrograms } from "@/lib/data/programs";

const PROGRAM_ICONS = {
  codeforge: Code2,
  insightiq: BarChart3,
  designsphere: Palette,
  growthx: BriefcaseBusiness,
} as const;

const PROGRAM_TONES = {
  codeforge: {
    card: "border-blue-100 bg-blue-50/40",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  insightiq: {
    card: "border-indigo-100 bg-indigo-50/40",
    icon: "bg-indigo-100 text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700",
  },
  designsphere: {
    card: "border-rose-100 bg-rose-50/40",
    icon: "bg-rose-100 text-rose-600",
    badge: "bg-rose-100 text-rose-700",
  },
  growthx: {
    card: "border-emerald-100 bg-emerald-50/40",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
} as const;

export default function ProgramsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-slate-950">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <Sparkles className="h-4 w-4" />
              Career Programs
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl lg:text-6xl">
              Build skills for the
              <span className="block text-blue-600">
                real world.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg md:leading-8">
              Explore structured programs designed around practical learning,
              real-world projects, portfolio development and career readiness.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Get Career Guidance
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Why TechSkillHub?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="border-b border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Explore programs
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 md:text-4xl">
                Choose the path that fits your goals
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                Each program focuses on a different career direction while
                following the same practical, structured learning approach.
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Online learning
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {flagshipPrograms.map((program) => {
              const Icon =
                PROGRAM_ICONS[program.slug as keyof typeof PROGRAM_ICONS] ??
                Sparkles;

              const tone =
                PROGRAM_TONES[
                  program.slug as keyof typeof PROGRAM_TONES
                ] ?? PROGRAM_TONES.codeforge;

              return (
                <article
                  key={program.slug}
                  className={`group rounded-[28px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 ${tone.card}`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.icon}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone.badge}`}
                    >
                      Online Only
                    </span>
                  </div>

                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {program.category}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-slate-950 md:text-3xl">
                    {program.shortTitle}
                    <span className="text-slate-400">™</span>
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {program.title}
                  </p>

                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
                    {program.description}
                  </p>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/80 bg-white/80 px-3.5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Program fee
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-950">
                        ₹49,999
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/80 bg-white/80 px-3.5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Career support
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        Job placement assistance
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {program.duration}
                    </span>
                    <span className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {program.mode}
                    </span>
                  </div>

                  <Link
                    href={`/programs/${program.slug}`}
                    className="mt-7 inline-flex items-center text-sm font-bold text-blue-700 transition group-hover:text-blue-800"
                  >
                    Explore program
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning model */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                One learning approach
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 md:text-4xl">
                Learn. Build. Track. Grow.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                TechSkillHub brings learning and practical application into
                one connected experience so learners can move from concepts
                to demonstrable work.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Learn", "Build strong foundations through structured learning."],
                ["02", "Build", "Apply concepts through practical projects and tasks."],
                ["03", "Track", "Follow progress across your learning journey."],
                ["04", "Grow", "Develop portfolio and career-readiness skills."],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <span className="text-xs font-bold text-blue-600">
                    {number}
                  </span>

                  <h3 className="mt-3 text-lg font-bold text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-50/70 py-14 md:py-16">
        <div className="mx-auto max-w-5xl px-6 text-center md:px-8">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 md:text-4xl">
            Not sure which program fits you?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Tell us about your current stage, interests and goals. We can help
            you understand the available learning paths.
          </p>

          <Link
            href="/consultation"
            className="mt-7 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Get Career Guidance
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
      <Footer />
    </>
  );
}
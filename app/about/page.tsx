import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const APPROACH = [
  {
    icon: GraduationCap,
    title: "Learn",
    description:
      "Build strong foundations through structured learning designed around practical skills and clear outcomes.",
  },
  {
    icon: Layers3,
    title: "Build",
    description:
      "Apply what you learn through projects, assignments and practical work that helps you demonstrate your capabilities.",
  },
  {
    icon: Target,
    title: "Track",
    description:
      "Follow your learning journey through structured progress, activities and measurable development.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Grow",
    description:
      "Develop the communication, portfolio and career-readiness skills needed to move toward professional opportunities.",
  },
];

const PROGRAMS = [
  {
    name: "CodeForge™",
    title: "AI-Powered Full Stack Engineering",
    description:
      "Modern software development, full-stack engineering and AI-assisted workflows through practical learning.",
    tone: "blue",
  },
  {
    name: "InsightIQ™",
    title: "Data Analytics & GenAI",
    description:
      "Data analysis, dashboards and practical AI applications for solving business and analytical problems.",
    tone: "indigo",
  },
  {
    name: "DesignSphere™",
    title: "UI/UX & Creative Design",
    description:
      "User experience, visual design and creative problem-solving using modern design workflows.",
    tone: "rose",
  },
  {
    name: "GrowthX™",
    title: "Business, Sales & Career Accelerator",
    description:
      "Practical business, sales, marketing, communication and career-development skills.",
    tone: "emerald",
  },
];

const PRINCIPLES = [
  "Practical skills over isolated theory",
  "Projects that demonstrate what you can actually do",
  "Structured learning instead of scattered resources",
  "Career development alongside technical and professional skills",
];

function programTone(tone: string) {
  switch (tone) {
    case "indigo":
      return {
        card: "border-indigo-100 bg-indigo-50/40",
        name: "text-indigo-600",
      };

    case "rose":
      return {
        card: "border-rose-100 bg-rose-50/40",
        name: "text-rose-600",
      };

    case "emerald":
      return {
        card: "border-emerald-100 bg-emerald-50/40",
        name: "text-emerald-600",
      };

    default:
      return {
        card: "border-blue-100 bg-blue-50/40",
        name: "text-blue-600",
      };
  }
}

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden bg-white text-slate-950">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
            <div className="grid items-end gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  About TechSkillHub
                </span>

                <h1 className="mt-7 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 md:text-6xl lg:text-7xl">
                  Building skills for the
                  <span className="block text-blue-600">
                    real world.
                  </span>
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                  TechSkillHub is a digital learning and career-development
                  platform focused on helping learners move from learning
                  concepts to building practical skills, projects and
                  career-ready portfolios.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/programs"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700"
                  >
                    Explore Programs
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/consultation"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    Get Career Guidance
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/15">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      The TechSkillHub approach
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Learn. Build. Track. Grow.
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[
                    "Practical, structured learning",
                    "Real-world project development",
                    "Portfolio-focused progress",
                    "Career development and guidance",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                  What we do
                </p>

                <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 md:text-4xl">
                  Learning should lead somewhere.
                </h2>
              </div>

              <div className="max-w-3xl">
                <p className="text-lg leading-8 text-slate-600">
                  TechSkillHub brings learning, practical work and career
                  development into one connected experience. Instead of
                  treating education as a collection of disconnected lessons,
                  we focus on helping learners understand what they are
                  learning, apply it and build evidence of their skills.
                </p>

                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Our platform is designed for students, graduates, working
                  professionals and aspiring professionals who want a more
                  practical path toward career readiness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                The TechSkillHub approach
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 md:text-4xl">
                Learn skills you can apply in the real world.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                A structured journey that connects learning with practical
                application and career development.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {APPROACH.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-7 text-xl font-bold tracking-[-0.025em] text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="border-y border-slate-200 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                  Our learning philosophy
                </p>

                <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 md:text-4xl">
                  Less passive learning. More practical progress.
                </h2>

                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  We believe learners should be able to connect what they
                  study with something they can create, demonstrate or apply.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="space-y-5">
                  {PRINCIPLES.map((principle, index) => (
                    <div
                      key={principle}
                      className="flex gap-4 border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p className="pt-1 text-sm font-medium leading-6 text-slate-700">
                        {principle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                  Our programs
                </p>

                <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 md:text-4xl">
                  Different paths. One connected learning experience.
                </h2>
              </div>

              <Link
                href="/programs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Explore all programs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {PROGRAMS.map((program) => {
                const tone = programTone(program.tone);

                return (
                  <div
                    key={program.name}
                    className={`rounded-[24px] border p-7 ${tone.card}`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-[0.14em] ${tone.name}`}
                    >
                      {program.name}
                    </p>

                    <h3 className="mt-3 text-xl font-bold tracking-[-0.025em] text-slate-950 md:text-2xl">
                      {program.title}
                    </h3>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                      {program.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="border-t border-slate-200 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                Building India's future workforce
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Learn. Build. Earn.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                TechSkillHub is building a connected learning experience where
                practical skills, projects, progress and career development
                come together.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700"
                >
                  Explore Programs
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  Get Career Guidance
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

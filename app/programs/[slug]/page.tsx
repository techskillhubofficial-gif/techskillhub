import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FolderKanban,
  GraduationCap,
  Palette,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { flagshipPrograms } from "@/lib/data/programs";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const PROGRAM_ICONS = {
  codeforge: Code2,
  insightiq: BarChart3,
  designsphere: Palette,
  growthx: BriefcaseBusiness,
} as const;

const PROGRAM_TONES = {
  codeforge: {
    icon: "bg-blue-100 text-blue-600",
    soft: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },
  insightiq: {
    icon: "bg-indigo-100 text-indigo-600",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-100",
  },
  designsphere: {
    icon: "bg-rose-100 text-rose-600",
    soft: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
  },
  growthx: {
    icon: "bg-emerald-100 text-emerald-600",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
} as const;

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params;

  const program = flagshipPrograms.find((item) => item.slug === slug);

  if (!program) {
    notFound();
  }

  const Icon =
    PROGRAM_ICONS[program.slug as keyof typeof PROGRAM_ICONS] ?? Sparkles;

  const tone =
    PROGRAM_TONES[program.slug as keyof typeof PROGRAM_TONES] ??
    PROGRAM_TONES.codeforge;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-slate-950">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
          <Link
            href="/programs"
            className="inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Programs
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.icon}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone.soft} ${tone.text}`}
                >
                  {program.category}
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Online Only
                </span>
              </div>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                {program.shortTitle}™
              </p>

              <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl lg:text-6xl">
                {program.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-slate-700">
                {program.tagline}
              </p>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {program.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Get Career Guidance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href={`/registration?program=${encodeURIComponent(program.slug)}`}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            <div className={`rounded-[30px] border p-6 ${tone.border} ${tone.soft}`}>
              <div className="rounded-[24px] border border-white bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Program at a glance
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className={`mt-0.5 h-5 w-5 ${tone.text}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Duration
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {program.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Sparkles className={`mt-0.5 h-5 w-5 ${tone.text}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Learning mode
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {program.mode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BriefcaseBusiness className={`mt-0.5 h-5 w-5 ${tone.text}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Career support
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        Job placement assistance
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Program fee
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      ₹49,999
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Registration amount: ₹5,000. The remaining fee is handled through the admissions process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="border-b border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Program overview
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
                What this program is about
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-slate-600">
                {program.overview}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who should join + prerequisites */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-[-0.025em]">
                Who should join?
              </h2>

              <div className="mt-6 grid gap-3">
                {program.whoShouldJoin.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-7 md:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-[-0.025em]">
                Before you start
              </h2>

              <div className="mt-6 grid gap-3">
                {program.prerequisites.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Learning experience
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
              What you will work through
            </h2>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {program.highlights.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${tone.text}`} />
                <span className="text-sm font-medium leading-6 text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Skills & outcomes
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
                Build skills you can demonstrate
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                The learning outcomes below come directly from the current
                program definition.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {program.learningOutcomes.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`mb-3 h-2 w-2 rounded-full ${tone.icon.split(" ")[0]}`} />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Curriculum
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
              A structured learning journey
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              Follow the program month by month, with topics and practical
              work connected to each stage of the journey.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {program.curriculum.map((module) => (
              <details
                key={module.month}
                className="group rounded-2xl border border-slate-200 bg-white"
                open={module.month === 1}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${tone.soft} ${tone.text}`}>
                      {String(module.month).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Month {module.month}
                      </p>

                      <h3 className="mt-1 text-base font-bold text-slate-950 md:text-lg">
                        {module.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xl text-slate-400 transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-slate-100 px-5 pb-6 pt-5 md:px-6">
                  <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    {module.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {module.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className={`mt-5 rounded-xl border p-4 ${tone.border} ${tone.soft}`}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Practical project
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {module.project}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      {program.tools.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Tools & technologies
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
                Tools included in this program
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                The tools below reflect the current program data.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {program.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Practical work
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
                Projects you can build
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                Explore the projects currently defined for this program.
              </p>
            </div>

            <FolderKanban className="hidden h-8 w-8 text-slate-300 md:block" />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {program.projects.map((project, index) => (
              <div
                key={project}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="text-xs font-bold text-blue-600">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-3 text-base font-bold text-slate-950">
                  {project}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Practical project included in the current program structure.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career directions */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Career directions
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
                Where these skills can lead
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                These are the career roles currently associated with this
                program in TechSkillHub&apos;s program data.
              </p>
            </div>

            <div className="flex flex-wrap content-start gap-2.5">
              {program.careerRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-7 md:p-8">
              <Award className="h-6 w-6 text-blue-600" />

              <h2 className="mt-5 text-2xl font-bold">
                Program credentials
              </h2>

              <div className="mt-5 space-y-3">
                {program.certifications.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-7 md:p-8">
              <BriefcaseBusiness className="h-6 w-6 text-indigo-600" />

              <h2 className="mt-5 text-2xl font-bold">
                Career development
              </h2>

              <div className="mt-5 space-y-3">
                {program.careerSupport.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {program.faqs.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-6 md:px-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                FAQ
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">
                Questions about {program.shortTitle}™
              </h2>
            </div>

            <div className="mt-8 space-y-3">
              {program.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-slate-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-5 text-sm font-bold text-slate-900 md:p-6">
                    {faq.question}
                    <span className="text-xl font-normal text-slate-400 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 md:px-6">
                    <p className="text-sm leading-7 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="border-t border-slate-100 bg-slate-50/70 py-14 md:py-16">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-8">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 md:text-4xl">
            Want to understand if this program is right for you?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Speak with TechSkillHub before choosing your learning path.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/consultation"
              className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Career Guidance
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/programs"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Explore Other Programs
            </Link>
          </div>
        </div>
      </section>
    </main>
      <Footer />
    </>
  );
}
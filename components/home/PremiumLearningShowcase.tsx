"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Database,
  Layers3,
  LayoutTemplate,
  Palette,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

type ProgramKey =
  | "codeforge"
  | "insightiq"
  | "designsphere"
  | "growthx";

type Program = {
  key: ProgramKey;
  name: string;
  eyebrow: string;
  description: string;
  accent: string;
  icon: typeof Code2;
  projects: {
    title: string;
    category: string;
    description: string;
    icon: typeof Code2;
  }[];
};

const PROGRAMS: Program[] = [
  {
    key: "codeforge",
    name: "CodeForge™",
    eyebrow: "AI-Powered Full Stack Engineering",
    description:
      "A practical engineering path where technical learning connects with project-based work.",
    accent: "blue",
    icon: Code2,
    projects: [
      {
        title: "E-Commerce Website",
        category: "Web Engineering",
        description:
          "A complete product experience built around real application flows.",
        icon: Layers3,
      },
      {
        title: "Real-Time Chat App",
        category: "Application Development",
        description:
          "A communication product concept focused on interactive application behaviour.",
        icon: Users,
      },
      {
        title: "Learning Management System",
        category: "EdTech Product",
        description:
          "A structured learning platform concept connecting courses, users and progress.",
        icon: LayoutTemplate,
      },
    ],
  },
  {
    key: "insightiq",
    name: "InsightIQ™",
    eyebrow: "Data Analytics & GenAI",
    description:
      "Build analytical thinking through data, dashboards, insights and AI-enabled workflows.",
    accent: "indigo",
    icon: BarChart3,
    projects: [
      {
        title: "Admin Dashboard",
        category: "Analytics",
        description:
          "A data-facing dashboard concept designed to turn information into usable views.",
        icon: BarChart3,
      },
      {
        title: "Business Analytics",
        category: "Decision Support",
        description:
          "An analytical workflow focused on finding useful patterns in business information.",
        icon: Target,
      },
      {
        title: "AI-Assisted Workflow",
        category: "GenAI",
        description:
          "A practical workflow concept combining structured information with AI assistance.",
        icon: Sparkles,
      },
    ],
  },
  {
    key: "designsphere",
    name: "DesignSphere™",
    eyebrow: "UI/UX & Creative Design",
    description:
      "Turn design principles into practical interfaces, visual systems and portfolio-ready work.",
    accent: "violet",
    icon: Palette,
    projects: [
      {
        title: "Product Interface",
        category: "UI/UX",
        description:
          "A digital product interface developed around structure, hierarchy and usability.",
        icon: Palette,
      },
      {
        title: "Website Experience",
        category: "Web Design",
        description:
          "A complete website experience focused on layout, visual communication and interaction.",
        icon: LayoutTemplate,
      },
      {
        title: "Creative Brand System",
        category: "Creative Design",
        description:
          "A visual system bringing together identity, composition and digital communication.",
        icon: Sparkles,
      },
    ],
  },
  {
    key: "growthx",
    name: "GrowthX™",
    eyebrow: "Business, Sales & Career Accelerator",
    description:
      "A practical business and career path connecting communication, sales, marketing and professional execution.",
    accent: "emerald",
    icon: BriefcaseBusiness,
    projects: [
      {
        title: "Business Website",
        category: "Business Project",
        description:
          "A client-facing digital presence developed around business communication.",
        icon: BriefcaseBusiness,
      },
      {
        title: "Marketing Campaign",
        category: "Growth",
        description:
          "A practical campaign concept connecting audience, communication and execution.",
        icon: Target,
      },
      {
        title: "Career Portfolio",
        category: "Career Development",
        description:
          "A structured professional profile bringing practical work together in one place.",
        icon: Users,
      },
    ],
  },
];

const ACCENTS: Record<
  string,
  {
    soft: string;
    text: string;
    border: string;
    gradient: string;
  }
> = {
  blue: {
    soft: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
  },
  indigo: {
    soft: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    gradient: "from-indigo-600 via-blue-600 to-cyan-500",
  },
  violet: {
    soft: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
    gradient: "from-violet-600 via-fuchsia-600 to-indigo-600",
  },
  emerald: {
    soft: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    gradient: "from-emerald-600 via-teal-600 to-blue-600",
  },
};

export function PremiumLearningShowcase() {
  const [activeKey, setActiveKey] = useState<ProgramKey>("codeforge");

  const activeProgram = useMemo(
    () => PROGRAMS.find((program) => program.key === activeKey) ?? PROGRAMS[0],
    [activeKey]
  );

  const handleProgramChange = (key: ProgramKey) => {
    const currentScrollY = window.scrollY;

    setActiveKey(key);

    requestAnimationFrame(() => {
      window.scrollTo({
        top: currentScrollY,
        left: 0,
        behavior: "auto",
      });
    });
  };

  const ProgramIcon = activeProgram.icon;
  const accent = ACCENTS[activeProgram.accent];

  return (
    <section
      className="relative overflow-hidden border-y border-slate-200 bg-[#f8fafc] py-28 md:py-40"
      aria-labelledby="premium-learning-showcase"
      style={{ overflowAnchor: "none" }}
    >
      <div
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-indigo-200/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Learn → Build → Prepare
          </span>

          <h2
            id="premium-learning-showcase"
            className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-7xl"
          >
            Learning should leave you with something you can show.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            Explore how a TechSkillHub learning path can move from structured
            learning into practical work and professional output.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {PROGRAMS.map((program) => {
            const Icon = program.icon;
            const isActive = program.key === activeKey;
            const programAccent = ACCENTS[program.accent];

            return (
              <button
                key={program.key}
                type="button"
                onClick={() => handleProgramChange(program.key)}
                aria-pressed={isActive}
                className={[
                  "group relative overflow-hidden rounded-3xl border bg-white p-5 text-left",
                  "transition-all duration-500",
                  "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5",
                  isActive
                    ? `${programAccent.border} shadow-xl shadow-slate-900/5`
                    : "border-slate-200",
                ].join(" ")}
              >
                {isActive && (
                  <span
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${programAccent.gradient}`}
                  />
                )}

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    isActive
                      ? programAccent.soft + " " + programAccent.text
                      : "bg-slate-100 text-slate-500"
                  } transition-colors duration-300`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <p className="mt-5 text-sm font-bold text-slate-950">
                  {program.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {program.eyebrow}
                </p>

                <div
                  className={`mt-5 flex items-center gap-1 text-xs font-semibold ${
                    isActive ? programAccent.text : "text-slate-400"
                  }`}
                >
                  Explore path
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        <div
          className="mt-10 grid min-h-[620px] overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.35)] lg:grid-cols-[0.68fr_1.32fr]"
        >
          <div className="relative min-h-[620px] overflow-hidden bg-slate-950 p-8 text-white sm:p-12 lg:p-16">
            <div
              className={`absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${accent.gradient} opacity-30 blur-3xl`}
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.soft} ${accent.text}`}
                >
                  <ProgramIcon className="h-6 w-6" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">
                  Learning Path
                </span>
              </div>

              <p className="mt-12 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                {activeProgram.eyebrow}
              </p>

              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {activeProgram.name}
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
                {activeProgram.description}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {["Learn", "Build", "Prepare"].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/35">
                        0{index + 1}
                      </span>

                      <CheckCircle2 className="h-3.5 w-3.5 text-white/60" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={`/programs/${activeProgram.key}`}
                className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
              >
                View program
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Practical work
                </p>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                  Work that can become part of your professional story.
                </h3>
              </div>

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:flex">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {activeProgram.projects.map((project, index) => {
                const ProjectIcon = project.icon;

                return (
                  <article
                    key={project.title}
                    data-tsh-lift
                    className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50/60 p-5 shadow-sm transition-all duration-500 hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.soft} ${accent.text}`}
                      >
                        <ProjectIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-950 sm:text-base">
                            {project.title}
                          </h4>

                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 ring-1 ring-slate-200">
                            {project.category}
                          </span>
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          {project.description}
                        </p>
                      </div>

                      <div className="hidden items-center text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-600 sm:flex">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-5 h-px bg-slate-200/70" />

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                        Practical output
                      </span>

                      <span className="text-[11px] font-medium text-slate-400">
                        Project {index + 1}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Database className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    Built for a connected learning experience
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-800/70">
                    Learning, practical work, progress and career preparation
                    are designed to work together rather than as separate
                    experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Want to understand which path fits you?
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Explore all programs or speak with the TechSkillHub team.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Explore programs
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Talk to us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

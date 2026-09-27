"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Palette,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";

interface Program {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  skills: string[];
}

const programs: Program[] = [
  {
    slug: "codeforge",
    title: "CodeForge™",
    subtitle: "AI-Powered Full Stack Engineering",
    description:
      "Build modern software products with full-stack development, AI-assisted workflows and practical engineering projects.",
    icon: Code2,
    accent: "from-blue-600 to-cyan-500",
    skills: ["React", "Next.js", "Node.js", "AI"],
  },
  {
    slug: "insightiq",
    title: "InsightIQ™",
    subtitle: "Data Analytics & GenAI",
    description:
      "Learn how to build dashboards and apply AI to practical business and analytics problems.",
    icon: BarChart3,
    accent: "from-indigo-600 to-violet-500",
    skills: ["Excel", "SQL", "Power BI", "Python"],
  },
  {
    slug: "designsphere",
    title: "DesignSphere™",
    subtitle: "UI/UX & Creative Design",
    description:
      "Develop user experiences, visual systems and creative work using modern design tools and practical projects.",
    icon: Palette,
    accent: "from-fuchsia-600 to-rose-500",
    skills: ["Figma", "UI/UX", "Branding", "Creative"],
  },
  {
    slug: "growthx",
    title: "GrowthX™",
    subtitle: "Business, Sales & Career Accelerator",
    description:
      "Develop practical skills across business, sales, marketing, communication, entrepreneurship and career development.",
    icon: Rocket,
    accent: "from-blue-700 to-sky-500",
    skills: ["Sales", "Marketing", "Business", "Entrepreneurship"],
  },
];

function ProgramCard({ program }: { program: Program }) {
  const Icon = program.icon;

  return (
    <article
      className="group h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_10px_35px_-25px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_24px_55px_-28px_rgba(37,99,235,0.4)]">
        <div
          className={`mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${program.accent} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
          Career Program
        </p>

        <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {program.title}
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-500">
          {program.subtitle}
        </p>

        <p className="mt-5 flex-1 text-[15px] leading-7 text-slate-600">
          {program.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {program.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>

        <Link
          href={`/programs/${program.slug}`}
          className="mt-7 inline-flex items-center text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Explore program
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export function CareerPaths() {
  return (
    <section
      aria-labelledby="programs-heading"
      className="border-y border-slate-200/70 bg-slate-50/70 py-20 md:py-24"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Career Programs
          </p>

          <h2
            id="programs-heading"
            className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl"
          >
            Choose the path you want to build
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            Structured learning paths designed around practical skills,
            projects and career readiness.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {programs.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
      </Container>
    </section>
  );
}

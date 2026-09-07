"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Rocket,
  Code2,
  Palette,
  BarChart3,
  ArrowRight,
  Clock3,
  MonitorPlay,
  Briefcase,
  Award,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Program {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  mode: string;
  projects: string;
  certificate: string;
  icon: LucideIcon;
  color: string;
  badge: string;
  skills: string[];
}

const programs: Program[] = [
  {
    slug: "growthx",
    title: "GrowthX™",
    subtitle: "Business Growth & Digital Marketing",
    description:
      "Master Sales, Marketing, Communication, Entrepreneurship and AI-powered Business Growth through practical implementation.",
    duration: "9 Months",
    mode: "Live Online",
    projects: "15+ Industry Projects",
    certificate: "Industry Certificate",
    badge: "Most Popular",
    icon: Rocket,
    color: "from-blue-700 via-blue-600 to-sky-500",
    skills: [
      "Sales",
      "Marketing",
      "Branding",
      "Entrepreneurship",
    ],
  },
  {
    slug: "codeforge",
    title: "CodeForge™",
    subtitle: "AI Powered Software Engineering",
    description:
      "Become a Full Stack Software Engineer using React, Next.js, Node.js and modern AI development workflows.",
    duration: "9 Months",
    mode: "Online + Offline",
    projects: "15+ Industry Projects",
    certificate: "Industry Certificate",
    badge: "Best Seller",
    icon: Code2,
    color: "from-indigo-700 via-blue-700 to-cyan-500",
    skills: [
      "React",
      "Next.js",
      "Node.js",
      "AI Development",
    ],
  },
  {
    slug: "designsphere",
    title: "DesignSphere™",
    subtitle: "UI/UX & Creative Design",
    description:
      "Master Figma, Adobe Creative Suite, Branding, UX Research and AI Design workflows.",
    duration: "9 Months",
    mode: "Live Online",
    projects: "15+ Industry Projects",
    certificate: "Industry Certificate",
    badge: "Creative Track",
    icon: Palette,
    color: "from-fuchsia-600 via-pink-500 to-rose-400",
    skills: [
      "Figma",
      "Adobe",
      "UI/UX",
      "Branding",
    ],
  },
  {
    slug: "insightiq",
    title: "InsightIQ™",
    subtitle: "AI Powered Data Analytics",
    description:
      "Learn Excel, SQL, Power BI, Python and AI-powered Business Intelligence with real dashboards.",
    duration: "9 Months",
    mode: "Live Online",
    projects: "15+ Industry Projects",
    certificate: "Industry Certificate",
    badge: "High Demand",
    icon: BarChart3,
    color: "from-violet-700 via-indigo-600 to-sky-500",
    skills: [
      "Excel",
      "SQL",
      "Power BI",
      "Python",
    ],
  },
];
function ProgramCard({ program }: { program: Program }) {
  const Icon = program.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:-translate-y-3 hover:border-blue-300 hover:shadow-2xl">

        {/* Background Glow */}
        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-sky-100 blur-3xl" />
        </div>

        {/* Header */}
        <div
          className={`relative overflow-hidden bg-gradient-to-r ${program.color} p-8 text-white`}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-lg shadow-lg">
              <Icon className="h-8 w-8" />
            </div>

            <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-md">
              {program.badge}
            </span>
          </div>

          <h3 className="mt-8 text-3xl font-bold">
            {program.title}
          </h3>

          <p className="mt-3 text-white/90">
            {program.subtitle}
          </p>
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col p-8">

          <p className="leading-7 text-slate-600">
            {program.description}
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Clock3 className="mb-3 h-5 w-5 text-blue-600" />
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Duration
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {program.duration}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <MonitorPlay className="mb-3 h-5 w-5 text-blue-600" />
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Mode
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {program.mode}
              </p>
            </div>

          </div>

          {/* Features */}
          <div className="mt-8 space-y-4">

            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-slate-700">
                {program.projects}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-slate-700">
                {program.certificate}
              </span>
            </div>

          </div>

          {/* Skills */}
          <div className="mt-8">

            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Core Skills
            </p>

            <div className="flex flex-wrap gap-2">
              {program.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>

          </div>

          {/* Highlights */}
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-slate-700">
                Live Mentor Support
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-slate-700">
                Portfolio & Career Guidance
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-slate-700">
                AI Powered Learning Experience
              </span>
            </div>

          </div>

                  {/* CTA */}
        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Ready to start?
                </p>
                <h4 className="text-lg font-bold text-slate-900">
                  Build Your Career
                </h4>
              </div>

              <div className="rounded-xl bg-blue-100 px-3 py-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <Link
              href={`/programs/${program.slug}`}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] px-6 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              Explore Program
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </motion.article>
);
}

export function CareerPaths() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-28">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-sky-100 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >

          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
            🚀 TechSkill Hub Career Programs
          </span>

          <h2 className="mt-8 text-5xl font-black leading-tight text-slate-900 lg:text-6xl">
            Learn Today.
            <br />
            <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              Build Tomorrow.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-slate-600">
            Premium AI-powered career programs designed with live mentorship,
            practical projects, industry tools, and complete placement support.
          </p>

        </motion.div>

        <div className="mt-20 grid gap-8 lg:grid-cols-2">
          {programs.map((program) => (
            <ProgramCard
              key={program.slug}
              program={program}
            />
          ))}
        </div>

      </div>
    </section>
  );
} 
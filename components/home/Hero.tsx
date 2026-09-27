"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Code2,
  Palette,
  Sparkles,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PROGRAMS = [
  {
    slug: "codeforge",
    title: "CodeForge™",
    description: "AI-Powered Full Stack Engineering",
    skills: "React · Next.js · Node.js · AI",
    icon: Code2,
    iconClass: "bg-blue-50 text-blue-600",
    cardClass: "from-blue-50/90 to-indigo-50/70",
  },
  {
    slug: "insightiq",
    title: "InsightIQ™",
    description: "Data Analytics & GenAI",
    skills: "Excel · SQL · Power BI · Python",
    icon: BarChart3,
    iconClass: "bg-violet-50 text-violet-600",
    cardClass: "from-violet-50/90 to-purple-50/70",
  },
  {
    slug: "designsphere",
    title: "DesignSphere™",
    description: "UI/UX & Creative Design",
    skills: "Figma · UI/UX · Branding · Creative",
    icon: Palette,
    iconClass: "bg-pink-50 text-pink-600",
    cardClass: "from-pink-50/90 to-rose-50/70",
  },
  {
    slug: "growthx",
    title: "GrowthX™",
    description: "Business, Sales & Career Accelerator",
    skills: "Sales · Marketing · Business · Entrepreneurship",
    icon: BriefcaseBusiness,
    iconClass: "bg-emerald-50 text-emerald-600",
    cardClass: "from-emerald-50/90 to-green-50/70",
  },
];

const PILLARS = [
  "Practical Learning",
  "Real-World Projects",
  "Portfolio Development",
  "Career Guidance",
  "AI-Enabled Learning",
];

function ProgramMiniCard({
  program,
}: {
  program: (typeof PROGRAMS)[number];
}) {
  const Icon = program.icon;

  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn(
        "group relative flex min-h-[136px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg",
        program.cardClass,
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            program.iconClass,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
      </div>

      <div className="mt-auto">
        <h3 className="text-sm font-bold text-slate-950">
          {program.title}
        </h3>

        <p className="mt-1.5 text-xs leading-5 text-slate-600">
          {program.description}
        </p>

        <p className="mt-3 text-[10px] font-semibold tracking-wide text-slate-500">
          {program.skills}
        </p>
      </div>
    </Link>
  );
}

function PlatformPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-[600px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-100/70 via-white to-cyan-100/50 blur-3xl"
      />

      <Card className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_24px_65px_-38px_rgba(15,23,42,0.32)]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            </div>

            <CardTitle className="text-xs font-medium text-slate-400">
              TechSkillHub Learning Platform
            </CardTitle>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-500">
            Learning Platform
          </span>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  One structured learning journey
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                  From learning
                  <br />
                  to career readiness.
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                  Learn practical skills, build real projects, develop your
                  portfolio and move toward workplace readiness.
                </p>
              </div>

              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["01", "Learn"],
              ["02", "Build"],
              ["03", "Grow"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-[9px] font-bold text-blue-600">
                  {number}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {PROGRAMS.map((program) => (
              <ProgramMiniCard key={program.slug} program={program} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Hero({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden border-b border-slate-100 bg-white",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-50/70 blur-3xl"
      />

      <Container className="relative max-w-7xl pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12">
        <div
          className="grid items-center gap-9 lg:grid-cols-[0.94fr_1.06fr] lg:gap-12"
        >
          <div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                <span className="text-sm">🇮🇳</span>
                <span>Building India's Future Workforce</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600">
                <span>Learn</span>
                <span className="text-slate-300">|</span>
                <span>Build</span>
                <span className="text-slate-300">|</span>
                <span>Earn</span>
              </div>
            </div>

            <h1
              id="hero-heading"
              className="mt-7 max-w-[640px] text-[3.2rem] font-black leading-[0.96] tracking-[-0.055em] text-slate-950 sm:text-[4rem] lg:text-[4.2rem] xl:text-[4.45rem]"
            >
              <span>Build Future-Ready</span>
              <span className="block bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AI Careers
              </span>
              <span className="block">for India's Next Generation</span>
            </h1>

            <p
              className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg"
            >
              Practical learning, real-world projects, portfolio development
              and career guidance — structured for students, graduates and professionals.
            </p>

            <div
              className="mt-6 flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                className="h-13 rounded-xl bg-blue-600 px-7 text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl"
                nativeButton={false}
                render={<Link href="/programs" />}
              >
                Explore Programs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-13 rounded-xl border-slate-200 bg-white px-7 text-slate-800 shadow-sm hover:bg-slate-50"
                nativeButton={false}
                render={<Link href="/consultation" />}
              >
                Get Career Guidance
              </Button>
            </div>

            <div
              className="mt-7 flex max-w-xl flex-wrap gap-x-5 gap-y-3"
            >
              {PILLARS.map((pillar) => (
                <div
                  key={pillar}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>
                  {pillar}
                </div>
              ))}
            </div>

            <div
              className="mt-9 grid max-w-xl grid-cols-3 border-t border-slate-200 pt-7"
            >
              <div className="pr-5">
                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  4
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Career programs
                </p>
              </div>

              <div className="border-l border-slate-200 px-5">
                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  Project-based
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Learning approach
                </p>
              </div>

              <div className="border-l border-slate-200 pl-5">
                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  AI-enabled
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Learning experience
                </p>
              </div>
            </div>
          </div>

          <PlatformPreview />
        </div>
      </Container>
    </section>
  );
}

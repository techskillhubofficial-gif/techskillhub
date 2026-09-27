"use client";

import {
  ArrowRight,
  BookOpen,
  Compass,
  FolderKanban,
  LineChart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Choose your path",
    description:
      "Explore career programs or speak with us if you are unsure which direction fits your goals.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Learn practical skills",
    description:
      "Follow a structured learning journey with lessons, resources, guidance and hands-on practice.",
  },
  {
    number: "03",
    icon: FolderKanban,
    title: "Build real projects",
    description:
      "Apply your learning through assignments and practical projects that become part of your portfolio.",
  },
  {
    number: "04",
    icon: LineChart,
    title: "Track your progress",
    description:
      "Use the TechSkillHub learning platform to follow your courses, work, submissions and progress.",
  },
  {
    number: "05",
    icon: Sparkles,
    title: "Prepare for the workplace",
    description:
      "Develop the practical confidence, portfolio and career readiness needed to take your next professional step.",
  },
];

export function LearningProcess() {
  return (
    <section className="border-y border-slate-200/70 bg-slate-50/70 py-14 md:py-18">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            How your learning journey works
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
            From learning to workplace readiness
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            A connected journey that brings career guidance, learning,
            projects and progress into one experience.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-slate-200 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative"
                >
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-xs font-bold tracking-[0.14em] text-blue-600">
                      STEP {step.number}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:p-8">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Not sure where to start?
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">
              Talk to us about your career goals.
            </h3>
          </div>

          <Link
            href="/consultation"
            className="group inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
          >
            Get Career Guidance
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

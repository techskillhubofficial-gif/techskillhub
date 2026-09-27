"use client";

import {
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { Container } from "@/components/layout/Container";

const FEATURES = [
  {
    title: "Practical Learning",
    description:
      "Learn concepts through guided sessions and practical application rather than isolated theory.",
    icon: GraduationCap,
  },
  {
    title: "Real-World Projects",
    description:
      "Turn what you learn into projects that help you demonstrate your skills and build your portfolio.",
    icon: FolderKanban,
  },
  {
    title: "Guided Career Development",
    description:
      "Get structured guidance around learning paths, portfolio development and career preparation.",
    icon: BriefcaseBusiness,
  },
  {
    title: "AI-Enabled Learning",
    description:
      "Use modern AI tools and workflows as part of the learning experience across relevant programs.",
    icon: Sparkles,
  },
];

export function WhyTechSkillHub() {

  return (
    <section className="bg-white py-14 md:py-18">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div
            className="max-w-xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
              The TechSkillHub approach
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Learn skills you can apply in the real world.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
              TechSkillHub connects learning, practical work and career
              development in one structured experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

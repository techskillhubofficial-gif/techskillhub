"use client";

import { motion } from "framer-motion";
import {
  Brain,
  BriefcaseBusiness,
  FolderKanban,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Enabled Learning",
    description:
      "Use modern AI tools and workflows as part of relevant learning and practical work.",
  },
  {
    icon: FolderKanban,
    title: "Learn by Building",
    description:
      "Apply concepts through projects and practical tasks that turn learning into demonstrable work.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Portfolio Development",
    description:
      "Build a collection of practical work that helps you demonstrate your skills beyond a certificate.",
  },
  {
    icon: Target,
    title: "Career Development",
    description:
      "Get structured guidance around learning paths, portfolio development and preparation for the workplace.",
  },
];

export function WhyDifferent() {
  return (
    <section className="bg-slate-50 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            The TechSkillHub approach
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
            Built around practical career development.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            The learning experience connects knowledge with practical
            application, projects, portfolio development and career
            preparation.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true }}
                className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

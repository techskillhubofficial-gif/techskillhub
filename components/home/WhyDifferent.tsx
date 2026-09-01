"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Briefcase,
  Users,
  Rocket,
  GraduationCap,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Powered Learning",
    description:
      "Learn with AI tools that improve productivity and prepare you for the future workplace.",
  },
  {
    icon: Briefcase,
    title: "Career First Approach",
    description:
      "Every class, project and assignment is designed to make you job-ready, not exam-ready.",
  },
  {
    icon: Users,
    title: "Live Mentorship",
    description:
      "Daily live sessions, office hours and one-to-one guidance from mentors.",
  },
  {
    icon: Rocket,
    title: "Real Industry Projects",
    description:
      "Build business websites, dashboards, AI applications and portfolio projects throughout the program.",
  },
  {
    icon: GraduationCap,
    title: "Portfolio Driven Learning",
    description:
      "Graduate with a portfolio that demonstrates your skills to employers and clients.",
  },
  {
    icon: Target,
    title: "Career Accelerator",
    description:
      "Resume building, LinkedIn optimisation, mock interviews and placement guidance during Month 9.",
  },
];

export function WhyDifferent() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Why TechSkill Hub?
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Education Built For The Real World
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            We don't believe in passive learning. Every student learns through
            live classes, practical execution, AI-powered workflows and
            continuous mentorship.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <Icon size={30} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
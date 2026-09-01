"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const modules = [
  {
    title: "Module 1",
    subtitle: "Programming Fundamentals",
    topics: ["HTML", "CSS", "JavaScript", "Git & GitHub"],
  },
  {
    title: "Module 2",
    subtitle: "Frontend Development",
    topics: ["React.js", "Next.js", "Tailwind CSS", "TypeScript"],
  },
  {
    title: "Module 3",
    subtitle: "Backend Development",
    topics: ["Node.js", "Express.js", "REST APIs", "Authentication"],
  },
  {
    title: "Module 4",
    subtitle: "Database & Deployment",
    topics: ["MongoDB", "Supabase", "Vercel", "Cloud Deployment"],
  },
];

export function Curriculum() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold">
            📚 Curriculum
          </span>

          <h2 className="text-5xl font-bold mt-4">
            What You'll Learn
          </h2>

          <p className="mt-5 text-slate-600 max-w-2xl mx-auto">
            Our curriculum is structured to take you from beginner to
            industry-ready developer through hands-on learning.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {modules.map((module) => (
            <div
              key={module.title}
              className="rounded-3xl bg-white p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold">
                {module.title}
              </h3>

              <p className="mt-2 text-blue-600 font-semibold">
                {module.subtitle}
              </p>

              <div className="mt-6 space-y-3">
                {module.topics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
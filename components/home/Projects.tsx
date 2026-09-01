"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  MessageSquare,
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  Globe,
} from "lucide-react";

const projects = [
  {
    title: "E-Commerce Website",
    icon: ShoppingCart,
    tech: "Next.js • Node.js • MongoDB",
    description:
      "Build a complete online shopping platform with authentication, cart, checkout and admin dashboard.",
    level: "Advanced",
  },
  {
    title: "Real-Time Chat App",
    icon: MessageSquare,
    tech: "React • Socket.io • Express",
    description:
      "Create a live messaging application with rooms, notifications and real-time communication.",
    level: "Intermediate",
  },
  {
    title: "Admin Dashboard",
    icon: LayoutDashboard,
    tech: "Next.js • Tailwind CSS",
    description:
      "Design analytics dashboards with charts, reports, authentication and role management.",
    level: "Intermediate",
  },
  {
    title: "Learning Management System",
    icon: GraduationCap,
    tech: "Next.js • Supabase",
    description:
      "Develop an LMS with courses, progress tracking, quizzes and student management.",
    level: "Advanced",
  },
  {
    title: "Payment Integration",
    icon: CreditCard,
    tech: "Stripe • Razorpay",
    description:
      "Implement secure payment gateways, subscriptions and order management.",
    level: "Intermediate",
  },
  {
    title: "Business Website",
    icon: Globe,
    tech: "Next.js • SEO",
    description:
      "Build a modern, responsive business website optimized for performance and search engines.",
    level: "Beginner",
  },
];

export function Projects() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 Portfolio Projects
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Projects You'll Build
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            Learn by building real-world applications that strengthen your
            portfolio and prepare you for industry-level work.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const Icon = project.icon;

            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Icon size={30} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  {project.title}
                </h3>

                <p className="mt-3 text-sm font-medium text-blue-600">
                  {project.tech}
                </p>

                <p className="mt-4 text-slate-600">
                  {project.description}
                </p>

                <span className="mt-6 inline-block rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
                  {project.level}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
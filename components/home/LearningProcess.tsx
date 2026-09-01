"use client";

import { motion } from "framer-motion";
import {
  Compass,
  BookOpen,
  MonitorPlay,
  FolderGit2,
  Sparkles,
  Briefcase,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Compass,
    title: "Free Career Consultation",
    description:
      "Understand your goals, strengths and choose the right flagship program with expert guidance.",
  },
  {
    icon: BookOpen,
    title: "Enrollment & Onboarding",
    description:
      "Get LMS access, join the student community, meet mentors and receive your personalized roadmap.",
  },
  {
    icon: MonitorPlay,
    title: "Live Interactive Classes",
    description:
      "Attend live sessions, ask questions, access recordings and learn from industry professionals.",
  },
  {
    icon: FolderGit2,
    title: "Build Real Projects",
    description:
      "Work on weekly assignments, portfolio projects and industry-level capstone applications.",
  },
  {
    icon: Sparkles,
    title: "AI Powered Learning",
    description:
      "Use AI tools, coding assistants and personalized learning recommendations throughout your journey.",
  },
  {
    icon: Briefcase,
    title: "Career Accelerator",
    description:
      "Resume building, LinkedIn optimization, mock interviews and placement assistance until you're job-ready.",
  },
];

const stats = [
  {
    value: "10,000+",
    label: "Students Trained",
  },
  {
    value: "95%",
    label: "Placement Assistance",
  },
  {
    value: "500+",
    label: "Industry Projects",
  },
  {
    value: "150+",
    label: "Hiring Partners",
  },
];

export function LearningProcess() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 How Learning Works
          </span>

          <h2 className="mt-6 text-5xl font-bold">
            Your Journey From Beginner To Professional
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            We don't just teach. We mentor, guide, build projects with you and
            prepare you for real careers.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full rounded-3xl border-0 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <CardContent className="p-8">

                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Icon size={30} />
                    </div>

                    <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                      Step {index + 1}
                    </div>

                    <h3 className="text-2xl font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-4 leading-7 text-slate-600">
                      {step.description}
                    </p>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-3xl border-0 bg-slate-900 text-white shadow-xl"
            >
              <CardContent className="p-8 text-center">
                <h3 className="text-4xl font-bold text-blue-400">
                  {stat.value}
                </h3>

                <p className="mt-3 text-slate-300">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}

        </div>

        <div className="mt-24 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-700 p-12 text-center text-white">

          <h2 className="text-4xl font-bold">
            Ready To Start Your Journey?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            Book a FREE career consultation and get a personalized roadmap
            towards your dream tech career.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-slate-100"
            >
              Book FREE Career Consultation
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-700"
            >
              Explore Programs
            </Button>

          </div>

        </div>

      </div>
    </section>
  );
}
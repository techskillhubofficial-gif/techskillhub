"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock3,
  Laptop,
  GraduationCap,
} from "lucide-react";

import { Program } from "@/lib/data/programs";

interface ProgramHeroProps {
  program: Program;
}

export default function ProgramHero({ program }: ProgramHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              <Award className="h-4 w-4" />
              AI-Powered Career Program
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-6xl">
              {program.title}
            </h1>

            <p className="mt-6 text-2xl font-medium text-blue-100">
              {program.tagline}
            </p>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              {program.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl bg-white px-7 py-4 font-semibold text-slate-900 transition hover:scale-105"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border border-white/30 px-7 py-4 font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Download Brochure
              </Link>

            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">

              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>15+ Industry Projects</span>
              </div>

              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Live Mentorship</span>
              </div>

              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Career Support</span>
              </div>

              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>AI-Powered Learning</span>
              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur">

              <h2 className="text-2xl font-bold text-slate-900">
                Program Overview
              </h2>

              <div className="mt-8 space-y-5">

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Clock3 className="text-blue-600" />
                    <span>Duration</span>
                  </div>
                  <strong>{program.duration}</strong>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Laptop className="text-blue-600" />
                    <span>Learning Mode</span>
                  </div>
                  <strong>{program.mode}</strong>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-blue-600" />
                    <span>Skill Level</span>
                  </div>
                  <strong>{program.level}</strong>
                </div>

                <div className="flex items-center justify-between pb-4">
                  <span>Certification</span>
                  <strong className="text-green-600">
                    Included
                  </strong>
                </div>

              </div>

              <div className="mt-10">

                <h3 className="mb-5 text-lg font-bold">
                  What You'll Learn
                </h3>

                <div className="space-y-3">

                  {program.learningOutcomes.slice(0, 6).map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="mt-1 h-5 w-5 text-blue-600" />

                      <p className="text-slate-700">
                        {item}
                      </p>
                    </div>
                  ))}

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}
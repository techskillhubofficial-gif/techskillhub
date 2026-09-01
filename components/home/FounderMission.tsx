"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, Eye, Heart } from "lucide-react";

export function FounderMission() {
  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-400">
            Founder's Vision
          </span>

          <h2 className="mt-6 text-5xl font-bold leading-tight">
            We Don't Sell Courses.
            <br />
            We Build Careers.
          </h2>

          <p className="mt-8 text-xl leading-8 text-slate-300">
            TechSkill Hub was created with one mission —
            bridge the gap between education and industry.
            Every class, every project and every mentorship session
            is designed to help students become confident professionals,
            not certificate collectors.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
            <Target className="h-10 w-10 text-blue-500" />

            <h3 className="mt-6 text-2xl font-bold">
              Mission
            </h3>

            <p className="mt-4 text-slate-300 leading-7">
              Deliver practical, industry-focused education
              that transforms beginners into skilled professionals
              through live learning, mentorship and real projects.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
            <Eye className="h-10 w-10 text-purple-500" />

            <h3 className="mt-6 text-2xl font-bold">
              Vision
            </h3>

            <p className="mt-4 text-slate-300 leading-7">
              Become India's most trusted career accelerator,
              empowering students with future-ready skills,
              confidence and opportunities across technology,
              business and design.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
            <Heart className="h-10 w-10 text-pink-500" />

            <h3 className="mt-6 text-2xl font-bold">
              Promise
            </h3>

            <p className="mt-4 text-slate-300 leading-7">
              We don't move ahead until you've understood,
              implemented and gained confidence.
              Your success is our responsibility.
            </p>
          </div>

        </div>

        <div className="mt-20 text-center">
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition hover:scale-105">
            Book FREE Career Consultation
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </section>
  );
}
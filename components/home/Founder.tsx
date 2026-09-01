"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Founder() {
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
            Meet The Founders
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Building Careers, Not Just Courses
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            We founded TechSkill Hub with one mission—to bridge the gap between
            traditional education and industry requirements through practical,
            AI-powered and career-focused learning.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Founder 1 */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-10 shadow-lg"
          >
            <div className="flex items-center gap-6">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-5xl text-white">
                👨🏻‍💼
              </div>

              <div>

                <h3 className="text-3xl font-bold text-slate-900">
                  Manvendrasinh Solanki
                </h3>

                <p className="mt-2 text-lg font-semibold text-blue-600">
                  Co-Founder & CEO
                </p>

              </div>

            </div>

            <p className="mt-8 text-lg leading-8 text-slate-600">
              Driving the vision, innovation and long-term strategy of
              TechSkill Hub with a strong focus on helping students build
              real-world skills, confidence and meaningful careers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <span className="rounded-full bg-slate-100 px-4 py-2">
                🚀 Vision
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2">
                💡 Innovation
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2">
                📈 Growth
              </span>

            </div>

          </motion.div>

          {/* Founder 2 */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-10 shadow-lg"
          >
            <div className="flex items-center gap-6">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-5xl text-white">
                👨🏻‍💻
              </div>

              <div>

                <h3 className="text-3xl font-bold text-slate-900">
                  Mehul Khatiwal
                </h3>

                <p className="mt-2 text-lg font-semibold text-purple-600">
                  Co-Founder & COO
                </p>

              </div>

            </div>

            <p className="mt-8 text-lg leading-8 text-slate-600">
              Leading execution, operations and student success by ensuring
              every learner receives world-class mentorship, structured
              learning and continuous support throughout the journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <span className="rounded-full bg-slate-100 px-4 py-2">
                ⚙️ Operations
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2">
                🤝 Student Success
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2">
                📚 Execution
              </span>

            </div>

          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-20 max-w-5xl rounded-[32px] bg-slate-900 p-12 text-center text-white"
        >
          <h3 className="text-4xl font-bold">
            Our Shared Mission
          </h3>

          <p className="mt-8 text-xl leading-9 text-slate-300">
            "We're building more than an EdTech platform. We're creating a
            career ecosystem where students learn by doing, build real
            portfolios, master AI-powered workflows and graduate ready for
            industry—not just exams."
          </p>

          <button className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition hover:scale-105">
            Book FREE Career Consultation
            <ArrowRight size={18} />
          </button>

        </motion.div>

      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";

export function SuccessStories() {
  const stories = [
    {
      name: "Rahul Sharma",
      role: "Frontend Developer",
      company: "TCS",
      package: "₹6.5 LPA",
      story:
        "Completed our MERN Stack program and secured a Frontend Developer role within 3 months.",
    },
    {
      name: "Priya Patel",
      role: "UI/UX Designer",
      company: "Infosys",
      package: "₹7.2 LPA",
      story:
        "Transitioned from a non-IT background into a successful design career.",
    },
    {
      name: "Aman Verma",
      role: "Backend Developer",
      company: "Accenture",
      package: "₹8.0 LPA",
      story:
        "Built real-world projects and cracked multiple technical interviews.",
    },
  ];

  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-400">
            ⭐ Success Stories
          </span>

          <h2 className="mt-6 text-4xl font-bold md:text-5xl">
            Students Who Built Their Careers
          </h2>

          <p className="mt-6 text-lg text-slate-300">
            Our learners gain practical skills, build strong portfolios, and
            land opportunities at leading companies.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {stories.map((student, index) => (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
                {student.name.charAt(0)}
              </div>

              <h3 className="text-2xl font-semibold">
                {student.name}
              </h3>

              <p className="mt-2 text-blue-400">
                {student.role}
              </p>

              <p className="text-slate-400">
                {student.company}
              </p>

              <div className="mt-4 inline-block rounded-full bg-green-500/20 px-3 py-1 text-green-400">
                {student.package}
              </div>

              <p className="mt-6 leading-7 text-slate-300">
                {student.story}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
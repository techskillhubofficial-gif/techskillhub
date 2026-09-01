"use client";

import { motion } from "framer-motion";
import { Calendar, Phone, ArrowRight } from "lucide-react";

export function Consultation() {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
              🚀 Free Career Consultation
            </span>

            <h2 className="mt-6 text-5xl font-bold leading-tight">
              Let's Build Your Career Roadmap Together
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Speak directly with our mentors and discover which career path
              aligns with your goals. Whether you're a student, working
              professional or entrepreneur, we'll help you choose the right
              program.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">
                <Calendar className="text-blue-400" />
                <span>30-Minute One-to-One Career Consultation</span>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="text-blue-400" />
                <span>100% Free • No Obligation</span>
              </div>

              <div className="flex items-center gap-4">
                <ArrowRight className="text-blue-400" />
                <span>Personalized Career Roadmap</span>
              </div>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">

              <h3 className="text-3xl font-bold">
                Book Your FREE Consultation
              </h3>

              <p className="mt-3 text-slate-600">
                Fill in your details and our team will contact you.
              </p>

              <form className="mt-8 space-y-5">

                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600"
                />

                <select className="w-full rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600">
                  <option>Select Career Program</option>
                  <option>GrowthX</option>
                  <option>CodeForge</option>
                  <option>DesignSphere</option>
                  <option>InsightIQ</option>
                </select>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
                >
                  Book FREE Consultation
                </button>

              </form>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
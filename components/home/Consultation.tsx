"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Route, Sparkles } from "lucide-react";

const points = [
  {
    icon: MessageCircle,
    title: "Tell us where you are",
    description: "Share your current stage and what you want to achieve.",
  },
  {
    icon: Route,
    title: "Explore your options",
    description: "Understand which learning path may fit your goals.",
  },
  {
    icon: Sparkles,
    title: "Plan your next step",
    description: "Get practical guidance before deciding what to do next.",
  },
];

export function Consultation() {
  return (
    <section className="border-y border-slate-200 bg-white py-12 text-slate-950 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div
          >
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Career Guidance
            </span>

            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] md:text-4xl lg:text-5xl">
              Not sure which path to take?
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Tell us about your current stage, interests and goals. We can
              help you understand the available learning paths and decide
              what to explore next.
            </p>

            <Link
              href="/consultation"
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-50"
            >
              Get Career Guidance
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div
            className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)] p-6 md:p-7"
          >
            <p className="text-sm font-semibold text-slate-950">
              A simple three-step conversation
            </p>

            <div className="mt-6 space-y-4">
              {points.map((point, index) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.title}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-700">
                          0{index + 1}
                        </span>

                        <h3 className="text-sm font-semibold text-slate-950">
                          {point.title}
                        </h3>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {point.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

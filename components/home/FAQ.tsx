"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Who can learn with TechSkillHub?",
    answer:
      "Our learning paths are designed for students, graduates, working professionals and others who want to develop practical skills for today's workplace.",
  },
  {
    question: "Do I need prior experience?",
    answer:
      "Prior experience depends on the program and learning path. If you are unsure where to start, you can use Career Guidance to discuss your current stage and goals.",
  },
  {
    question: "Will I build practical projects?",
    answer:
      "Practical application and project work are part of the TechSkillHub learning approach, helping learners turn concepts into demonstrable work.",
  },
  {
    question: "How long are the career programs?",
    answer:
      "The current flagship career programs are structured as 9-month learning journeys. Program-specific details are available on each program page.",
  },
  {
    question: "Is TechSkillHub only for students?",
    answer:
      "No. The platform is designed for students, graduates and working professionals who want to build or strengthen practical skills.",
  },
  {
    question: "What if I don't know which program to choose?",
    answer:
      "You can request Career Guidance and share your current stage, interests and goals. The team can help you understand the available paths before you decide.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            FAQ
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
            Questions, answered clearly.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            A few things learners commonly want to know before getting started.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 p-5 text-left md:p-6"
                >
                  <span className="text-base font-semibold text-slate-900 md:text-lg">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600 md:px-6 md:pb-6">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

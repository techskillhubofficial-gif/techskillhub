"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Are all programs 100% live?",
    answer:
      "Yes. Every flagship program is conducted live online with mentors. Session recordings are also available for revision.",
  },
  {
    question: "How long is each program?",
    answer:
      "Every flagship program at TechSkill Hub is a structured 9-month career program focused on practical learning, projects, mentorship and career readiness.",
  },
  {
    question: "Do I need prior experience?",
    answer:
      "No. Our programs are designed for beginners, students, working professionals and career switchers.",
  },
  {
    question: "Will I build real projects?",
    answer:
      "Yes. Throughout the program you'll build portfolio-ready projects that demonstrate your skills to employers and clients.",
  },
  {
    question: "What is placement assistance?",
    answer:
      "We help students with resume building, LinkedIn optimisation, mock interviews, portfolio reviews and career guidance to improve job readiness.",
  },
  {
    question: "Can working professionals join?",
    answer:
      "Absolutely. Our live online format is suitable for students as well as working professionals.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know before starting your journey with
            TechSkill Hub.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200"
            >
              <button
                onClick={() =>
                  setOpen(open === index ? null : index)
                }
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold">
                  {faq.question}
                </span>

                <ChevronDown
                  className={`transition ${
                    open === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open === index && (
                <div className="px-6 pb-6 text-slate-600 leading-7">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

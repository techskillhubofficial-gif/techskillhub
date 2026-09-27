import Link from "next/link";

import ConsultationForm from "@/components/ConsultationForm";

export default function ConsultationPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-700 transition hover:text-blue-600"
          >
            ← Back to TechSkillHub
          </Link>
        </div>
      </section>

      <section className="px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                Career Guidance
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Not sure what to learn next?
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Tell us where you are today and what you want to achieve.
                We’ll help you understand the learning path that may fit your
                goals.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  [
                    "01",
                    "Tell us about yourself",
                    "Share your current stage, interests and goals.",
                  ],
                  [
                    "02",
                    "Explore your options",
                    "Understand the programs and learning paths relevant to you.",
                  ],
                  [
                    "03",
                    "Plan your next step",
                    "Get clear information so you can decide what to do next.",
                  ],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                      {number}
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-950">
                        {title}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs leading-5 text-slate-400">
                Your information is used to respond to your enquiry and
                understand how we can help.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
              <div className="mb-8 border-b border-slate-100 pb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Start here
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Get Career Guidance
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  A few details will help us understand what you are looking
                  for.
                </p>
              </div>

              <ConsultationForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

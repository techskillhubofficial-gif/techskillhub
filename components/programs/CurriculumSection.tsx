import { Program } from "@/lib/data/programs";
import { Calendar, CheckCircle2 } from "lucide-react";

interface CurriculumSectionProps {
  program: Program;
}

export default function CurriculumSection({
  program,
}: CurriculumSectionProps) {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mb-16 text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Curriculum
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            9-Month Learning Roadmap
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            Learn step by step through live classes, practical assignments,
            and industry-level projects.
          </p>
        </div>

        {/* Timeline */}

        <div className="space-y-8">

          {program.curriculum.map((month) => (
            <div
              key={month.month}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-col gap-8 lg:flex-row">

                {/* Left */}

                <div className="lg:w-1/4">

                  <div className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-white">
                    <Calendar className="mr-2 h-5 w-5" />
                    Month {month.month}
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    {month.title}
                  </h3>

                  <p className="mt-4 text-slate-600">
                    {month.description}
                  </p>

                </div>

                {/* Right */}

                <div className="lg:w-3/4">

                  <div className="grid gap-4 md:grid-cols-2">

                    {month.topics.map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600" />

                        <span>{topic}</span>
                      </div>
                    ))}

                  </div>

                  <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">

                    <h4 className="text-lg font-bold">
                      Monthly Project
                    </h4>

                    <p className="mt-2 text-blue-100">
                      {month.project}
                    </p>

                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
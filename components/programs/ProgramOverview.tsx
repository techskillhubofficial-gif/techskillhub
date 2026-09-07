import { Program } from "@/lib/data/programs";
import {
  BookOpen,
  Target,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface ProgramOverviewProps {
  program: Program;
}

export default function ProgramOverview({
  program,
}: ProgramOverviewProps) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            About the Program
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Why Choose {program.shortTitle}?
          </h2>

          <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-600">
            {program.overview}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <BookOpen className="mb-5 h-10 w-10 text-blue-600" />

            <h3 className="mb-3 text-xl font-bold">
              Industry Curriculum
            </h3>

            <p className="text-slate-600">
              Learn modern technologies, AI-assisted development, and industry best practices.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <Sparkles className="mb-5 h-10 w-10 text-purple-600" />

            <h3 className="mb-3 text-xl font-bold">
              AI-Powered Learning
            </h3>

            <p className="text-slate-600">
              Use ChatGPT, Cursor AI, GitHub Copilot, and modern AI workflows to boost productivity.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <Target className="mb-5 h-10 w-10 text-green-600" />

            <h3 className="mb-3 text-xl font-bold">
              Project-Based Learning
            </h3>

            <p className="text-slate-600">
              Build real-world projects that strengthen your portfolio and practical experience.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <Briefcase className="mb-5 h-10 w-10 text-orange-600" />

            <h3 className="mb-3 text-xl font-bold">
              Career Support
            </h3>

            <p className="text-slate-600">
              Resume reviews, LinkedIn optimization, mock interviews, GitHub portfolio, and placement guidance.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
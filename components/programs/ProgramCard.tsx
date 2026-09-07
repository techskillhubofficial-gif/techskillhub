import Link from "next/link";
import { Program } from "@/lib/data/programs";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({
  program,
}: ProgramCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">

        <div className="flex items-center justify-between">

          <h3 className="text-3xl font-bold">
            {program.title}
          </h3>

          <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
            {program.duration}
          </span>

        </div>

        <p className="mt-3 text-blue-100">
          {program.tagline}
        </p>

      </div>

      {/* Body */}
      <div className="p-8">

        <p className="leading-7 text-slate-600">
          {program.description}
        </p>

        {/* Info */}
        <div className="mt-8 grid grid-cols-2 gap-5">

          <div>

            <p className="text-sm text-slate-500">
              Learning Mode
            </p>

            <h4 className="font-semibold">
              {program.mode}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Level
            </p>

            <h4 className="font-semibold">
              {program.level}
            </h4>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

<div className="flex items-center justify-between">

  <div>
    <p className="text-sm text-slate-500">
      Admissions
    </p>

    <h4 className="text-lg font-bold text-green-600">
      Open Now
    </h4>
  </div>

  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
    Limited Seats
  </span>

</div>

<div className="mt-5 grid grid-cols-2 gap-4">

  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Duration
    </p>

    <p className="font-semibold">
      {program.duration}
    </p>
  </div>

  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Mode
    </p>

    <p className="font-semibold">
      {program.mode}
    </p>
  </div>

</div>

</div>
        </div>

        {/* Technologies */}
        <div className="mt-8">

          <h4 className="mb-3 font-semibold">
            Technologies You'll Learn
          </h4>

          <div className="flex flex-wrap gap-2">

            {program.tools.slice(0, 6).map((tool) => (
              <span
                key={tool}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {tool}
              </span>
            ))}

          </div>

        </div>

        {/* Outcomes */}
        <div className="mt-8">

          <h4 className="mb-3 font-semibold">
            Career Outcomes
          </h4>

          <ul className="space-y-2">

            {program.careerRoles.slice(0, 4).map((role) => (
              <li
                key={role}
                className="flex items-center gap-2 text-slate-600"
              >
                <span className="text-blue-600">✓</span>
                {role}
              </li>
            ))}

          </ul>

        </div>

        {/* CTA */}
        <div className="mt-10">

          <Link
            href={`/programs/${program.slug}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Program →
          </Link>

        </div>

      </div>

    </div>
  );
}
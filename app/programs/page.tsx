import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { flagshipPrograms } from "@/lib/data/programs";

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">

          <span className="inline-flex items-center rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur">
            <Sparkles className="mr-2 h-4 w-4" />
            India's AI Career Platform
          </span>

          <h1 className="mt-8 text-5xl font-bold lg:text-6xl">
            Explore Our
            <br />
            Career Programs
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-blue-100">
            Industry-focused career programs built with AI, live mentorship,
            practical projects and career acceleration.
          </p>

        </div>
      </section>

      {/* Programs */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-8 md:grid-cols-2">

            {flagshipPrograms.map((program) => (
              <div
                key={program.slug}
                className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
              >

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                  {program.category}
                </span>

                <h2 className="mt-6 text-3xl font-bold">
                  {program.title}
                </h2>

                <p className="mt-5 text-slate-600">
                  {program.description}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border p-5">
                    <p className="text-sm text-slate-500">
                      Duration
                    </p>

                    <p className="mt-2 font-bold">
                      {program.duration}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-5">
                    <p className="text-sm text-slate-500">
                      Mode
                    </p>

                    <p className="mt-2 font-bold">
                      {program.mode}
                    </p>
                  </div>

                </div>

                <Link
                  href={`/programs/${program.slug}`}
                  className="mt-10 inline-flex items-center rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700"
                >
                  View Program
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

              </div>
            ))}

          </div>

        </div>
      </section>

    </main>
  );
}
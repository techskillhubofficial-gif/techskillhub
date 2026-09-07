import { notFound } from "next/navigation";

import { flagshipPrograms } from "@/lib/data/programs";

import ProgramHero from "@/components/programs/ProgramHero";
import ProgramOverview from "@/components/programs/ProgramOverview";
import CurriculumSection from "@/components/programs/CurriculumSection";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProgramPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const program = flagshipPrograms.find(
    (item) => item.slug === slug
  );

  if (!program) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
  
      <ProgramHero program={program} />
  
      <ProgramOverview program={program} />
  
      <CurriculumSection program={program} />
  
      {/* Technologies */}
<section className="bg-gradient-to-b from-slate-50 to-white py-24">
  <div className="mx-auto max-w-7xl px-6">

    <div className="mx-auto max-w-3xl text-center">
      <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
        Industry Standard Design Tools
      </span>

      <h2 className="mt-6 text-4xl font-bold text-slate-900">
        Technologies & Creative Tools You'll Master
      </h2>

      <p className="mt-5 text-lg leading-8 text-slate-600">
        Learn the same creative software and AI-powered design tools used by
        top design agencies, startups and global product companies to build
        stunning graphics, modern user interfaces and professional digital experiences.
      </p>
    </div>

    <div className="mt-16 flex flex-wrap justify-center gap-4">
      {program.tools.map((tool) => (
        <div
          key={tool}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl"
        >
          {tool}
        </div>
      ))}
    </div>

  </div>
</section>
  
      {/* Projects */}
  
      <section className="py-24">
  
        <div className="mx-auto max-w-7xl px-6">
  
          <div className="text-center">
  
            <h2 className="text-4xl font-bold">
              Industry Projects
            </h2>
  
            <p className="mt-5 text-slate-600">
              Build a portfolio that demonstrates real-world software engineering skills.
            </p>
  
          </div>
  
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
  
            {program.projects.map((project) => (
  
              <div
                key={project}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold">
                  {project}
                </h3>
  
                <p className="mt-4 text-slate-600">
                  Industry-inspired project with hands-on implementation and portfolio-ready outcomes.
                </p>
  
              </div>
  
            ))}
  
          </div>
  
        </div>
  
      </section>
  
    </main>
  );
}
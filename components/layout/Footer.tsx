import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

const programs = [
  { name: "CodeForge™", href: "/programs/codeforge" },
  { name: "InsightIQ™", href: "/programs/insightiq" },
  { name: "DesignSphere™", href: "/programs/designsphere" },
  { name: "GrowthX™", href: "/programs/growthx" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "All Programs", href: "/programs" },
  { name: "Career Guidance", href: "/consultation" },
  { name: "Contact", href: "/contact" },
  { name: "Login", href: "/login" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        {/* Closing CTA */}
        <div className="py-12 md:py-16">
          <div className="rounded-[30px] border border-blue-100 bg-blue-50/70 px-7 py-9 md:px-12 md:py-11">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  YOUR NEXT STEP
                </span>

                <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-slate-950 md:text-3xl">
                  Build skills that move your career forward.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                  Explore our programs or speak with TechSkillHub about the
                  learning path that fits your goals.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/programs"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Explore Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/consultation"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  Get Career Guidance
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="border-t border-slate-200 py-12 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_0.7fr_0.7fr_1fr] lg:gap-14">
            <div className="max-w-md">
              <Link href="/" className="inline-flex">
                <span className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
                  TechSkill<span className="text-blue-600">Hub</span>
                </span>
              </Link>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                TechSkillHub is building India&apos;s future workforce through
                practical learning, real-world projects, structured career
                development and a connected digital learning experience.
              </p>

              <div className="mt-5 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                Building India&apos;s Future Workforce
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950">
                Programs
              </h3>

              <div className="mt-5 space-y-3">
                {programs.map((program) => (
                  <Link
                    key={program.name}
                    href={program.href}
                    className="block text-sm text-slate-600 transition hover:text-blue-600"
                  >
                    {program.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950">
                Company
              </h3>

              <div className="mt-5 space-y-3">
                {companyLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-sm text-slate-600 transition hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950">
                Contact
              </h3>

              <div className="mt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Email
                    </p>

                    <a
                      href="mailto:support@techskillhub.online"
                      className="mt-1 block text-sm text-slate-600 transition hover:text-blue-600"
                    >
                      support@techskillhub.online
                    </a>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-500">
                  Online learning platform serving learners across India.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-slate-200 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 <span className="font-semibold text-slate-700">TechSkillHub</span>.
            All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="transition hover:text-blue-600"
            >
              Contact
            </Link>

            <Link
              href="/login"
              className="transition hover:text-blue-600"
            >
              Login
            </Link>

            <span className="text-slate-300">|</span>

            <span className="font-medium tracking-[0.08em] text-slate-500">
              LEARN · BUILD · EARN
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

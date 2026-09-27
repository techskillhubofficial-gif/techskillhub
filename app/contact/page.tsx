import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Globe2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const CONTACT_OPTIONS = [
  {
    icon: MessageCircle,
    label: "Career Guidance",
    title: "Not sure which path to choose?",
    description:
      "Talk with our team about your interests, goals and the program that may fit your direction.",
    href: "/consultation",
    action: "Get Career Guidance",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: Globe2,
    label: "Programs",
    title: "Explore TechSkillHub programs",
    description:
      "Compare our career-focused programs and understand what you can learn, build and work toward.",
    href: "/programs",
    action: "Explore Programs",
    tone: "bg-indigo-50 text-indigo-600",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-100 bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-12rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-blue-50/80 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-indigo-50/60 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-10 lg:pb-24 lg:pt-20">
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Contact TechSkillHub
                </div>

                <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Have a question?
                  <span className="block bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Let&apos;s talk.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Whether you are exploring a program, preparing for admission
                  or looking for career guidance, our team is here to help you
                  take the next step.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/consultation"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-16px_rgba(37,99,235,0.7)] transition hover:bg-blue-700"
                  >
                    Get Career Guidance
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/programs"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    Explore Programs
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  TechSkillHub
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-[-0.025em] text-slate-950">
                  Building India&apos;s Future Workforce
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Learn practical skills, build meaningful projects and move
                  toward career readiness through a structured learning
                  experience.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    ["Learn", "Skills"],
                    ["Build", "Projects"],
                    ["Grow", "Career"],
                  ].map(([title, label]) => (
                    <div
                      key={title}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <p className="text-xs font-bold text-blue-600">{title}</p>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact details */}
        <section className="bg-slate-50/70 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Reach us directly
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Choose the easiest way to connect.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                For program questions, admissions and general enquiries, you
                can contact TechSkillHub directly.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Email
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  General Enquiries
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Admissions, programs and general support.
                </p>

                <a
                  href="mailto:support@techskillhub.online"
                  className="mt-5 block break-all text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  support@techskillhub.online
                </a>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Phone className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Phone
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  Admissions & Enquiries
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Speak directly with the TechSkillHub team.
                </p>

                <div className="mt-5 space-y-2">
                  <a
                    href="tel:+918769951887"
                    className="block text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    +91 87699 51887
                  </a>

                  <a
                    href="tel:+919528404249"
                    className="block text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    +91 95284 04249
                  </a>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Globe2 className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Learning
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  Online Programs
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  TechSkillHub programs are delivered online for learners
                  across India.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Clock3 className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Availability
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  Monday – Saturday
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  9:00 AM – 7:00 PM (IST)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Help paths */}
        <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-5 md:grid-cols-2">
              {CONTACT_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <div
                    key={option.title}
                    className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_25px_65px_-42px_rgba(37,99,235,0.35)] sm:p-8"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${option.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      {option.label}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-slate-950">
                      {option.title}
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      {option.description}
                    </p>

                    <Link
                      href={option.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3 group-hover:text-blue-700"
                    >
                      {option.action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-slate-100 bg-slate-50/70 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Start with a conversation
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Not sure what to do next?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Share what you are looking to learn or achieve, and start with
              the right conversation.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Get Career Guidance
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="mailto:support@techskillhub.online"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                Email Support
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

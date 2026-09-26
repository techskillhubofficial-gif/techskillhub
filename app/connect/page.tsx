import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ConnectEnquiryForm } from "@/components/connect/ConnectEnquiryForm";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Download,
  FolderKanban,
  Globe2,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Connect | TechSkillHub",
  description:
    "Explore TechSkillHub programs, connect with our team, and discover your path to skills, projects, experience and career growth.",
};

const leaders = [
  {
    name: "Manvendrasinh Solanki",
    role: "Founder & CEO",
    phone: "+91 87699 51887",
    rawPhone: "918769951887",
    contact: "/contacts/manvendrasinh-solanki.vcf",
  },
  {
    name: "Mehul Khatiwal",
    role: "Co-Founder & Director",
    phone: "+91 95284 04249",
    rawPhone: "919528404249",
    contact: "/contacts/mehul-khatiwal.vcf",
  },
];

const programs = [
  {
    number: "01",
    name: "CodeForge™",
    category: "Technology",
    description: "AI-Powered Full Stack Engineering",
    href: "/programs/codeforge",
    icon: BriefcaseBusiness,
  },
  {
    number: "02",
    name: "InsightIQ™",
    category: "Data & AI",
    description: "Data Analytics & GenAI",
    href: "/programs/insightiq",
    icon: TrendingUp,
  },
  {
    number: "03",
    name: "DesignSphere™",
    category: "Design",
    description: "UI/UX & Creative Design",
    href: "/programs/designsphere",
    icon: Sparkles,
  },
  {
    number: "04",
    name: "GrowthX™",
    category: "Business",
    description: "Business, Sales & Career Accelerator",
    href: "/programs/growthx",
    icon: Users,
  },
];

const pillars = [
  {
    icon: BookOpen,
    title: "Skills",
    text: "Learn from experts",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    text: "Build real work",
  },
  {
    icon: Users,
    title: "Experience",
    text: "Gain industry exposure",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    text: "Create better opportunities",
  },
];

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.4"
        cy="6.6"
        r="0.9"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function BlueArrow() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
      <ArrowUpRight className="h-4 w-4" />
    </span>
  );
}

export default function ConnectPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#EEF4FF] text-[#0F172A]">
      <div className="mx-auto min-h-screen max-w-[1180px] overflow-hidden bg-white shadow-[0_24px_90px_rgba(15,23,42,0.12)] sm:my-4 sm:rounded-[30px] lg:my-8 lg:border lg:border-white/80">

        {/* ============================================================
            TOP BRAND BAR
        ============================================================ */}
        <header className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
          <Link href="/" aria-label="TechSkillHub home">
            <Image
              src="/logo/Full-logo.png"
              alt="TechSkillHub"
              width={846}
              height={295}
              priority
              className="h-auto w-[170px] sm:w-[195px]"
            />
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden h-px w-7 bg-[#2563EB] sm:block" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#2563EB] sm:text-[9px]">
              Digital Connect
            </span>
          </div>
        </header>

        {/* ============================================================
            HERO
        ============================================================ */}
        <section className="relative overflow-hidden bg-white">
          {/* Decorative card geometry */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-[330px] w-[330px] rounded-full bg-[#2563EB]/[0.055] blur-[1px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-0 h-[170px] w-[430px] origin-top-right -rotate-[18deg] bg-gradient-to-r from-transparent via-[#60A5FA]/20 to-[#2563EB]/20"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-80px] top-[82px] h-[70px] w-[390px] -rotate-[18deg] border-y border-[#2563EB]/15"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-24 h-[250px] w-[480px] rounded-[50%] bg-[#2563EB]/[0.045]"
          />

          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-20">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-9 bg-[#2563EB]" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#2563EB]">
                  Learn · Build · Earn
                </span>
              </div>

              <h1 className="mt-6 max-w-[700px] text-[46px] font-bold leading-[0.96] tracking-[-0.055em] sm:text-[62px] lg:text-[76px]">
                Building India&apos;s
                <br />
                <span className="text-[#2563EB]">Future Workforce.</span>
              </h1>

              <p className="mt-6 max-w-[570px] text-[14px] leading-6 text-slate-500 sm:text-[16px] sm:leading-7">
                Practical learning, real projects, industry exposure and
                career-focused programs built for the world of work.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/programs"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#0F172A] px-6 text-sm font-bold text-white shadow-[0_10px_25px_rgba(15,23,42,0.14)] transition hover:bg-[#2563EB]"
                >
                  Explore Our Programs
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>

                <a
                  href="https://wa.me/918769951887?text=Hello%20TechSkillHub%2C%20I%20would%20like%20to%20know%20more."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] font-extrabold uppercase tracking-[0.24em] text-slate-400 sm:text-[9px]">
                <span>Education</span>
                <span className="text-[#2563EB]">•</span>
                <span>Skills</span>
                <span className="text-[#2563EB]">•</span>
                <span>Projects</span>
                <span className="text-[#2563EB]">•</span>
                <span>Career</span>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden bg-[#0F172A] lg:min-h-full">
              {/* Blue diagonal card-inspired accents */}
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-64 w-64 rotate-45 bg-[#2563EB]/80"
              />
              <div
                aria-hidden="true"
                className="absolute -right-28 -top-5 h-48 w-72 rotate-45 border-[18px] border-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full border-[45px] border-[#2563EB]/20"
              />

              <div className="relative flex h-full flex-col justify-between p-7 sm:p-9 lg:p-10">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#60A5FA]">
                    Explore TechSkillHub
                  </p>

                  <h2 className="mt-4 max-w-[330px] text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[34px]">
                    One place for
                    <br />
                    your next step.
                  </h2>

                  <p className="mt-4 max-w-[300px] text-sm leading-6 text-slate-400">
                    Programs, people and direct ways to connect with
                    TechSkillHub.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                  <Link
                    href="/programs"
                    className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-[#2563EB] hover:bg-[#2563EB]"
                  >
                    <BriefcaseBusiness className="h-5 w-5 text-[#60A5FA] transition group-hover:text-white" />
                    <p className="mt-4 text-xs font-bold text-white">
                      Programs
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400 group-hover:text-blue-100">
                      Explore paths
                    </p>
                  </Link>

                  <a
                    href="mailto:support@techskillhub.online"
                    className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-[#2563EB] hover:bg-[#2563EB]"
                  >
                    <Mail className="h-5 w-5 text-[#60A5FA] transition group-hover:text-white" />
                    <p className="mt-4 text-xs font-bold text-white">
                      Connect
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400 group-hover:text-blue-100">
                      Talk to our team
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card-style blue wave */}
          <div className="relative h-7 overflow-hidden bg-[#0F172A]">
            <svg
              viewBox="0 0 1200 70"
              preserveAspectRatio="none"
              className="absolute -top-10 h-[70px] w-full"
              aria-hidden="true"
            >
              <path
                d="M0 50 C120 0 220 5 330 45 C450 88 555 80 670 30 C790 -20 870 8 970 42 C1070 76 1135 65 1200 20 L1200 70 L0 70 Z"
                fill="#2563EB"
              />
              <path
                d="M0 58 C120 12 220 15 330 52 C450 92 555 88 670 38 C790 -8 870 15 970 50 C1070 84 1135 73 1200 28 L1200 70 L0 70 Z"
                fill="#60A5FA"
                opacity="0.65"
              />
            </svg>
          </div>
        </section>

        {/* ============================================================
            LEADERSHIP / DIRECT CONTACT
        ============================================================ */}
        <section className="border-b border-slate-200 bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#2563EB]" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#2563EB]">
                  Leadership
                </span>
              </div>

              <h2 className="mt-4 max-w-[330px] text-[34px] font-bold leading-[1] tracking-[-0.05em] sm:text-[42px]">
                Connect
                <br />
                directly with
                <br />
                our team.
              </h2>

              <p className="mt-5 max-w-[340px] text-sm leading-6 text-slate-500">
                Whether you are a student, educator, institution or potential partner,
                connect directly with the TechSkillHub team.
              </p>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {leaders.map((leader, index) => (
                <div
                  key={leader.name}
                  className="group py-7 sm:flex sm:items-center sm:justify-between sm:gap-8"
                >
                  <div className="flex min-w-0 gap-4">
                    <span className="pt-1 text-[9px] font-extrabold tracking-[0.2em] text-[#2563EB]">
                      0{index + 1}
                    </span>

                    <div>
                      <h3 className="text-[19px] font-bold tracking-[-0.025em] text-[#0F172A]">
                        {leader.name}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {leader.role}
                      </p>

                      <a
                        href={`tel:+${leader.rawPhone}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#2563EB]"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {leader.phone}
                      </a>
                    </div>
                  </div>

                  <a
                    href={leader.contact}
                    download
                    className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-600 transition hover:border-[#2563EB] hover:text-[#2563EB] sm:mt-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Save Contact
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            PROGRAMS
        ============================================================ */}
        <section className="relative overflow-hidden bg-[#F7FAFF] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full border-[50px] border-[#2563EB]/[0.045]"
          />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#2563EB]" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#2563EB]">
                  Career Programs
                </span>
              </div>

              <h2 className="mt-4 text-[35px] font-bold tracking-[-0.05em] sm:text-[44px]">
                Build your path.
              </h2>

              <p className="mt-3 max-w-[540px] text-sm leading-6 text-slate-500">
                Career-focused programs designed around practical skills,
                projects and modern industry requirements.
              </p>
            </div>

            <Link
              href="/programs"
              className="group inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2563EB]"
            >
              View all programs
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="relative mt-9 grid gap-4 sm:grid-cols-2">
            {programs.map((program) => {
              const Icon = program.icon;

              return (
                <Link
                  key={program.name}
                  href={program.href}
                  className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/40 hover:shadow-[0_18px_40px_rgba(37,99,235,0.10)] sm:p-6"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[70px] bg-[#2563EB]/[0.045] transition group-hover:bg-[#2563EB]/10" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[9px] font-extrabold tracking-[0.18em] text-slate-300">
                      {program.number}
                    </span>
                  </div>

                  <div className="relative mt-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[20px] font-bold tracking-[-0.03em]">
                        {program.name}
                      </h3>

                      <span className="rounded-full bg-[#2563EB]/10 px-2.5 py-1 text-[7px] font-extrabold uppercase tracking-[0.16em] text-[#2563EB]">
                        {program.category}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {program.description}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400 transition group-hover:text-[#2563EB]">
                      Explore program
                    </span>

                    <BlueArrow />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            BRAND PILLARS
        ============================================================ */}
        <section className="bg-[#0F172A] px-5 py-11 sm:px-8 sm:py-14 lg:px-12">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <div
                  key={pillar.title}
                  className={`flex gap-4 border-slate-700 py-5 sm:px-5 lg:py-4 ${
                    index !== pillars.length - 1
                      ? "border-b sm:border-r lg:border-b-0"
                      : ""
                  } ${index === 1 ? "lg:border-r" : ""} ${
                    index === 2 ? "lg:border-r" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {pillar.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            TECHSKILLHUB ECOSYSTEM
        ============================================================ */}
        <section className="relative overflow-hidden border-t border-slate-200 bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[45px] border-[#2563EB]/[0.045]"
          />

          <div className="relative">
            <div className="max-w-[720px]">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#2563EB]" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#2563EB]">
                  TechSkillHub Ecosystem
                </span>
              </div>

              <h2 className="mt-4 text-[35px] font-bold leading-[1.02] tracking-[-0.05em] sm:text-[46px]">
                Build something
                <br />
                <span className="text-[#2563EB]">together.</span>
              </h2>

              <p className="mt-4 max-w-[650px] text-sm leading-6 text-slate-500">
                TechSkillHub connects learners, educators, institutions,
                industry and education networks through practical learning,
                technology and meaningful collaboration.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <div className="group rounded-[22px] border border-slate-200 bg-[#F8FAFC] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/35 hover:bg-white hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <span className="text-[9px] font-extrabold tracking-[0.18em] text-slate-300">
                    01
                  </span>
                </div>

                <h3 className="mt-6 text-[20px] font-bold tracking-[-0.03em]">
                  Students & Learners
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore career-focused programs, practical learning,
                  projects and opportunities designed around the future of
                  work.
                </p>

                <Link
                  href="/programs"
                  className="mt-5 inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#2563EB]"
                >
                  Explore Programs
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="group rounded-[22px] border border-slate-200 bg-[#F8FAFC] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/35 hover:bg-white hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Users className="h-5 w-5" />
                  </div>

                  <span className="text-[9px] font-extrabold tracking-[0.18em] text-slate-300">
                    02
                  </span>
                </div>

                <h3 className="mt-6 text-[20px] font-bold tracking-[-0.03em]">
                  Tuition & Coaching
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Collaborate on workshops, skill programs, student
                  opportunities, co-branded initiatives, referrals and
                  other learning partnerships.
                </p>

                <a
                  href="mailto:support@techskillhub.online?subject=Tuition%20%26%20Coaching%20Partnership"
                  className="mt-5 inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#2563EB]"
                >
                  Partner With Us
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="group rounded-[22px] border border-slate-200 bg-[#F8FAFC] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/35 hover:bg-white hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <span className="text-[9px] font-extrabold tracking-[0.18em] text-slate-300">
                    03
                  </span>
                </div>

                <h3 className="mt-6 text-[20px] font-bold tracking-[-0.03em]">
                  Colleges & Universities
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore Growth Network Portal collaboration, student
                  programs, AI-integrated workshops, seminars and
                  institution-focused initiatives.
                </p>

                <a
                  href="mailto:support@techskillhub.online?subject=College%20%26%20University%20Collaboration"
                  className="mt-5 inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#2563EB]"
                >
                  Institutional Connect
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="group rounded-[22px] border border-slate-200 bg-[#F8FAFC] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/35 hover:bg-white hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Globe2 className="h-5 w-5" />
                  </div>

                  <span className="text-[9px] font-extrabold tracking-[0.18em] text-slate-300">
                    04
                  </span>
                </div>

                <h3 className="mt-6 text-[20px] font-bold tracking-[-0.03em]">
                  Networks & Organizations
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Connect with TechSkillHub across education, industry,
                  corporate, placement, recruitment, training, startup and
                  business networks.
                </p>

                <a
                  href="mailto:support@techskillhub.online?subject=TechSkillHub%20Network%20Partnership"
                  className="mt-5 inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#2563EB]"
                >
                  Build a Partnership
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] bg-[#0F172A] p-5 text-white sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#60A5FA]">
                    Work With TechSkillHub
                  </p>

                  <p className="mt-2 max-w-[650px] text-sm leading-6 text-slate-300">
                    Have an idea, institution, student community or network
                    you want to connect with TechSkillHub? Start the
                    conversation.
                  </p>
                </div>

                <a
                  href="mailto:support@techskillhub.online?subject=Work%20With%20TechSkillHub"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#0F172A]"
                >
                  Let&apos;s Connect
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <ConnectEnquiryForm />

        {/* ============================================================
            CONTACT / SOCIAL
        ============================================================ */}
        <section className="relative overflow-hidden bg-white px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-100px] left-[-80px] h-64 w-64 rounded-full bg-[#2563EB]/[0.045]"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#2563EB]" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#2563EB]">
                  Stay Connected
                </span>
              </div>

              <h2 className="mt-4 max-w-[650px] text-[34px] font-bold leading-[1.03] tracking-[-0.05em] sm:text-[44px]">
                Let&apos;s build what
                <br />
                comes next.
              </h2>

              <p className="mt-4 max-w-[520px] text-sm leading-6 text-slate-500">
                Whether you are a learner, educator, institution, organization or
                network, connect with TechSkillHub.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[470px]">
              <a
                href="https://www.instagram.com/techskillhub.online/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#2563EB] hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]"
              >
                <span className="flex items-center gap-3 text-xs font-bold">
                  <InstagramIcon className="h-4 w-4 text-[#2563EB]" />
                  Instagram
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#2563EB]" />
              </a>

              <a
                href="mailto:support@techskillhub.online"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#2563EB] hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]"
              >
                <span className="flex items-center gap-3 text-xs font-bold">
                  <Mail className="h-4 w-4 text-[#2563EB]" />
                  Email
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#2563EB]" />
              </a>

              <a
                href="https://techskillhub.online"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#2563EB] hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]"
              >
                <span className="flex items-center gap-3 text-xs font-bold">
                  <Globe2 className="h-4 w-4 text-[#2563EB]" />
                  Website
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#2563EB]" />
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================
            FINAL CTA
        ============================================================ */}
        <section className="relative overflow-hidden bg-[#2563EB] px-5 py-12 text-white sm:px-8 sm:py-14 lg:px-12">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-32 h-72 w-72 rounded-full border-[55px] border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 left-[42%] h-52 w-80 rotate-[-12deg] border-y-[24px] border-white/[0.07]"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-blue-100">
                TechSkillHub
              </p>

              <h2 className="mt-4 max-w-[650px] text-[35px] font-bold leading-[1.02] tracking-[-0.05em] sm:text-[48px]">
                Learn skills.
                <br />
                Build experience.
                <br />
                Create your future.
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/programs"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:bg-[#0F172A] hover:text-white"
              >
                Explore Programs
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <a
                href="https://wa.me/918769951887?text=Hello%20TechSkillHub%2C%20I%20would%20like%20to%20know%20more."
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================
            FOOTER
        ============================================================ */}
        <footer className="flex flex-col gap-3 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-6 bg-[#2563EB]" />
            <span className="text-[8px] font-extrabold uppercase tracking-[0.28em] text-slate-400">
              Learn · Build · Earn
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-slate-400">
            <span>support@techskillhub.online</span>
            <span className="hidden text-slate-200 sm:inline">•</span>
            <span>techskillhub.online</span>
            <span className="hidden text-slate-200 sm:inline">•</span>
            <span>© {new Date().getFullYear()} TechSkillHub</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

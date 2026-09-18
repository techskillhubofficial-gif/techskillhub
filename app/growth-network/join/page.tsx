"use client";

import Image from "next/image";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Handshake,
  Loader2,
  Megaphone,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type MemberType = "EXECUTIVE" | "TEAM_LEADER";

type FormData = {
  memberType: MemberType;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  education: string;
  occupation: string;
  organization: string;
  experience: string;
  availability: string;
  workingMode: string;
  leadershipExperience: string;
  previousTeamSize: string;
  expectedTeamSize: string;
  linkedinUrl: string;
  instagramUrl: string;
  portfolioUrl: string;
  responsibilitiesAccepted: boolean;
  declarationsAccepted: boolean;
  marketingPolicyAccepted: boolean;
  termsAccepted: boolean;
};

const initialForm: FormData = {
  memberType: "EXECUTIVE",
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  education: "",
  occupation: "",
  organization: "",
  experience: "",
  availability: "",
  workingMode: "",
  leadershipExperience: "",
  previousTeamSize: "",
  expectedTeamSize: "",
  linkedinUrl: "",
  instagramUrl: "",
  portfolioUrl: "",
  responsibilitiesAccepted: false,
  declarationsAccepted: false,
  marketingPolicyAccepted: false,
  termsAccepted: false,
};

const benefits = [
  {
    icon: BriefcaseBusiness,
    title: "Practical Experience",
    description:
      "Work through real responsibilities that help connect learning with professional practice.",
  },
  {
    icon: TrendingUp,
    title: "Skill Development",
    description:
      "Strengthen communication, marketing, sales, networking, business and execution skills.",
  },
  {
    icon: Award,
    title: "Recognition & Certification",
    description:
      "Build a record of participation and become eligible for applicable recognition based on requirements.",
  },
  {
    icon: Users,
    title: "Professional Network",
    description:
      "Meet learners, professionals and growth-focused people working toward meaningful outcomes.",
  },
  {
    icon: Target,
    title: "Performance Exposure",
    description:
      "Understand how activity, follow-ups and qualified outcomes connect inside a real growth workflow.",
  },
  {
    icon: Network,
    title: "Leadership Growth",
    description:
      "Take responsibility, coordinate people and develop leadership capability as you progress.",
  },
];

const audience = [
  "Final-year students",
  "Graduates & postgraduates",
  "MBA students",
  "Freshers",
  "Working professionals",
  "Freelancers",
  "Experienced professionals",
  "Career builders",
];

const journey = [
  ["01", "Apply", "Tell us about yourself, your background and what you want to build."],
  ["02", "Review", "Your application is reviewed against the applicable TGN requirements."],
  ["03", "Selection", "Selected candidates may proceed through the next review or interview stage where applicable."],
  ["04", "Onboard", "Approved members complete the applicable account and onboarding process."],
  ["05", "Orient & Learn", "Understand the network, responsibilities, workflow and professional expectations."],
  ["06", "Participate", "Contribute to assigned outreach, networking, growth and team activities."],
  ["07", "Build Experience", "Develop practical exposure, measurable contribution and professional capability."],
  ["08", "Grow", "Take on greater responsibility and explore leadership opportunities as you progress."],
];

const faqs = [
  {
    q: "Is TGN only for college students?",
    a: "No. TGN is designed for a wider range of people, including students, graduates, postgraduates, freshers, working professionals, freelancers and experienced professionals.",
  },
  {
    q: "Can I apply if I have little or no professional experience?",
    a: "Yes. Limited professional experience does not automatically prevent you from applying. TGN is intended to provide a structured environment where applicable members can develop practical capability through participation.",
  },
  {
    q: "Can experienced professionals apply?",
    a: "Yes. Experienced professionals can apply where their background aligns with the available TGN role and responsibilities. Existing skills can be applied while developing additional networking, growth or leadership experience.",
  },
  {
    q: "What can I gain from the Growth Network?",
    a: "Depending on your role and participation, TGN can provide practical exposure, professional skill development, networking, performance experience, leadership development and applicable recognition.",
  },
  {
    q: "Will I automatically receive a certificate or experience letter?",
    a: "No automatic recognition is promised. Applicable certification, experience documentation or other recognition depends on completing the requirements communicated through the TGN process.",
  },
  {
    q: "Does applying guarantee selection?",
    a: "No. Submitting an application does not guarantee selection, onboarding, a specific role, results or any particular opportunity.",
  },
  {
    q: "Is there a fee to apply?",
    a: "The TGN application itself does not require an application payment. Any separate TechSkillHub program, product or service is outside the scope of this application.",
  },
];

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm leading-6 text-slate-600">{children}</span>
    </label>
  );
}

export default function GrowthNetworkJoinPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState(false);
  const [referralChecking, setReferralChecking] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationNo, setApplicationNo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    const ref = params.get("ref");

    if (role === "TEAM_LEADER" || role === "EXECUTIVE") {
      setForm((current) => ({
        ...current,
        memberType: role,
      }));
    }

    if (ref) {
      setReferralCode(ref);
      setReferralChecking(true);

      fetch(
        `/api/tgn/team/recruitment?ref=${encodeURIComponent(ref)}`,
        { cache: "no-store" },
      )
        .then(async (response) => {
          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message ?? "This invitation could not be verified.",
            );
          }

          setReferralValid(true);
          setReferralMessage(
            "This invitation is connected to an available TechSkillHub Team Leader.",
          );
        })
        .catch((err) => {
          setReferralValid(false);
          setReferralMessage(
            err instanceof Error
              ? err.message
              : "This invitation could not be verified.",
          );
        })
        .finally(() => setReferralChecking(false));
    }
  }, []);

  const isExecutiveInvite = Boolean(referralCode);

  const update = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const progress = useMemo(() => {
    const steps = 6;
    return Math.round((activeStep / steps) * 100);
  }, [activeStep]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.memberType === "EXECUTIVE" && !referralCode) {
      setError(
        "Growth Executive applications require a Team Leader invitation link.",
      );
      return;
    }

    if (form.memberType === "EXECUTIVE" && !referralValid) {
      setError(
        "Please use a valid Team Leader invitation link before submitting.",
      );
      return;
    }

    if (
      !form.responsibilitiesAccepted ||
      !form.declarationsAccepted ||
      !form.marketingPolicyAccepted ||
      !form.termsAccepted
    ) {
      setError(
        "Please review and accept all required declarations before submitting.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/tgn/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          ref: referralCode || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Unable to submit your application.",
        );
      }

      setApplicationNo(result.application?.applicationNo ?? "");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-5 py-12">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Application received
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Your TGN application is in.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Thank you for applying to the TechSkillHub Growth Network.
              Your application will move through the applicable review
              process. Keep your application reference for future
              communication.
            </p>

            {applicationNo ? (
              <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Application reference
                </p>
                <p className="mt-2 text-xl font-bold tracking-wide text-slate-950">
                  {applicationNo}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Back to Growth Network
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="/" className="shrink-0">
            <Image
              src="/logo/Full-logo.png"
              alt="TechSkillHub"
              width={168}
              height={48}
              className="h-9 w-auto object-contain"
              priority
            />
          </a>

          <a
            href="#application-form"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-14 lg:px-8 lg:pb-16 lg:pt-16">
          {isExecutiveInvite ? (
            <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Team invitation
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    You have been invited to apply as a Growth Executive
                    through a TechSkillHub Growth Network Team Leader.
                  </p>
                  {referralMessage ? (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        referralValid
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {referralChecking
                        ? "Verifying invitation..."
                        : referralMessage}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                TechSkillHub Growth Network
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Education got you here.
                <span className="block text-blue-600">
                  Experience takes you further.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                TGN is a practical professional growth network for people
                who want to participate, contribute, build experience and
                develop the skills needed to move forward.
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Your starting point may be different from someone else’s.
                Your growth does not have to be.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#application-form"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Explore & Apply
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#benefits"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  See what you can build
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                The growth model
              </p>

              <div className="mt-6 space-y-4">
                {[
                  ["Learn", "Understand the work and expectations."],
                  ["Participate", "Put your skills into practical use."],
                  ["Contribute", "Create measurable value through action."],
                  ["Build", "Develop experience, capability and network."],
                  ["Grow", "Take on greater responsibility over time."],
                ].map(([title, description], index) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-600 shadow-sm ring-1 ring-slate-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {title}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Why join TGN
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Build more than a resume line.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The goal is practical professional development through
              participation, responsibility and measurable contribution.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-950">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Built for different starting points
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                You do not need the same background as everyone else.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                TGN brings together people at different stages of their
                professional journey. What matters is your willingness to
                learn, contribute and take responsibility.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {audience.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Your journey
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              From applying to taking responsibility.
            </h2>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {journey.map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="text-xs font-bold tracking-[0.15em] text-blue-600">
                  {number}
                </span>
                <h3 className="mt-3 font-semibold text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                Growth Executive
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Participate in outreach, networking, referrals, follow-ups,
                growth activities and student acquisition support while
                developing practical professional skills.
              </p>
              <div className="mt-5 space-y-2">
                {[
                  "Lead generation & outreach",
                  "Prospect communication & follow-ups",
                  "Networking & community building",
                  "Growth and acquisition support",
                  "Practical sales & marketing exposure",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                <Network className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                Team Leader
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Coordinate Growth Executives, support team execution and
                performance, while also being able to participate directly
                in growth and admission activities.
              </p>
              <div className="mt-5 space-y-2">
                {[
                  "Team coordination & communication",
                  "Task and follow-up support",
                  "Performance tracking",
                  "Leadership development",
                  "Direct growth & admission participation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Recognition
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Recognition is connected to participation.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Applicable certification, experience documentation or
                  other recognition depends on completing the requirements
                  communicated through the TGN process. Applying or joining
                  does not automatically qualify a member for a certificate,
                  experience letter or other recognition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Questions
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Before you apply
            </h2>
          </div>

          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((faq, index) => {
              const open = openFaq === index;

              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open ? (
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-7 text-slate-600">
                        {faq.a}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="application-form" className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-16">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Application
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Start your Growth Network journey.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Complete the application with accurate information. Your
              application will be reviewed through the applicable TGN
              process.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Application progress
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Step {activeStep} of 6
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {progress}%
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <form
              onSubmit={submit}
              className="p-5 sm:p-8"
            >
              {error ? (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <X className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              {activeStep === 1 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Choose your role
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Select the responsibility you are applying for.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      disabled={isExecutiveInvite}
                      onClick={() => update("memberType", "EXECUTIVE")}
                      className={`rounded-2xl border p-5 text-left transition ${
                        form.memberType === "EXECUTIVE"
                          ? "border-blue-500 bg-blue-50 ring-4 ring-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200"
                      } ${
                        isExecutiveInvite
                          ? "cursor-not-allowed opacity-80"
                          : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <h4 className="mt-4 font-bold text-slate-950">
                        Growth Executive
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Contribute to outreach, networking, referrals,
                        follow-ups and growth activities.
                      </p>
                      {isExecutiveInvite ? (
                        <span className="mt-3 inline-block text-xs font-bold text-blue-600">
                          Selected through Team Leader invitation
                        </span>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      disabled={isExecutiveInvite}
                      onClick={() => update("memberType", "TEAM_LEADER")}
                      className={`rounded-2xl border p-5 text-left transition ${
                        form.memberType === "TEAM_LEADER"
                          ? "border-blue-500 bg-blue-50 ring-4 ring-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200"
                      } ${
                        isExecutiveInvite
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                        <Network className="h-5 w-5" />
                      </div>
                      <h4 className="mt-4 font-bold text-slate-950">
                        Team Leader
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Coordinate a team, support performance and also
                        participate directly in growth activities.
                      </p>
                    </button>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Growth Executive applications require a valid Team
                    Leader invitation link. Team Leader applications can
                    be submitted directly for review.
                  </div>
                </div>
              ) : null}

              {activeStep === 2 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Personal details
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Tell us how we can contact you.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Full name"
                      required
                      value={form.name}
                      onChange={(value) => update("name", value)}
                      placeholder="Enter your full name"
                    />
                    <Field
                      label="Email address"
                      required
                      value={form.email}
                      onChange={(value) => update("email", value)}
                      placeholder="you@example.com"
                      type="email"
                    />
                    <Field
                      label="Phone number"
                      required
                      value={form.phone}
                      onChange={(value) => update("phone", value)}
                      placeholder="+91"
                      type="tel"
                    />
                    <Field
                      label="City"
                      required
                      value={form.city}
                      onChange={(value) => update("city", value)}
                      placeholder="Your city"
                    />
                    <Field
                      label="State"
                      required
                      value={form.state}
                      onChange={(value) => update("state", value)}
                      placeholder="Your state"
                    />
                  </div>
                </div>
              ) : null}

              {activeStep === 3 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Education & professional background
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Your current academic and professional context helps
                      us understand your starting point.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="College / University / Institution"
                      required
                      value={form.education}
                      onChange={(value) => update("education", value)}
                      placeholder="Enter institution name"
                    />
                    <SelectField
                      label="Current status"
                      required
                      value={form.occupation}
                      onChange={(value) => update("occupation", value)}
                      options={[
                        "Student",
                        "Graduate",
                        "Postgraduate",
                        "MBA Student",
                        "Fresher",
                        "Working Professional",
                        "Freelancer",
                        "Entrepreneur",
                        "Other",
                      ]}
                    />
                    <Field
                      label="Organization / Company"
                      value={form.organization}
                      onChange={(value) =>
                        update("organization", value)
                      }
                      placeholder="Optional"
                    />
                    <SelectField
                      label="Professional experience"
                      required
                      value={form.experience}
                      onChange={(value) => update("experience", value)}
                      options={[
                        "No professional experience",
                        "Less than 1 year",
                        "1–2 years",
                        "2–5 years",
                        "5+ years",
                      ]}
                    />
                    <SelectField
                      label="Availability"
                      required
                      value={form.availability}
                      onChange={(value) =>
                        update("availability", value)
                      }
                      options={[
                        "Part-time",
                        "Flexible",
                        "Full-time",
                      ]}
                    />
                    <SelectField
                      label="Preferred working mode"
                      required
                      value={form.workingMode}
                      onChange={(value) =>
                        update("workingMode", value)
                      }
                      options={[
                        "Remote",
                        "Hybrid",
                        "On-site",
                      ]}
                    />
                  </div>
                </div>
              ) : null}

              {activeStep === 4 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Experience & leadership
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Share relevant experience. Formal experience is not
                      required for every applicant.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Relevant leadership experience"
                      value={form.leadershipExperience}
                      onChange={(value) =>
                        update("leadershipExperience", value)
                      }
                      placeholder="Describe briefly"
                    />
                    <Field
                      label="Previous team size"
                      value={form.previousTeamSize}
                      onChange={(value) =>
                        update("previousTeamSize", value)
                      }
                      placeholder="Optional"
                    />
                    <Field
                      label="Expected team size"
                      value={form.expectedTeamSize}
                      onChange={(value) =>
                        update("expectedTeamSize", value)
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
              ) : null}

              {activeStep === 5 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Professional profiles
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Add links that help us understand your professional
                      background and work.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <Field
                      label="LinkedIn profile"
                      value={form.linkedinUrl}
                      onChange={(value) =>
                        update("linkedinUrl", value)
                      }
                      placeholder="https://linkedin.com/in/..."
                      type="url"
                    />
                    <Field
                      label="Instagram profile"
                      value={form.instagramUrl}
                      onChange={(value) =>
                        update("instagramUrl", value)
                      }
                      placeholder="https://instagram.com/..."
                      type="url"
                    />
                    <Field
                      label="Portfolio / website"
                      value={form.portfolioUrl}
                      onChange={(value) =>
                        update("portfolioUrl", value)
                      }
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                </div>
              ) : null}

              {activeStep === 6 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Declarations
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Please read these carefully before submitting.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Checkbox
                      checked={form.responsibilitiesAccepted}
                      onChange={(value) =>
                        update("responsibilitiesAccepted", value)
                      }
                    >
                      I understand that TGN involves practical
                      responsibilities, professional conduct, assigned
                      activities and participation requirements applicable
                      to my role.
                    </Checkbox>

                    <Checkbox
                      checked={form.declarationsAccepted}
                      onChange={(value) =>
                        update("declarationsAccepted", value)
                      }
                    >
                      I confirm that the information provided in this
                      application is accurate to the best of my knowledge.
                    </Checkbox>

                    <Checkbox
                      checked={form.marketingPolicyAccepted}
                      onChange={(value) =>
                        update("marketingPolicyAccepted", value)
                      }
                    >
                      I agree to follow applicable TechSkillHub
                      communication, outreach, brand and marketing
                      guidelines while participating in TGN.
                    </Checkbox>

                    <Checkbox
                      checked={form.termsAccepted}
                      onChange={(value) =>
                        update("termsAccepted", value)
                      }
                    >
                      I understand that applying does not guarantee
                      selection, onboarding, a specific role, results,
                      income, certification or any other particular
                      outcome.
                    </Checkbox>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-staap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <p className="text-xs leading-6 text-slate-500">
                        Your application will be reviewed through the
                        applicable TechSkillHub Growth Network process.
                        Selection and onboarding depend on the applicable
                        requirements and internal review.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStep((step) => Math.max(1, step - 1))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {activeStep < 6 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStep((step) => Math.min(6, step + 1))
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {submitting
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/Full-logo.png"
              alt="TechSkillHub"
              width={130}
              height={38}
              className="h-7 w-auto object-contain"
            />
            <span>Growth Network</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#benefits"
              className="transition hover:text-slate-900"
            >
              Benefits
            </a>
            <a
              href="#application-form"
              className="transition hover:text-slate-900"
            >
              Apply
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
} from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/918769951887?text=Hello%20TechSkillHub%2C%20I%20would%20like%20to%20know%20more.";

const audienceOptions = [
  "Student / Learner",
  "Parent / Guardian",
  "Educator / Trainer",
  "Tuition / Coaching",
  "College / University",
  "Company / Industry",
  "Placement / Recruitment",
  "Training / Education Network",
  "Startup / Business",
  "Other",
];

const enquiryOptions = [
  "Programs / Student Opportunities",
  "Tuition / Coaching Partnership",
  "College / University Collaboration",
  "AI-Integrated Workshop / Seminar",
  "Growth Network Portal",
  "Industry / Corporate Collaboration",
  "Placement / Recruitment Network",
  "Training / Education Partnership",
  "General Enquiry",
];

export function ConnectEnquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setDuplicate(false);
    setSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      currentStatus: String(formData.get("currentStatus") ?? "").trim(),
      interestedProgram: String(
        formData.get("interestedProgram") ?? "",
      ).trim(),
      preferredContact: String(
        formData.get("preferredContact") ?? "WHATSAPP",
      ),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      source: "CONNECT_PAGE",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setSuccess(true);
        form.reset();
        return;
      }

      if (response.status === 409) {
        setDuplicate(true);
        setError(
          "We already have an enquiry with these contact details. If you need immediate help, connect with us on WhatsApp.",
        );
        return;
      }

      setError(
        result?.message ??
          "Something went wrong while sending your enquiry. Please try again.",
      );
    } catch {
      setError(
        "We couldn't send your enquiry right now. Please try again or contact us directly on WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center px-6 py-16 text-center sm:px-10 lg:px-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Enquiry received
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Thanks — your enquiry is with the TechSkillHub team.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              We&apos;ll review your request and connect you with the right
              conversation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp TechSkillHub
              </a>

              <a
                href="#programs"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Explore Programs
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="enquiry"
      className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
    >
      <div className="grid overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative overflow-hidden bg-slate-950 px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Work With TechSkillHub
            </p>

            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
              Let&apos;s make the right connection.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Tell us who you are and what you want to build, learn or
              collaborate on. We&apos;ll route your enquiry to the right
              conversation.
            </p>

            <div className="mt-10 space-y-5">
              {[
                ["01", "Students & Learners", "Programs, skills and career opportunities."],
                ["02", "Institutions", "College, university and coaching collaborations."],
                ["03", "Networks & Industry", "Training, placement and workforce partnerships."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px] font-semibold text-slate-300">
                    {number}
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="connect-full-name"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Full Name
                </label>
                <input
                  id="connect-full-name"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="connect-email"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Email Address
                </label>
                <input
                  id="connect-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="connect-phone"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Phone / WhatsApp
                </label>
                <input
                  id="connect-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="connect-contact"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Preferred Contact
                </label>
                <select
                  id="connect-contact"
                  name="preferredContact"
                  defaultValue="WHATSAPP"
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="connect-status"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  I&apos;m connecting as
                </label>
                <select
                  id="connect-status"
                  name="currentStatus"
                  defaultValue=""
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  {audienceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="connect-enquiry"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  What would you like to discuss?
                </label>
                <select
                  id="connect-enquiry"
                  name="interestedProgram"
                  defaultValue=""
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="" disabled>
                    Select an enquiry type
                  </option>
                  {enquiryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="connect-notes"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Tell us more{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="connect-notes"
                name="notes"
                rows={4}
                placeholder="Briefly tell us what you need or what you'd like to build together..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {error ? (
              <div
                aria-live="polite"
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
              >
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-5 text-slate-400">
                Your details are used only to respond to this enquiry.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Enquiry
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {duplicate ? (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
                Continue on WhatsApp
              </a>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

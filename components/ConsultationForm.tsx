"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LeadSchema } from "@/lib/validations/lead";
import type { LeadInput } from "@/lib/validations/lead";

import SuccessScreen from "./SuccessScreen";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const selectClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const errorClass = "mt-1.5 text-xs font-medium text-red-500";

export default function ConsultationForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(LeadSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      currentStatus: "",
      interestedProgram: "",
      careerGoal: "",
      preferredContact: "WHATSAPP",
    },
  });

  async function onSubmit(data: LeadInput) {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Something went wrong. Please try again.");
        return;
      }

      reset();
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Unable to submit the form. Please try again.");
    }
  }

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section>
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-950">
            Your details
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Tell us how we can reach you.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              {...register("fullName")}
              className={inputClass}
            />

            {errors.fullName?.message && (
              <p className={errorClass}>{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Phone / WhatsApp
            </label>

            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Your phone number"
              {...register("phone")}
              className={inputClass}
            />

            {errors.phone?.message && (
              <p className={errorClass}>{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className={inputClass}
            />

            {errors.email?.message && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 pt-8">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-950">
            About you
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            This helps us understand what kind of guidance may be relevant.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="currentStatus"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Current Status
            </label>

            <select
              id="currentStatus"
              {...register("currentStatus")}
              className={selectClass}
            >
              <option value="">Choose your current status</option>
              <option value="School Student">School Student</option>
              <option value="College Student">College Student</option>
              <option value="Graduate">Graduate</option>
              <option value="Working Professional">
                Working Professional
              </option>
              <option value="Entrepreneur">Entrepreneur</option>
            </select>

            {errors.currentStatus?.message && (
              <p className={errorClass}>{errors.currentStatus.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="interestedProgram"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Program Interest
            </label>

            <select
              id="interestedProgram"
              {...register("interestedProgram")}
              className={selectClass}
            >
              <option value="">Choose a program</option>
              <option value="CodeForge">
                CodeForge™ — Full Stack Engineering
              </option>
              <option value="InsightIQ">
                InsightIQ™ — Data Analytics & GenAI
              </option>
              <option value="DesignSphere">
                DesignSphere™ — UI/UX & Creative Design
              </option>
              <option value="GrowthX">
                GrowthX™ — Business, Sales & Career
              </option>
              <option value="Not Sure Yet">I'm not sure yet</option>
            </select>

            {errors.interestedProgram?.message && (
              <p className={errorClass}>{errors.interestedProgram.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 pt-8">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-950">
            Your goal
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Optional — tell us what you want to learn, build or achieve.
          </p>
        </div>

        <label
          htmlFor="careerGoal"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Career Goal
        </label>

        <textarea
          id="careerGoal"
          rows={4}
          {...register("careerGoal")}
          placeholder="For example: I want to learn coding and build a portfolio..."
          className={`${inputClass} resize-none`}
        />
      </section>

      <section className="border-t border-slate-100 pt-8">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-950">
            Preferred contact
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Choose how you would prefer us to contact you.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ["WHATSAPP", "WhatsApp"],
            ["PHONE", "Phone"],
            ["EMAIL", "Email"],
          ].map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                value={value}
                {...register("preferredContact")}
                className="peer sr-only"
              />

              <span className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                {label}
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-sm leading-6 text-slate-600">
          Your information is used to understand your enquiry and help you
          explore a suitable learning path.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isSubmitting
          ? "Sending your request..."
          : "Submit My Career Guidance Request →"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LeadSchema } from "@/lib/validations/lead";
import type { LeadInput } from "@/lib/validations/lead";

import SuccessScreen from "./SuccessScreen";

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
        alert(result.message || "Something went wrong.");
        return;
      }

      reset();
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Unable to submit the form.");
    }
  }

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <div>
        <label className="mb-2 block font-medium">Full Name</label>

        <input
          type="text"
          {...register("fullName")}
          className="w-full rounded-xl border border-gray-300 p-3"
        />

        <p className="mt-1 text-sm text-red-500">
          {errors.fullName?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">Email</label>

        <input
          type="email"
          {...register("email")}
          className="w-full rounded-xl border border-gray-300 p-3"
        />

        <p className="mt-1 text-sm text-red-500">
          {errors.email?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">Phone Number</label>

        <input
          type="tel"
          {...register("phone")}
          className="w-full rounded-xl border border-gray-300 p-3"
        />

        <p className="mt-1 text-sm text-red-500">
          {errors.phone?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">Current Status</label>

        <select
          {...register("currentStatus")}
          className="w-full rounded-xl border border-gray-300 p-3"
        >
          <option value="">Select Status</option>
          <option value="School Student">School Student</option>
          <option value="College Student">College Student</option>
          <option value="Graduate">Graduate</option>
          <option value="Working Professional">Working Professional</option>
          <option value="Entrepreneur">Entrepreneur</option>
        </select>

        <p className="mt-1 text-sm text-red-500">
          {errors.currentStatus?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">Interested Program</label>

        <select
          {...register("interestedProgram")}
          className="w-full rounded-xl border border-gray-300 p-3"
        >
          <option value="">Select Program</option>
          <option value="CodeForge">CodeForge</option>
          <option value="GrowthX">GrowthX</option>
          <option value="DesignSphere">DesignSphere</option>
          <option value="InsightIQ">InsightIQ</option>
          <option value="Not Sure Yet">Not Sure Yet</option>
        </select>

        <p className="mt-1 text-sm text-red-500">
          {errors.interestedProgram?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">Career Goal</label>

        <textarea
          rows={4}
          {...register("careerGoal")}
          placeholder="Tell us about your career goal..."
          className="w-full rounded-xl border border-gray-300 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Preferred Contact</label>

        <select
          {...register("preferredContact")}
          className="w-full rounded-xl border border-gray-300 p-3"
        >
          <option value="WHATSAPP">WhatsApp</option>
          <option value="PHONE">Phone Call</option>
          <option value="EMAIL">Email</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting
          ? "Submitting..."
          : "Get My Career Roadmap"}
      </button>

    </form>
  );
}

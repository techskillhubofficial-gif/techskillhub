"use client";

import { useState } from "react";
import ConsultationForm from "./ConsultationForm";

interface ConsultationModalProps {
  buttonText?: string;
}

export default function ConsultationModal({
  buttonText = "Get Free Career Guidance",
}: ConsultationModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        {buttonText}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">

            <button
              onClick={() => setOpen(false)}
              className="absolute right-6 top-6 text-2xl text-gray-500 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-4xl font-bold text-slate-900">
              Get Free Career Guidance
            </h2>

            <p className="mt-3 text-gray-600">
              Tell us about your goals and our career experts
              will recommend the best roadmap for your career.
            </p>

            <div className="mt-8">
              <ConsultationForm />
            </div>

          </div>
        </div>
      )}
    </>
  );
}
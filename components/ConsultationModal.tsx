"use client";

import { useState } from "react";
import ConsultationForm from "./ConsultationForm";

interface ConsultationModalProps {
  buttonText?: string;
}

export default function ConsultationModal({
  buttonText = "Get Career Guidance",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6">
          <div className="relative my-6 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8">

            <button
              onClick={() => setOpen(false)}
              className="absolute right-6 top-6 text-2xl text-gray-500 hover:text-black"
            >
              ×
            </button>

            <h2 className="pr-10 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Get Career Guidance
            </h2>

            <p className="mt-3 text-gray-600">
              Tell us where you are today and what you want to achieve.
              We’ll help you understand your next step.
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

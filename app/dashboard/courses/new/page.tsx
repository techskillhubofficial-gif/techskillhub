"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Save,
} from "lucide-react";

export default function NewCoursePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const description = form.description.trim();
    const duration = form.duration.trim();
    const price = Number(form.price);

    if (!title || !description || !duration || !form.price.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError("Please enter a valid course fee.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          duration,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create the course.");
        return;
      }

      setSuccess("Course created successfully.");

      setForm({
        title: "",
        description: "",
        duration: "",
        price: "",
      });

      if (data.course?.id) {
        window.setTimeout(() => {
          window.location.href = `/dashboard/courses/${data.course.id}`;
        }, 700);
      }
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50/60 px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Create New Course
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create a new TechSkillHub learning program. After creation, you can build
            its modules, lectures, learning resources and assignments from the course manager.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2 className="text-base font-semibold text-slate-950">
              Course Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the core details for this learning program.
            </p>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-8">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 font-semibold">!</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Course Title <span className="text-blue-600">*</span>
              </label>

              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="e.g. CodeForge"
                maxLength={200}
                disabled={saving}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Course Description <span className="text-blue-600">*</span>
              </label>

              <textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe what students will learn and what the program covers."
                rows={6}
                maxLength={5000}
                disabled={saving}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                {form.description.length}/5000 characters
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Duration <span className="text-blue-600">*</span>
                </label>

                <input
                  id="duration"
                  type="text"
                  value={form.duration}
                  onChange={(event) =>
                    updateField("duration", event.target.value)
                  }
                  placeholder="e.g. 9 Months"
                  maxLength={100}
                  disabled={saving}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Course Fee <span className="text-blue-600">*</span>
                </label>

                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    placeholder="49999"
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-blue-800">
              <span className="font-semibold">Course structure:</span>{" "}
              after creation, build modules, lectures, learning resources and
              assignments, then manage enrolled students from the course management page.
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <Link
              href="/dashboard/courses"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

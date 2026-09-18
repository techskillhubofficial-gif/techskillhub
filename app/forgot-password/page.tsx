"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "We couldn't process your request right now. Please try again.",
        );
      }

      setMessage(
        data.message ||
          "If an account exists with that email address, a password reset link has been sent.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-950/20 blur-3xl" />

          <div className="relative z-10">
            <Link href="/" aria-label="TechSkillHub home">
              <Image
                src="/logo/Full-logo.png"
                alt="TechSkillHub"
                width={230}
                height={70}
                className="h-auto w-[210px] object-contain brightness-0 invert"
                priority
              />
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <LockKeyhole className="h-4 w-4" />
              Secure account recovery
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
              Get back to
              <br />
              your learning journey.
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-blue-100">
              Reset your password securely and continue learning, building
              projects, and growing your career with TechSkillHub.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-5 border-t border-white/20 pt-8">
              <div>
                <p className="text-sm font-semibold text-white">Learn</p>
                <p className="mt-1 text-sm text-blue-100">
                  Industry-ready skills
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Build</p>
                <p className="mt-1 text-sm text-blue-100">
                  Real-world projects
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Earn</p>
                <p className="mt-1 text-sm text-blue-100">
                  Career opportunities
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-blue-100">
            © {new Date().getFullYear()} TechSkillHub. All rights reserved.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:bg-white lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" aria-label="TechSkillHub home">
                <Image
                  src="/logo/Full-logo.png"
                  alt="TechSkillHub"
                  width={210}
                  height={64}
                  className="h-auto w-[190px] object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="mb-8">
              <Link
                href="/login"
                className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <LockKeyhole className="h-7 w-7" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Forgot your password?
              </h2>

              <p className="mt-3 text-[15px] leading-7 text-slate-500">
                Enter the email address connected to your TechSkillHub account
                and we&apos;ll send you a secure password reset link.
              </p>
            </div>

            {message ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <p className="font-semibold text-emerald-900">
                      Check your email
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      {message}
                    </p>

                    <Link
                      href="/login"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                   {error}
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-[15px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending reset link..." : "Send reset link"}
                </button>
              </form>
            )}

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs leading-5 text-slate-500">
                Your password reset request is handled securely. Reset links
                expire after one hour and can only be used once.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Need help?{" "}
              <Link
                href="/contact"
                className="font-semibold text-slate-600 hover:text-blue-600"
              >
                Contact TechSkillHub
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

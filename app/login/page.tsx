"use client";

import { FormEvent, ReactNode, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "The email or password you entered is incorrect. Please try again."
        );
        return;
      }

      if (result?.ok) {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        const sessionData = await sessionResponse.json();
        const role = sessionData?.user?.role;

        router.push(
          role === "TGN_TEAM_LEADER" || role === "TGN_EXECUTIVE"
            ? "/growth-network/portal"
            : "/dashboard",
        );

        router.refresh();
        return;
      }

      setError("Unable to sign in right now. Please try again.");
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-950">
      <div className="relative min-h-screen">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-52 -top-64 h-[760px] w-[760px] rounded-full bg-blue-100/55 blur-3xl" />
          <div className="absolute -bottom-72 -left-48 h-[720px] w-[720px] rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute -right-56 -top-56 h-[720px] w-[720px] rounded-full bg-sky-100/50 blur-3xl" />
          <div className="absolute -bottom-72 -right-48 h-[720px] w-[720px] rounded-full bg-blue-100/35 blur-3xl" />
        </div>

        {/* Fine technical grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* Large decorative rings */}
        <div className="pointer-events-none absolute -left-[310px] top-[27%] hidden h-[620px] w-[620px] rounded-full border border-blue-200/35 xl:block" />
        <div className="pointer-events-none absolute -right-[360px] bottom-[0%] hidden h-[720px] w-[720px] rounded-full border border-blue-200/30 xl:block" />

        {/* Navigation */}
        <div className="absolute right-5 top-5 z-30 sm:right-8 sm:top-7 lg:right-10 lg:top-8">
          <Link
            href="/"
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 text-[12px] font-semibold text-slate-600 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-blue-200 hover:bg-white hover:text-blue-600 hover:shadow-md"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>

        {/* Main composition */}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-5 pb-16 pt-24 sm:px-8 sm:pb-20 lg:px-10 lg:py-14">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(500px,0.82fr)] lg:gap-14 xl:grid-cols-[minmax(0,1.08fr)_570px] xl:gap-20">
            
            {/* =========================================================
                DESKTOP BRAND SIDE
            ========================================================= */}
            <section className="hidden lg:block">
              <div className="max-w-[760px]">
                {/* Brand */}
                <Link
                  href="/"
                  aria-label="TechSkillHub home"
                  className="group relative inline-flex"
                >
                  <div className="absolute -inset-16 rounded-full bg-blue-200/30 opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  <img
                    src="/logo/Full-logo.png"
                    alt="TechSkillHub"
                    className="relative h-auto w-[430px] object-contain xl:w-[475px]"
                  />
                </Link>

                {/* Brand separator */}
                <div className="mt-9 flex items-center gap-3">
                  <span className="h-px w-9 bg-blue-600" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">
                    Your learning platform
                  </p>
                </div>

                {/* Main statement */}
                <h1 className="mt-5 max-w-[720px] text-[54px] font-semibold leading-[0.99] tracking-[-0.055em] text-slate-950 xl:text-[64px]">
                  Your skills.
                  <br />
                  <span className="text-[#2563eb]">
                    A brighter tomorrow.
                  </span>
                </h1>

                <p className="mt-7 max-w-[630px] text-[17px] leading-8 text-slate-500 xl:text-[18px]">
                  Sign in to access your learning programs, projects,
                  progress and career opportunities — all from one secure
                  platform.
                </p>

                {/* Platform pillars */}
                <div className="mt-11 grid max-w-[720px] grid-cols-3 gap-6">
                  <BrandPillar
                    icon={<GraduationCap className="h-[18px] w-[18px]" />}
                    title="Learn"
                    description="Industry-relevant programs"
                  />

                  <BrandPillar
                    icon={<BarChart3 className="h-[18px] w-[18px]" />}
                    title="Build"
                    description="Real-world projects"
                  />

                  <BrandPillar
                    icon={
                      <BriefcaseBusiness className="h-[18px] w-[18px]" />
                    }
                    title="Earn"
                    description="Career growth opportunities"
                  />
                </div>

                {/* Quote */}
                <div className="mt-12 flex max-w-[560px] items-start gap-5">
                  <div className="h-[58px] w-[3px] shrink-0 rounded-full bg-blue-600" />

                  <div>
                    <p className="text-[14px] italic leading-7 text-slate-500">
                      “Skills today. Opportunities tomorrow.”
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-slate-400">
                      — TechSkillHub
                    </p>
                  </div>
                </div>

                {/* Small trust row */}
                <div className="mt-10 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  Secure access for your TechSkillHub journey
                </div>
              </div>
            </section>

            {/* =========================================================
                MOBILE BRAND
            ========================================================= */}
            <section className="flex flex-col items-center text-center lg:hidden">
              <Link
                href="/"
                aria-label="TechSkillHub home"
                className="group relative inline-flex"
              >
                <div className="absolute -inset-10 rounded-full bg-blue-200/35 blur-3xl" />

                <img
                  src="/logo/Full-logo.png"
                  alt="TechSkillHub"
                  className="relative h-auto w-[275px] object-contain sm:w-[320px]"
                />
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="h-px w-5 bg-blue-500" />
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-blue-600">
                  Your learning platform
                </p>
                <span className="h-px w-5 bg-blue-500" />
              </div>

              <h1 className="mt-4 text-[31px] font-semibold leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-[38px]">
                Your skills.
                <br />
                <span className="text-[#2563eb]">
                  A brighter tomorrow.
                </span>
              </h1>

              <p className="mt-4 max-w-[430px] text-[13px] leading-6 text-slate-500">
                One secure account for your learning, projects and career
                journey.
              </p>
            </section>

            {/* =========================================================
                LOGIN CARD
            ========================================================= */}
            <section className="w-full">
              <div className="mx-auto w-full max-w-[570px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_35px_90px_-35px_rgba(15,23,42,0.32)] sm:rounded-[30px]">
                {/* Premium accent */}
                <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-[#2563eb] to-indigo-600" />

                <div className="px-7 py-8 sm:px-10 sm:py-10 xl:px-11 xl:py-11">
                  {/* Secure badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/75 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure access
                  </div>

                  {/* Heading */}
                  <div className="mt-6">
                    <h2 className="text-[35px] font-semibold tracking-[-0.052em] text-slate-950 sm:text-[40px]">
                      Welcome back
                    </h2>

                    <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                      Sign in to continue to your TechSkillHub account.
                    </p>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                    noValidate
                  >
                    {/* Error */}
                    {error ? (
                      <div
                        role="alert"
                        className="flex items-start unded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        <span>{error}</span>
                      </div>
                    ) : null}

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2.5 block text-[13px] font-semibold text-slate-700"
                      >
                        Email address
                      </label>

                      <div className="group relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);

                            if (error) {
                              setError("");
                            }
                          }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          autoFocus
                          required
                          className="h-[58px] w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-[14px] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between gap-4">
                        <label
                          htmlFor="password"
                          className="block text-[13px] font-semibold text-slate-700"
                        >
                          Password
                        </label>

                        <Link
                          href="/forgot-password"
                          className="text-[12px] font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="group relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);

                            if (error) {
                              setError("");
                            }
                          }}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          required
                          className="h-[58px] w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-12 text-[14px] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((current) => !current)
                          }
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          {showPassword ? (
                            <EyeOff className="h-[17px] w-[17px]" />
                          ) : (
                            <Eye className="h-[17px] w-[17px]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group mt-2 flex h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-[14px] font-semibold text-white shadow-[0_16px_34px_-14px_rgba(37,99,235,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_20px_42px_-14px_rgba(37,99,235,0.95)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Create account */}
                  <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                    <p className="text-[13px] text-slate-500">
                      New to TechSkillHub?{" "}
                      <Link
                        href="/signup"
                        className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>

                  {/* Trust statement */}
                  <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 sm:text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>
                      Your account is protected with secure authentication.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 text-center sm:bottom-6">
          <p className="text-[10px] text-slate-400">
            © {new Date().getFullYear()} TechSkillHub. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}

function BrandPillar({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50/80 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-blue-500" />
          <p className="text-[14px] font-semibold text-slate-800">
            {title}
          </p>
        </div>

        <p className="mt-0.5 max-w-[160px] text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

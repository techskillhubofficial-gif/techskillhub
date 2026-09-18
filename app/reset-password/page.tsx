"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return {
      label: "Weak",
      width: "20%",
    };
  }

  if (score === 3) {
    return {
      label: "Fair",
      width: "40%",
    };
  }

  if (score === 4) {
    return {
      label: "Good",
      width: "70%",
    };
  }

  return {
    label: "Strong",
    width: "100%",
  };
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token")?.trim() || "";

    setToken(resetToken);
    setTokenReady(true);

    if (!resetToken) {
      setError(
        "This password reset link is invalid. Please request a new reset link.",
      );
    }
  }, []);

  const strength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid. Please request a new reset link.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password.length > 128) {
      setError("Your password is too long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "We couldn't reset your password. Please request a new link.",
        );
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
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
              <ShieldCheck className="h-4 w-4" />
              Secure account recovery
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
              Your account.
              <br />
              Your journey.
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-blue-100">
              Create a secure new password and get straight back to learning,
              building real projects, and growing your career.
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

            {!tokenReady ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <LockKeyhole className="h-7 w-7" />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  Checking your password reset link...
                </p>
              </div>
            ) : success ? (
              <>
                <div className="mb-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Password updated
                  </h2>

                  <p className="mt-3 text-[15px] leading-7 text-slate-500">
                    Your TechSkillHub password has been changed successfully.
                    You can now sign in with your new password.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-[15px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
                >
                  Continue to login
                </Link>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <Link
                    href="/forgot-password"
                    className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Request a new link
                  </Link>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <LockKeyhole className="h-7 w-7" />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Create a new password
                  </h2>

                  <p className="mt-3 text-[15px] leading-7 text-slate-500">
                    Choose a strong password for your TechSkillHub account.
                  </p>
                </div>

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
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      New password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your new password"
                        className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-[15px] text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {password ? (
                      <div className="mt-3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: strength.width }}
                          />
                        </div>

                        <p className="mt-2 text-xs font-medium text-slate-500">
                          Password strength: {strength.label}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Confirm new password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter your new password"
                        className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-[15px] text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {confirmPassword ? (
                      <p
                        className={`mt-2 text-xs font-medium ${
                          passwordsMatch
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {passwordsMatch
                          ? "Passwords match."
                          : "Passwords do not match."}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-[15px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Updating password..." : "Update password"}
                  </button>
                </form>

                <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <p className="text-xs leading-5 text-slate-500">
                    Reset links expire after one hour and can only be used
                    once. Your new password is securely encrypted before it is
                    stored.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

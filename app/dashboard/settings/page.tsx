"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  ChevronRight,
  Database,
  KeyRound,
  Monitor,
  Moon,
  Palette,
  Save,
  Settings2,
  ShieldCheck,
  Sun,
  UserRound,
  Wifi,
} from "lucide-react";

type NotificationSettings = {
  newLead: boolean;
  newAdmission: boolean;
  paymentReceived: boolean;
  applicationUpdates: boolean;
  systemAlerts: boolean;
};

const defaultNotifications: NotificationSettings = {
  newLead: true,
  newAdmission: true,
  paymentReceived: true,
  applicationUpdates: true,
  systemAlerts: true,
};

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("techskillhub-theme");
    const storedNotifications = localStorage.getItem(
      "techskillhub-notifications"
    );

    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      setTheme(storedTheme);
    }

    if (storedNotifications) {
      try {
        setNotifications({
          ...defaultNotifications,
          ...JSON.parse(storedNotifications),
        });
      } catch {
        // Ignore malformed local preferences.
      }
    }
  }, []);

  function applyTheme(value: "light" | "dark" | "system") {
    setTheme(value);
    localStorage.setItem("techskillhub-theme", value);

    const root = document.documentElement;

    if (value === "dark") {
      root.classList.add("dark");
    } else if (value === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }

    markSaved();
  }

  function updateNotification(
    key: keyof NotificationSettings,
    value: boolean
  ) {
    const next = {
      ...notifications,
      [key]: value,
    };

    setNotifications(next);
    localStorage.setItem(
      "techskillhub-notifications",
      JSON.stringify(next)
    );
    markSaved();
  }

  function markSaved() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function resetPreferences() {
    setTheme("light");
    setNotifications(defaultNotifications);

    localStorage.setItem("techskillhub-theme", "light");
    localStorage.setItem(
      "techskillhub-notifications",
      JSON.stringify(defaultNotifications)
    );

    document.documentElement.classList.remove("dark");
    markSaved();
  }

  return (
    <div className="min-h-full bg-slate-50/70">
      <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Configure your TechSkillHub dashboard and platform preferences.
            </p>
          </div>

          <div
            className={`inline-flex h-9 items-center gap-2 self-start rounded-full border px-3 text-xs font-medium transition ${
              saved
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Auto-saved
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Workspace */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Settings2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Workspace
                  </h2>
                  <p className="text-sm text-slate-500">
                    General dashboard preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-6 px-6 py-5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Workspace
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    TechSkillHub Education OS
                  </p>
                </div>

                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between gap-6 px-6 py-5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Account access
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Founder / Administrator
                  </p>
                </div>

                <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Protected
                </div>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Palette className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Appearance
                </h2>
                <p className="text-sm text-slate-500">
                  Choose how the dashboard looks.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  value: "light" as const,
                  label: "Light",
                  icon: Sun,
                },
                {
                  value: "dark" as const,
                  label: "Dark",
                  icon: Moon,
                },
                {
                  value: "system" as const,
                  label: "System",
                  icon: Monitor,
                },
              ].map((item) => {
                const Icon = item.icon;
                const active = theme === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => applyTheme(item.value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                    {active && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Notifications
                </h2>
                <p className="text-sm text-slate-500">
                  Control important dashboard notifications.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                ["newLead", "New leads", "Notify when a new lead enters the system."],
                [
                  "newAdmission",
                  "New admissions",
                  "Notify when an admission is created or updated.",
                ],
                [
                  "paymentReceived",
                  "Payments",
                  "Notify when a payment is received or recorded.",
                ],
                [
                  "applicationUpdates",
                  "Applications",
                  "Notify about admission and TGN application updates.",
                ],
                [
                  "systemAlerts",
                  "System alerts",
                  "Show important platform and security alerts.",
                ],
              ].map(([key, label, description]) => {
                const settingKey = key as keyof NotificationSettings;
                const enabled = notifications[settingKey];

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {description}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() =>
                        updateNotification(settingKey, !enabled)
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        enabled ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Security
                  </h2>
                  <p className="text-sm text-slate-500">
                    Authentication and account security
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Link
                href="/forgot-password"
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-slate-500" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Change password
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Use the secure password recovery flow.
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
              </Link>

              <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <UserRound className="h-4 w-4 text-slate-400" />

                <p className="text-xs text-slate-500">
                  Signed in as{" "}
                  <span className="font-semibold text-slate-700">
                    Administrator
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Data / system */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Database className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Data & System
                  </h2>
                  <p className="text-sm text-slate-500">
                    Platform status and environment information
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <Wifi className="h-4 w-4 text-emerald-600" />
                <p className="mt-3 text-xs text-slate-500">
                  Application
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Operational
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <Database className="h-4 w-4 text-blue-600" />
                <p className="mt-3 text-xs text-slate-500">
                  Database
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Connected
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <Monitor className="h-4 w-4 text-violet-600" />
                <p className="mt-3 text-xs text-slate-500">
                  Dashboard
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Ready
                </p>
              </div>
            </div>
          </section>

          {/* Reset */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Reset dashboard preferences
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Restore appearance and notification preferences to their defaults.
              </p>
            </div>

            <button
              type="button"
              onClick={resetPreferences}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Reset preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

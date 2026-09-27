"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  RefreshCw,
  Video,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type CounsellingSession = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  meetingLink?: string | null;
  status: string;
  notes?: string | null;
  outcome?: string | null;
  nextAction?: string | null;
  counsellor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  lead: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    interestedProgram: string;
    status: string;
    admissions: Array<{
      id: string;
      admissionNo: string;
      studentName: string;
      program: string;
      status: string;
    }>;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function isToday(value: string) {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    formatter.format(new Date(value)) ===
    formatter.format(new Date())
  );
}

function statusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-blue-50 text-blue-700 border-blue-100";
  }
}

export default function CounsellingPage() {
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [notificationEmail, setNotificationEmail] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionSession, setActionSession] =
    useState<CounsellingSession | null>(null);
  const [actionType, setActionType] = useState<
    "COMPLETE" | "RESCHEDULE" | null
  >(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionForm, setActionForm] = useState({
    scheduledAt: "",
    meetingLink: "",
    outcome: "",
    nextAction: "",
    notes: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/counselling", {
        cache: "no-store",
      });

      const result = (await response.json()) as {
        success?: boolean;
        sessions?: CounsellingSession[];
        notificationEmail?: string | null;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load counselling sessions.",
        );
      }

      setSessions(result.sessions ?? []);
      setNotificationEmail(result.notificationEmail ?? null);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load counselling sessions.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  function toDateTimeLocalIndia(value: string) {
    const date = new Date(value);
    const indiaDate = new Date(
      date.getTime() + 5.5 * 60 * 60 * 1000,
    );

    return indiaDate.toISOString().slice(0, 16);
  }

  function openAction(
    session: CounsellingSession,
    type: "COMPLETE" | "RESCHEDULE",
  ) {
    setActiveMenuId(null);
    setActionSession(session);
    setActionType(type);
    setActionError("");
    setActionForm({
      scheduledAt:
        type === "RESCHEDULE"
          ? toDateTimeLocalIndia(session.scheduledAt)
          : "",
      meetingLink: session.meetingLink ?? "",
      outcome: session.outcome ?? "",
      nextAction: session.nextAction ?? "",
      notes: session.notes ?? "",
    });
  }

  function closeAction() {
    if (actionSaving) {
      return;
    }

    setActionSession(null);
    setActionType(null);
    setActionError("");
  }

  async function updateSession(
    session: CounsellingSession,
    action:
      | "COMPLETE"
      | "NO_SHOW"
      | "CANCEL"
      | "RESCHEDULE",
    payload: Record<string, unknown> = {},
  ) {
    setActionError("");
    setActionSaving(true);

    try {
      const response = await fetch(
        `/api/counselling/${session.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            ...payload,
          }),
        },
      );

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        session?: CounsellingSession;
      };

      if (!response.ok || !result.success || !result.session) {
        throw new Error(
          result.message ||
            "Unable to update counselling session.",
        );
      }

      setSessions((current) =>
        current.map((item) => {
          if (item.id !== result.session!.id) {
            return item;
          }

          return {
            ...item,
            ...result.session,
            lead: item.lead,
            counsellor:
              result.session!.counsellor ?? item.counsellor,
          };
        }),
      );

      closeAction();
    } catch (updateError) {
      setActionError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update counselling session.",
      );
    } finally {
      setActionSaving(false);
    }
  }

  async function handleQuickAction(
    session: CounsellingSession,
    action: "NO_SHOW" | "CANCEL",
  ) {
    setActiveMenuId(null);
    const message =
      action === "NO_SHOW"
        ? "Mark this counselling session as a no-show?"
        : "Cancel this counselling session?";

    if (!window.confirm(message)) {
      return;
    }

    await updateSession(session, action, {
      notes: session.notes ?? "",
      outcome: session.outcome ?? "",
      nextAction: session.nextAction ?? "",
    });
  }

  async function saveAction() {
    if (!actionSession || !actionType) {
      return;
    }

    if (actionType === "COMPLETE") {
      await updateSession(actionSession, "COMPLETE", {
        outcome: actionForm.outcome,
        nextAction: actionForm.nextAction,
        notes: actionForm.notes,
      });
      return;
    }

    await updateSession(actionSession, "RESCHEDULE", {
      scheduledAt: actionForm.scheduledAt,
      meetingLink: actionForm.meetingLink,
      notes: actionForm.notes,
    });
  }

  const stats = useMemo(() => {
    const upcoming = sessions.filter(
      (session) =>
        new Date(session.scheduledAt).getTime() > Date.now() &&
        ["SCHEDULED", "RESCHEDULED"].includes(session.status),
    ).length;

    const today = sessions.filter(
      (session) =>
        isToday(session.scheduledAt) &&
        ["SCHEDULED", "RESCHEDULED"].includes(session.status),
    ).length;

    const completed = sessions.filter(
      (session) => session.status === "COMPLETED",
    ).length;

    return {
      upcoming,
      today,
      completed,
    };
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Counselling
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Central view of counselling sessions scheduled for TechSkillHub administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadSessions(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:opacity-60"
        >
          <RefreshCw
            className={[
              "h-3.5 w-3.5",
              refreshing ? "animate-spin" : "",
            ].join(" ")}
          />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Upcoming
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading ? "—" : stats.upcoming}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Today
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading ? "—" : stats.today}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Completed
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading ? "—" : stats.completed}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <CalendarClock className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-950">
                Scheduled counselling
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Every counselling request assigned to an administrator.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="space-y-3 p-6">
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <CalendarClock className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                No counselling sessions yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Sessions scheduled from Admissions will appear here automatically.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const admission = session.lead.admissions[0];

              return (
                <div
                  key={session.id}
                  className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                            statusClasses(session.status),
                          ].join(" ")}
                        >
                          {session.status.replaceAll("_", " ")}
                        </span>

                        {admission ? (
                          <span className="text-[11px] font-semibold text-slate-500">
                            {admission.admissionNo}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 text-base font-bold text-slate-950">
                        {session.lead.fullName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {session.lead.email} · {session.lead.phone}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(session.scheduledAt)}
                        </span>

                        <span>
                          {session.durationMinutes} min
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          {session.mode === "ONLINE" ? (
                            <Video className="h-3.5 w-3.5 text-slate-400" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          {session.mode === "ONLINE"
                            ? "Online"
                            : "In person"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                      {session.counsellor ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Administrator
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-800">
                            {session.counsellor.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {session.counsellor.email}
                          </p>
                          {notificationEmail ? (
                            <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] font-medium text-blue-600">
                              Alerts: {notificationEmail}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {session.meetingLink &&
                      ["SCHEDULED", "RESCHEDULED"].includes(
                        session.status,
                      ) ? (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Join session
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}

                      {["SCHEDULED", "RESCHEDULED"].includes(
                        session.status,
                      ) ? (
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="More counselling actions"
                            aria-expanded={activeMenuId === session.id}
                            onClick={() =>
                              setActiveMenuId((current) =>
                                current === session.id
                                  ? null
                                  : session.id,
                              )
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            More
                          </button>

                          {activeMenuId === session.id ? (
                            <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                              <button
                                type="button"
                                onClick={() =>
                                  openAction(
                                    session,
                                    "COMPLETE",
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Complete counselling
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openAction(
                                    session,
                                    "RESCHEDULE",
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                              >
                                <CalendarClock className="h-4 w-4" />
                                Reschedule
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickAction(
                                    session,
                                    "NO_SHOW",
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:text-amber-700"
                              >
                                <Clock3 className="h-4 w-4" />
                                Mark as no-show
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickAction(
                                    session,
                                    "CANCEL",
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel counselling
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {session.notes ||
                  session.outcome ||
                  session.nextAction ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {session.outcome ? (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            Outcome
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-700">
                            {session.outcome}
                          </p>
                        </div>
                      ) : null}

                      {session.nextAction ? (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            Next action
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-700">
                            {session.nextAction}
                          </p>
                        </div>
                      ) : null}

                      {session.notes ? (
                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Notes
                          </p>
                          <p className="mt-1 leading-5">
                            {session.notes}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>

      {actionSession && actionType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Counselling
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {actionType === "COMPLETE"
                      ? "Complete counselling"
                      : "Reschedule counselling"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {actionSession.lead.fullName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAction}
                  disabled={actionSaving}
                  className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              {actionType === "RESCHEDULE" ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      New date & time
                    </label>
                    <input
                      type="datetime-local"
                      value={actionForm.scheduledAt}
                      onChange={(event) =>
                        setActionForm((current) => ({
                          ...current,
                          scheduledAt: event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Meeting link
                    </label>
                    <input
                      value={actionForm.meetingLink}
                      onChange={(event) =>
                        setActionForm((current) => ({
                          ...current,
                          meetingLink: event.target.value,
                        }))
                      }
                      placeholder="https://meet.google.com/..."
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Counselling outcome
                    </label>
                    <textarea
                      value={actionForm.outcome}
                      onChange={(event) =>
                        setActionForm((current) => ({
                          ...current,
                          outcome: event.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="What happened during the counselling?"
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Next action
                    </label>
                    <input
                      value={actionForm.nextAction}
                      onChange={(event) =>
                        setActionForm((current) => ({
                          ...current,
                          nextAction: event.target.value,
                        }))
                      }
                      placeholder="Application follow-up, payment discussion, next meeting..."
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Notes
                </label>
                <textarea
                  value={actionForm.notes}
                  onChange={(event) =>
                    setActionForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Internal counselling notes..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {actionError ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                  {actionError}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAction}
                  disabled={actionSaving}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void saveAction()}
                  disabled={actionSaving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionSaving ? "Saving..." : actionType === "COMPLETE" ? "Complete counselling" : "Reschedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

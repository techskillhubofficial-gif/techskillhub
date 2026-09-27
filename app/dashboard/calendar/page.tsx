"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CalendarView = "month" | "week" | "day";

type CounsellingSession = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  meetingLink: string | null;
  status: string;
  notes: string | null;
  outcome: string | null;
  nextAction: string | null;
  counsellorId: string | null;
  createdAt: string;
  counsellor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  lead: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    interestedProgram: string | null;
    status: string;
    admissions: Array<{
      id: string;
      admissionNo: string | null;
      studentName: string | null;
      program: string | null;
      status: string;
    }>;
  };
};

const IST = "Asia/Kolkata";

const statusStyles: Record<string, string> = {
  SCHEDULED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
  RESCHEDULED:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
  COMPLETED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  NO_SHOW:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  CANCELLED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
};

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const result: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return {
    year: Number(result.year),
    month: Number(result.month) - 1,
    day: Number(result.day),
  };
}

function dateKey(date: Date) {
  const parts = getDateParts(date);

  return [
    parts.year,
    String(parts.month + 1).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(
    Date.UTC(year, month - 1, day, 5, 30, 0),
  );
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getUTCDay();
  return addDays(date, -day);
}

function formatDateHeading(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function monthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    month: "long",
    year: "numeric",
  }).format(date);
}

function monthGrid(date: Date) {
  const parts = getDateParts(date);
  const first = new Date(
    Date.UTC(parts.year, parts.month, 1, 5, 30, 0),
  );
  const firstDay = first.getUTCDay();
  const start = addDays(first, -firstDay);

  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function weekDates(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function isSameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

function getSessionsForDate(
  sessions: CounsellingSession[],
  date: Date,
) {
  const key = dateKey(date);

  return sessions
    .filter((session) => dateKey(new Date(session.scheduledAt)) === key)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime(),
    );
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default function CalendarPage() {
  const today = new Date();

  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(today);
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] =
    useState<CounsellingSession | null>(null);

  const [action, setAction] = useState<
    "COMPLETE" | "NO_SHOW" | "CANCEL" | "RESCHEDULE" | null
  >(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextAction, setNextAction] = useState("");

  async function loadSessions(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/counselling?limit=200",
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load counselling sessions.",
        );
      }

      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load counselling sessions.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  const todayKey = dateKey(today);

  const upcomingCount = useMemo(
    () =>
      sessions.filter(
        (session) =>
          new Date(session.scheduledAt).getTime() >= today.getTime() &&
          ["SCHEDULED", "RESCHEDULED"].includes(session.status),
      ).length,
    [sessions],
  );

  const todayCount = useMemo(
    () =>
      sessions.filter(
        (session) =>
          dateKey(new Date(session.scheduledAt)) === todayKey,
      ).length,
    [sessions, todayKey],
  );

  const completedCount = useMemo(
    () =>
      sessions.filter((session) => session.status === "COMPLETED")
        .length,
    [sessions],
  );

  const moveCursor = (amount: number) => {
    if (view === "month") {
      const next = new Date(cursor);
      next.setUTCMonth(next.getUTCMonth() + amount);
      setCursor(next);
      return;
    }

    setCursor(addDays(cursor, view === "week" ? amount * 7 : amount));
  };

  const goToday = () => setCursor(today);

  function openAction(
    session: CounsellingSession,
    nextActionValue: typeof action,
  ) {
    setSelected(session);
    setAction(nextActionValue);
    setActionError("");
    setNotes(session.notes || "");
    setOutcome(session.outcome || "");
    setNextAction(session.nextAction || "");
    setMeetingLink(session.meetingLink || "");

    if (nextActionValue === "RESCHEDULE") {
      const date = new Date(session.scheduledAt);

      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: IST,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(date);

      const values: Record<string, string> = {};

      for (const part of parts) {
        if (part.type !== "literal") {
          values[part.type] = part.value;
        }
      }

      setRescheduleDate(
        `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`,
      );
    }
  }

  function closeAction() {
    if (actionLoading) return;

    setAction(null);
    setActionError("");
  }

  async function submitAction() {
    if (!selected || !action) return;

    try {
      setActionLoading(true);
      setActionError("");

      const payload: Record<string, string> = {
        action,
      };

      if (action === "COMPLETE" || action === "NO_SHOW") {
        payload.notes = notes;
        payload.outcome = outcome;
        payload.nextAction = nextAction;
      }

      if (action === "CANCEL") {
        payload.notes = notes;
      }

      if (action === "RESCHEDULE") {
        payload.scheduledAt = rescheduleDate;
        payload.meetingLink = meetingLink;
        payload.notes = notes;
      }

      const response = await fetch(
        `/api/counselling/${selected.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update counselling session.",
        );
      }

      const updated = data.session as CounsellingSession;

      setSessions((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );

      setSelected((current) =>
        current?.id === updated.id
          ? { ...current, ...updated }
          : current,
      );

      setAction(null);
      await loadSessions(true);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update counselling session.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const renderSession = (
    session: CounsellingSession,
    compact = false,
  ) => (
    <div
      key={session.id}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        setSelected(session);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          setSelected(session);
        }
      }}
      className={[
        "w-full cursor-pointer rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md",
        statusStyles[session.status] ||
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
        compact ? "text-xs" : "text-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold">
          {session.lead.fullName}
        </span>

        <span className="shrink-0 text-[10px] font-bold uppercase">
          {formatTime(session.scheduledAt)}
        </span>
      </div>

      <div className="mt-1 truncate opacity-75">
        {session.lead.interestedProgram || "Counselling session"}
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-2 text-[11px] opacity-75">
          <Clock3 className="h-3.5 w-3.5" />
          {session.durationMinutes} min
          {session.counsellor?.name ? (
            <>
              <span>•</span>
              {session.counsellor.name}
            </>
          ) : null}
        </div>
      )}
    </div>
  );

  const renderMonthView = () => {
    const cells = monthGrid(cursor);
    const cursorParts = getDateParts(cursor);

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div
                key={day}
                className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                {day}
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const cellParts = getDateParts(cell);
            const sameMonth =
              cellParts.month === cursorParts.month &&
              cellParts.year === cursorParts.year;
            const isToday = isSameDay(cell, today);
            const daySessions = getSessionsForDate(sessions, cell);

            return (
              <div
                key={dateKey(cell)}
                onClick={() => {
                  setCursor(cell);
                  setView("day");
                }}
                className={[
                  "min-h-[128px] cursor-pointer border-b border-r border-slate-100 p-2 text-left align-top transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
                  !sameMonth
                    ? "bg-slate-50/60 dark:bg-slate-950/60"
                    : "",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      isToday
                        ? "bg-[#2563EB] text-white"
                        : sameMonth
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-300 dark:text-slate-700",
                    ].join(" ")}
                  >
                    {cellParts.day}
                  </span>

                  {daySessions.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {daySessions.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {daySessions.slice(0, 3).map((session) =>
                    renderSession(session, true),
                  )}

                  {daySessions.length > 3 && (
                    <div className="px-1 text-[10px] font-semibold text-slate-400">
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = weekDates(cursor);

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const daySessions = getSessionsForDate(sessions, day);

            return (
              <div
                key={dateKey(day)}
                className="min-h-[560px] border-r border-slate-200 last:border-r-0 dark:border-slate-800"
              >
                <div className="border-b border-slate-200 px-3 py-3 text-center dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {new Intl.DateTimeFormat("en-IN", {
                      timeZone: IST,
                      weekday: "short",
                    }).format(day)}
                  </p>

                  <div
                    className={[
                      "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      isToday
                        ? "bg-[#2563EB] text-white"
                        : "text-slate-700 dark:text-slate-200",
                    ].join(" ")}
                  >
                    {getDateParts(day).day}
                  </div>
                </div>

                <div className="space-y-2 p-2">
                  {daySessions.length > 0 ? (
                    daySessions.map((session) =>
                      renderSession(session, true),
                    )
                  ) : (
                    <div className="py-10 text-center text-xs text-slate-400">
                      No sessions
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const daySessions = getSessionsForDate(sessions, cursor);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Daily schedule
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {formatDateHeading(cursor)}
            </h2>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {daySessions.length} session
            {daySessions.length === 1 ? "" : "s"}
          </span>
        </div>

        {daySessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              No counselling sessions scheduled
            </p>
            <p className="mt-1 text-xs text-slate-400">
              This day currently has no counselling activity.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {daySessions.map((session) => (
              <div
                key={session.id}
                className="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="w-20 shrink-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatTime(session.scheduledAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {session.durationMinutes} min
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  {renderSession(session)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              <CalendarDays className="h-4 w-4" />
              Founder Command Center
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Calendar
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Manage counselling schedules, follow-ups and appointments
              from one operational calendar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => void loadSessions(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={[
                  "h-4 w-4",
                  refreshing ? "animate-spin" : "",
                ].join(" ")}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-400">
              Today
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {todayCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              counselling sessions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-400">
              Upcoming
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {upcomingCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              scheduled or rescheduled
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-400">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {completedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              completed counselling sessions
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveCursor(-1)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => moveCursor(1)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <h2 className="ml-2 text-base font-bold text-slate-900 dark:text-white">
              {view === "month"
                ? monthTitle(cursor)
                : view === "week"
                  ? `${formatShortDate(weekDates(cursor)[0])} – ${formatShortDate(weekDates(cursor)[6])}`
                  : formatDateHeading(cursor)}
            </h2>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["month", "week", "day"] as CalendarView[]).map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setView(item)}
                  className={[
                    "rounded-lg px-4 py-2 text-xs font-bold capitalize transition",
                view === item
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  ].join(" ")}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>

        {error ? (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadSessions()}
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading calendar...
            </div>
          </div>
        ) : view === "month" ? (
          renderMonthView()
        ) : view === "week" ? (
          renderWeekView()
        ) : (
          renderDayView()
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  Counselling session
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                  {selected.lead.fullName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-[11px] font-semibold text-slate-400">
                    Schedule
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {formatDateTime(selected.scheduledAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-[11px] font-semibold text-slate-400">
                    Status
                  </p>
                  <span
                    className={[
                      "mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase",
                      statusStyles[selected.status] ||
                        "border-slate-200 bg-slate-50 text-slate-600",
                    ].join(" ")}
                  >
                    {statusLabel(selected.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Lead</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selected.lead.fullName}
                    </p>
                  </div>
                </div>

                {selected.lead.interestedProgram ? (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">
                        Interested program
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selected.lead.interestedProgram}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">
                      Duration / Mode
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selected.durationMinutes} min • {selected.mode}
                    </p>
                  </div>
                </div>

                {selected.counsellor ? (
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">
                        Counsellor
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selected.counsellor.name ||
                          selected.counsellor.email}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {selected.meetingLink ? (
                <a
                  href={selected.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <Video className="h-4 w-4" />
                  Join Meeting
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}

              {selected.notes ||
              selected.outcome ||
              selected.nextAction ? (
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  {selected.notes ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Notes
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {selected.notes}
                      </p>
                    </div>
                  ) : null}

                  {selected.outcome ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Outcome
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {selected.outcome}
                      </p>
                    </div>
                  ) : null}

                  {selected.nextAction ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Next action
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {selected.nextAction}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {["SCHEDULED", "RESCHEDULED"].includes(
                selected.status,
              ) ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() =>
                      openAction(selected, "COMPLETE")
                    }
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    Complete
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openAction(selected, "RESCHEDULE")
                    }
                    className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300"
                  >
                    Reschedule
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                    openAction(selected, "NO_SHOW")
                    }
                    className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    No-show
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openAction(selected, "CANCEL")
                    }
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {action && selected ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  Update counselling
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  {action === "RESCHEDULE"
                    ? "Reschedule session"
                    : action === "COMPLETE"
                      ? "Complete session"
                      : action === "NO_SHOW"
                        ? "Mark no-show"
                        : "Cancel session"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeAction}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {action === "RESCHEDULE" ? (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                      New date & time
                    </span>
                    <input
                      type="datetime-local"
                      value={rescheduleDate}
                      onChange={(event) =>
                        setRescheduleDate(event.target.value)
                      }
                      className="field"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                      Meeting link
                    </span>
                    <input
                      value={meetingLink}
                      onChange={(event) =>
                        setMeetingLink(event.target.value)
                      }
                      placeholder="https://meet.google.com/..."
                      className="field"
                    />
                  </label>
                </>
              ) : null}

              {action !== "CANCEL" ? (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Outcome
                  </span>
                  <textarea
                    value={outcome}
                    onChange={(event) =>
                      setOutcome(event.target.value)
                    }
                    rows={3}
                    placeholder="What happened during the counselling?"
                    className="field resize-none"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={3}
                  placeholder="Add internal notes..."
                  className="field resize-none"
                />
              </label>

              {action !== "CANCEL" &&
              action !== "RESCHEDULE" ? (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Next action
                  </span>
                  <input
                    value={nextAction}
                    onChange={(event) =>
                      setNextAction(event.target.value)
                    }
                    placeholder="Example: Call tomorrow"
                    className="field"
                  />
                </label>
              ) : null}

              {actionError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {actionError}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAction}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => void submitAction()}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

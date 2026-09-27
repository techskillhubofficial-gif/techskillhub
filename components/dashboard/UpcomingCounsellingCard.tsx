"use client";

import {
  ArrowRight,
  CalendarClock,
  Clock3,
} from "lucide-react";
import { useEffect, useState } from "react";

type Session = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  status: string;
  counsellor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  lead: {
    id: string;
    fullName: string;
    interestedProgram: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export default function UpcomingCounsellingCard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const response = await fetch(
        "/api/counselling?upcoming=true&limit=3",
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load counselling.");
      }

      const result = (await response.json()) as {
        success?: boolean;
        sessions?: Session[];
      };

      if (!result.success) {
        throw new Error("Unable to load counselling.");
      }

      setSessions(result.sessions ?? []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();

    const interval = window.setInterval(() => {
      void load();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <CalendarClock className="h-4 w-4 text-blue-700" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                Counselling
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-950">
                Upcoming sessions
              </h2>
            </div>
          </div>

          <a
            href="/dashboard/counselling"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-7 text-center">
            <p className="text-xs font-semibold text-slate-700">
              No upcoming counselling
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              New sessions assigned to administrators will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {session.lead.fullName}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {session.lead.interestedProgram}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                    {session.mode === "ONLINE"
                      ? "Online"
                      : "In person"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(session.scheduledAt)}
                  <span>·</span>
                  {session.durationMinutes} min
                </div>

                {session.counsellor ? (
                  <p className="mt-2 text-[11px] font-medium text-slate-600">
                    Assigned to {session.counsellor.name}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

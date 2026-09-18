"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  UserPlus,
} from "lucide-react";

interface Activity {
  id: string;
  initials: string;
  name: string;
  title: string;
  description?: string | null;
  type: string;
  activityType?: string;
  time: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

function getActivityIcon(activity: Activity) {
  const type = activity.activityType || activity.type;

  if (type === "CALL") {
    return Phone;
  }

  if (type === "WHATSAPP") {
    return MessageCircle;
  }

  if (type === "EMAIL") {
    return Mail;
  }

  if (type === "LEAD_CREATED") {
    return UserPlus;
  }

  if (type === "FOLLOW_UP_COMPLETED") {
    return CheckCircle2;
  }

  return Clock3;
}

function getActivityTone(activity: Activity) {
  const type = activity.activityType || activity.type;

  if (type === "FOLLOW_UP_COMPLETED") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (type === "LEAD_CREATED") {
    return "bg-blue-50 text-blue-600";
  }

  if (type === "STATUS_CHANGED") {
    return "bg-violet-50 text-violet-600";
  }

  return "bg-slate-50 text-slate-500";
}

export default function RecentActivity({
  activities,
  loading = false,
}: RecentActivityProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Live CRM
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-950">
            Recent activity
          </h2>
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
          Live
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-5 py-4 sm:px-6"
            >
              <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
                <div className="h-2.5 w-64 max-w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Clock3 className="mx-auto h-6 w-6 text-slate-300" />

            <p className="mt-2 text-xs font-semibold text-slate-700">
              No recent activity
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              CRM actions will appear here as your team works.
            </p>
          </div>
        ) : (
          activities.slice(0, 8).map((activity) => {
            const Icon = getActivityIcon(activity);
            const tone = getActivityTone(activity);

            return (
              <a
                key={activity.id}
                href="/dashboard/leads"
                className="group flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
              >
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600">
                  {activity.initials || "TS"}

                  <span
                    className={[
                      "absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white",
                      tone,
                    ].join(" ")}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {activity.name}
                    </p>

                    <span className="shrink-0 text-[9px] font-medium text-slate-400">
                      {activity.time}
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                    {activity.title}
                  </p>

                  {activity.description ? (
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {activity.description}
                    </p>
                  ) : null}
                </div>

                <ArrowUpRight className="hidden h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-blue-500 sm:block" />
              </a>
            );
          })
        )}
      </div>

      {!loading && activities.length > 0 ? (
        <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
          <a
            href="/dashboard/leads"
            className="flex items-center justify-between text-[10px] font-semibold text-slate-400 transition hover:text-blue-600"
          >
            View activity from CRM
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      ) : null}
    </motion.section>
  );
}
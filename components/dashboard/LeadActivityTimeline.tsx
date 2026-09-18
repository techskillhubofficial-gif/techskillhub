"use client";

import {
  Activity,
  CheckCircle2,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ActivityType =
  | "LEAD_CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "NOTE_UPDATED"
  | "ASSIGNED"
  | "CALL"
  | "WHATSAPP"
  | "EMAIL"
  | "FOLLOW_UP_CREATED"
  | "FOLLOW_UP_COMPLETED"
  | "FOLLOW_UP_CANCELLED";

export interface LeadActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string | Date;
}

interface LeadActivityTimelineProps {
  activities: LeadActivityItem[];
  loading?: boolean;
}

const activityConfig: Record<
  ActivityType,
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  LEAD_CREATED: {
    icon: UserRound,
    label: "Lead created",
  },
  UPDATED: {
    icon: Activity,
    label: "Lead updated",
  },
  STATUS_CHANGED: {
    icon: CheckCircle2,
    label: "Status changed",
  },
  NOTE_ADDED: {
    icon: FileText,
    label: "Note added",
  },
  NOTE_UPDATED: {
    icon: FileText,
    label: "Note updated",
  },
  ASSIGNED: {
    icon: UserRound,
    label: "Lead assigned",
  },
  CALL: {
    icon: Phone,
    label: "Call",
  },
  WHATSAPP: {
    icon: MessageCircle,
    label: "WhatsApp",
  },
  EMAIL: {
    icon: Mail,
    label: "Email",
  },
  FOLLOW_UP_CREATED: {
    icon: Activity,
    label: "Follow-up created",
  },
  FOLLOW_UP_COMPLETED: {
    icon: CheckCircle2,
    label: "Follow-up completed",
  },
  FOLLOW_UP_CANCELLED: {
    icon: Activity,
    label: "Follow-up cancelled",
  },
};

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function LeadActivityTimeline({
  activities,
  loading = false,
}: LeadActivityTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex gap-3 animate-pulse"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-3 w-56 rounded bg-slate-100" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
          <Activity className="h-5 w-5" />
        </div>

        <p className="mt-3 text-sm font-medium text-slate-700">
          No activity yet
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Lead interactions and updates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[17px] top-2 w-px bg-slate-200" />

      <div className="space-y-6">
        {activities.map((activity) => {
          const config =
            activityConfig[activity.type] ??
            activityConfig.UPDATED;

          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="relative flex gap-3"
            >
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.title}
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      {config.label}
                    </p>
                  </div>

                  <time
                    dateTime={
                      activity.createdAt instanceof Date
                        ? activity.createdAt.toISOString()
                        : activity.createdAt
                    }
                    className="shrink-0 text-xs text-slate-400"
                  >
                    {formatDate(activity.createdAt)}
                  </time>
                </div>

                {activity.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {activity.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
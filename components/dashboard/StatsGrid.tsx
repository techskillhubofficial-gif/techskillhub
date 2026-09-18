"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  PhoneCall,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

interface DashboardStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  enrolled: number;
  closed: number;
}

interface StatsGridProps {
  stats: DashboardStats;
  currentMonthLeads: number;
  currentMonthEnrollments: number;
  leadChange: number;
  enrollmentChange: number;
  loading?: boolean;
}

function formatChange(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const rounded = Math.round(value);

  if (rounded > 0) {
    return `+${rounded}%`;
  }

  return `${rounded}%`;
}

const cards = [
  {
    key: "total",
    label: "Total leads",
    icon: Users,
    description: "All active CRM records",
  },
  {
    key: "new",
    label: "New leads",
    icon: UserPlus,
    description: "Waiting for first contact",
  },
  {
    key: "contacted",
    label: "Contacted",
    icon: PhoneCall,
    description: "Currently in conversation",
  },
  {
    key: "enrolled",
    label: "Enrolled",
    icon: CheckCircle2,
    description: "Converted to enrollment",
  },
] as const;

export default function StatsGrid({
  stats,
  currentMonthLeads,
  currentMonthEnrollments,
  leadChange,
  enrollmentChange,
  loading = false,
}: StatsGridProps) {
  const values: Record<
    (typeof cards)[number]["key"],
    number
  > = {
    total: stats.total,
    new: stats.new,
    contacted: stats.contacted,
    enrolled: stats.enrolled,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = values[card.key];

        const change =
          card.key === "new"
            ? leadChange
            : card.key === "enrolled"
              ? enrollmentChange
              : null;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.05,
            }}
            className="group rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {card.label}
                </p>

                {loading ? (
                  <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-slate-950">
                    {value.toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-blue-50">
                <Icon className="h-4.5 w-4.5 text-slate-500 transition group-hover:text-blue-600" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="truncate text-[10px] font-medium text-slate-400">
                {card.description}
              </p>

              {change !== null ? (
                <span
                  className={[
                    "shrink-0 rounded-full px-2 py-1 text-[9px] font-bold",
                    change > 0
                      ? "bg-emerald-50 text-emerald-600"
                      : change < 0
                        ? "bg-red-50 text-red-600"
                        : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {formatChange(change)}
                </span>
              ) : null}
            </div>
          </motion.div>
        );
      })}

      <div className="hidden">
        <span>{currentMonthLeads}</span>
        <span>{currentMonthEnrollments}</span>
        <Target />
      </div>
    </div>
  );
}
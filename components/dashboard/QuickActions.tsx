"use client";

import { motion } from "framer-motion";
import {
  CalendarPlus,
  GraduationCap,
  MessageSquareText,
  Plus,
  ReceiptText,
  UserPlus,
} from "lucide-react";

const actions = [
  {
    title: "Add new lead",
    description: "Create a consultation enquiry",
    icon: UserPlus,
  },
  {
    title: "Schedule counselling",
    description: "Book a student consultation",
    icon: CalendarPlus,
  },
  {
    title: "Create admission",
    description: "Convert a qualified lead",
    icon: GraduationCap,
  },
  {
    title: "Send message",
    description: "Reach students or leads",
    icon: MessageSquareText,
  },
  {
    title: "Record payment",
    description: "Add a fee transaction",
    icon: ReceiptText,
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-400">
          PRODUCTIVITY
        </p>

        <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-950">
          Quick actions
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Common actions, one click away.
        </p>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.title}
              type="button"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50"
            >
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  index === 0
                    ? "bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600",
                ].join(" ")}
              >
                {index === 0 ? (
                  <Plus className="h-5 w-5" />
                ) : (
                  <Icon className="h-4.5 w-4.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  {action.title}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
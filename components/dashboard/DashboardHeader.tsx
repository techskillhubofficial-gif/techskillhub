"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarPlus,
  Download,
  Plus,
  Sparkles,
} from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  eyebrow?: string;
  onAddLead?: () => void;
}

export default function DashboardHeader({
  title = "Good morning, Manvendra",
  description = "Here’s what’s happening across your TechSkillHub ecosystem today.",
  eyebrow = "EDUCATION OS · COMMAND CENTER",
  onAddLead,
}: DashboardHeaderProps) {
  return (
    <div className="mb-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>

          <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Export
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onAddLead}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add lead
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
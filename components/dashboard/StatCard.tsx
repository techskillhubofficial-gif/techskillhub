"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType?: "positive" | "negative" | "neutral";
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconBackground?: string;
  index?: number;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "positive",
  description,
  icon: Icon,
  iconClassName = "text-blue-600",
  iconBackground = "bg-blue-50",
  index = 0,
}: StatCardProps) {
  const positive = changeType === "positive";
  const negative = changeType === "negative";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-shadow hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/[0.035] blur-2xl transition-all duration-500 group-hover:bg-blue-500/[0.07]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl",
              iconBackground,
            ].join(" ")}
          >
            <Icon className={["h-5 w-5", iconClassName].join(" ")} />
          </div>

          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold",
              positive
                ? "bg-emerald-50 text-emerald-600"
                : negative
                  ? "bg-red-50 text-red-500"
                  : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            {positive && <ArrowUpRight className="h-3 w-3" />}
            {negative && <ArrowDownRight className="h-3 w-3" />}
            {change}
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-[30px] font-bold tracking-[-0.04em] text-slate-950">
              {value}
            </p>
          </div>

          {description && (
            <p className="mt-1 text-[11px] text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
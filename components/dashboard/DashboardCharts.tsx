"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const leadData = [
  { month: "Jan", leads: 42, enrolled: 12 },
  { month: "Feb", leads: 58, enrolled: 18 },
  { month: "Mar", leads: 51, enrolled: 15 },
  { month: "Apr", leads: 76, enrolled: 24 },
  { month: "May", leads: 91, enrolled: 31 },
  { month: "Jun", leads: 84, enrolled: 28 },
  { month: "Jul", leads: 108, enrolled: 39 },
  { month: "Aug", leads: 124, enrolled: 46 },
  { month: "Sep", leads: 138, enrolled: 52 },
  { month: "Oct", leads: 151, enrolled: 61 },
  { month: "Nov", leads: 164, enrolled: 68 },
  { month: "Dec", leads: 182, enrolled: 77 },
];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.10)",
};

export default function DashboardCharts() {
  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
      >
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BarChart3 className="h-4 w-4" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                CRM Performance
              </span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Lead & enrollment growth
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track how enquiries are moving through your admissions funnel.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            This year
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-sm text-slate-500">Total leads</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
            <span className="text-sm text-slate-500">Enrolled</span>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={leadData}
              margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>

                <linearGradient
                  id="enrollmentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="4 5"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
                width={38}
              />

              <Tooltip
                cursor={{
                  stroke: "#cbd5e1",
                  strokeDasharray: "4 4",
                }}
                contentStyle={tooltipStyle}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                  marginBottom: 5,
                }}
                itemStyle={{
                  color: "#475569",
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#leadGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                  stroke: "#ffffff",
                  fill: "#2563eb",
                }}
              />

              <Area
                type="monotone"
                dataKey="enrolled"
                name="Enrolled"
                stroke="#818cf8"
                strokeWidth={2}
                fill="url(#enrollmentGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 3,
                  stroke: "#ffffff",
                  fill: "#818cf8",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
      >
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Conversion
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Admissions overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current conversion performance across your pipeline.
          </p>
        </div>

        <div className="space-y-6">
          <MetricRow
            label="New enquiries"
            value="182"
            change="+18.4%"
            positive
            progress={86}
          />

          <MetricRow
            label="Contacted"
            value="146"
            change="+12.8%"
            positive
            progress={72}
          />

          <MetricRow
            label="Qualified"
            value="94"
            change="+9.6%"
            positive
            progress={55}
          />

          <MetricRow
            label="Enrolled"
            value="77"
            change="+16.2%"
            positive
            progress={43}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Overall conversion
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Leads converted into enrolled students this year.
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight text-blue-600">
                42.3%
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                4.8%
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

type MetricRowProps = {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  progress: number;
};

function MetricRow({
  label,
  value,
  change,
  positive = true,
  progress,
}: MetricRowProps) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {progress}% of pipeline
          </p>
        </div>

        <div className="text-right">
          <p className="text-base font-semibold text-slate-950">{value}</p>

          <div
            className={`mt-0.5 flex items-center justify-end gap-0.5 text-[11px] font-semibold ${
              positive ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {change}
          </div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
        />
      </div>
    </div>
  );
}
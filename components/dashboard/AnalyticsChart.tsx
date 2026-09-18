"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface GrowthPoint {
  name: string;
  leads: number;
  admissions: number;
}

interface AnalyticsChartProps {
  data: GrowthPoint[];
  loading?: boolean;
}

function ChartSkeleton() {
  return (
    <div className="h-[320px] w-full animate-pulse rounded-xl bg-slate-50" />
  );
}

export default function AnalyticsChart({
  data,
  loading = false,
}: AnalyticsChartProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Performance
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
            Lead & Admission Growth
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Monthly CRM performance over the last 9 months
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-medium text-slate-500">
              Leads
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-500">
              Admissions
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-5 pt-5 sm:px-5">
        {loading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center rounded-xl bg-slate-50">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                No growth data yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Lead activity will appear here as your CRM grows.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />

                <Tooltip
                  cursor={{
                    stroke: "#CBD5E1",
                    strokeWidth: 1,
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    padding: "10px 12px",
                  }}
                  labelStyle={{
                    color: "#0F172A",
                    fontWeight: 700,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                  itemStyle={{
                    fontSize: 12,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="leads"
                  name="Leads"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    strokeWidth: 2,
                    fill: "#FFFFFF",
                  }}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="admissions"
                  name="Admissions"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    strokeWidth: 2,
                    fill: "#FFFFFF",
                  }}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

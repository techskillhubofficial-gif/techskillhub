"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Code2,
  Palette,
  Sparkles,
} from "lucide-react";

type ProgramId = "codeforge" | "insightiq" | "designsphere" | "growthx";

type Program = {
  id: ProgramId;
  number: string;
  name: string;
  eyebrow: string;
  headline: string;
  description: string;
  accent: string;
  icon: typeof Code2;
};

const programs: Program[] = [
  {
    id: "codeforge",
    number: "01",
    name: "CodeForge™",
    eyebrow: "ENGINEERING",
    headline: "Build digital products.",
    description:
      "A technical learning direction centred on building, problem-solving and practical development work.",
    accent: "blue",
    icon: Code2,
  },
  {
    id: "insightiq",
    number: "02",
    name: "InsightIQ™",
    eyebrow: "ANALYTICS",
    headline: "Turn information into decisions.",
    description:
      "A data-focused learning direction built around analysis, interpretation and practical problem-solving.",
    accent: "violet",
    icon: BarChart3,
  },
  {
    id: "designsphere",
    number: "03",
    name: "DesignSphere™",
    eyebrow: "DESIGN",
    headline: "Shape digital experiences.",
    description:
      "A creative direction focused on interfaces, visual systems and user-centred digital experiences.",
    accent: "pink",
    icon: Palette,
  },
  {
    id: "growthx",
    number: "04",
    name: "GrowthX™",
    eyebrow: "BUSINESS",
    headline: "Create business momentum.",
    description:
      "A business-focused direction connecting communication, growth thinking and career-oriented skills.",
    accent: "green",
    icon: BriefcaseBusiness,
  },
];

function ProgramVisual({ id }: { id: ProgramId }) {
  if (id === "codeforge") {
    return (
      <div className="relative h-full min-h-[430px] overflow-hidden rounded-[30px] bg-[#071120] p-7 text-white shadow-[0_30px_90px_rgba(7,17,32,.20)]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-50px] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-blue-300">Build environment</p>
            <p className="mt-2 text-sm text-white/80">Product workspace</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/50">LIVE BUILD</span>
        </div>
        <div className="relative mt-6 grid grid-cols-[92px_1fr] gap-4">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[.025] p-3">
            {["Structure", "Interface", "Logic", "Data", "Deploy"].map((item, i) => (
              <div key={item} className={`rounded-lg px-2 py-2 text-[9px] ${i === 1 ? "bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/30" : "text-white/35"}`}>
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0e192c] p-5">
            <div className="flex gap-1.5">
              <i className="h-2 w-2 rounded-full bg-white/20" />
              <i className="h-2 w-2 rounded-full bg-white/20" />
              <i className="h-2 w-2 rounded-full bg-white/20" />
            </div>
            <div className="mt-6 grid grid-cols-[1.5fr_.7fr] gap-3">
              <div className="h-36 rounded-xl bg-gradient-to-br from-blue-500/50 via-indigo-500/30 to-transparent ring-1 ring-white/10" />
              <div className="space-y-3">
                <div className="h-10 rounded-lg bg-white/[.07]" />
                <div className="h-10 rounded-lg bg-blue-500/25" />
                <div className="h-10 rounded-lg bg-white/[.05]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => <div key={n} className="h-9 rounded-lg bg-white/[.06]" />)}
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 right-7 rounded-2xl border border-blue-300/20 bg-blue-400/10 px-4 py-3 backdrop-blur">
          <p className="text-[9px] uppercase tracking-[.2em] text-blue-200">Work in progress</p>
          <p className="mt-1 text-xs text-white/80">Build → test → improve</p>
        </div>
      </div>
    );
  }

  if (id === "insightiq") {
    return (
      <div className="relative h-full min-h-[430px] overflow-hidden rounded-[30px] bg-[#f2f3ff] p-7 shadow-[0_30px_90px_rgba(75,76,180,.12)]">
        <div className="absolute right-[-70px] top-[-80px] h-64 w-64 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-violet-600">Decision workspace</p>
            <p className="mt-2 text-sm font-medium text-slate-800">From information to insight</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-[10px] text-slate-500 shadow-sm">Explore</span>
        </div>
        <div className="relative mt-7 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="grid grid-cols-3 gap-3">
            {["Observe", "Compare", "Decide"].map((x) => (
              <div key={x} className="rounded-2xl border border-slate-100 p-4">
                <div className="h-2 w-10 rounded-full bg-violet-100" />
                <p className="mt-4 text-xs font-semibold text-slate-700">{x}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-48 items-end gap-3 rounded-2xl bg-slate-50 px-6 pb-5 pt-8">
            {[38, 52, 44, 72, 58, 86, 70, 98, 78].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-300 transition-all duration-700 hover:-translate-y-2" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[9px] text-slate-400">
            <span>Structured data</span>
            <span>Business-facing interpretation</span>
          </div>
        </div>
      </div>
    );
  }

  if (id === "designsphere") {
    return (
      <div className="relative h-full min-h-[430px] overflow-hidden rounded-[30px] bg-[#f8f2ff] p-7 shadow-[0_30px_90px_rgba(160,91,255,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,.32),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,.16),transparent_28%)]" />
        <div className="relative flex h-full items-center justify-center gap-6">
          <div className="w-[180px] -rotate-3 rounded-[28px] border border-white bg-white p-3 shadow-[0_24px_50px_rgba(66,38,100,.16)]">
            <div className="rounded-[20px] bg-[#eef0ff] p-4">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="mt-5 h-32 rounded-[18px] bg-gradient-to-br from-indigo-100 to-violet-200" />
              <div className="mt-4 h-2 w-24 rounded-full bg-slate-200" />
              <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
              <div className="mt-5 h-11 rounded-xl bg-indigo-500" />
            </div>
          </div>
          <div className="w-[230px] rotate-3 rounded-[28px] border border-white bg-white p-4 shadow-[0_24px_50px_rgba(66,38,100,.12)]">
            <p className="text-[9px] uppercase tracking-[.25em] text-fuchsia-500">Design system</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-slate-100" />)}
            </div>
            <div className="mt-5 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-[30px] bg-[#effbf5] p-7 shadow-[0_30px_90px_rgba(16,185,129,.10)]">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="relative grid h-full grid-cols-[.7fr_1.3fr] gap-4">
        <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-[9px] uppercase tracking-[.25em] text-emerald-600">Flow</p>
          <div className="mt-8 space-y-5">
            {["Audience", "Message", "Channel", "Measure"].map((x, i) => (
              <div key={x} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-semibold text-emerald-700">{`0${i + 1}`}</span>
                <span className="text-xs font-semibold text-slate-700">{x}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div className="flex justify-between">
            <p className="text-[9px] uppercase tracking-[.25em] text-slate-400">Workflow</p>
            <p className="text-[9px] text-slate-400">Growth</p>
          </div>
          <div className="mt-8 space-y-5">
            {[72, 94, 52, 82].map((w, i) => (
              <div key={i}>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-emerald-50 p-4 text-[10px] leading-5 text-emerald-800">
            Practical business context → clear action → measurable follow-through.
          </div>
        </div>
      </div>
    </div>
  );
}

export function VisualShowcase() {
  const [activeId, setActiveId] = useState<ProgramId>("codeforge");
  const [visible, setVisible] = useState(false);

  const active = programs.find((p) => p.id === activeId) ?? programs[0];
  const ActiveIcon = active.icon;

  useEffect(() => {
    const node = document.getElementById("tsh-program-showcase");
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="tsh-program-showcase" className="relative overflow-hidden border-y border-slate-200/70 bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className={`grid gap-14 lg:grid-cols-[.72fr_1.28fr] lg:items-end transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.34em] text-blue-600">Four professional directions</p>
            <h2 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-.055em] text-slate-950 sm:text-6xl lg:text-[72px] lg:leading-[.94]">
              Choose a direction.
              <br />
              <span className="text-slate-400">Then build inside it.</span>
            </h2>
            <p className="mt-8 max-w-lg text-base leading-7 text-slate-500">
              Explore each TechSkillHub program through the kind of work, environment and professional direction it represents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-2">
            {programs.map((p) => {
              const Icon = p.icon;
              const selected = active.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveId(p.id)}
                  className={`group relative rounded-2xl p-4 text-left transition-all duration-500 sm:p-5 ${selected ? "bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,.14)]" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  <Icon className={`h-5 w-5 ${selected ? "text-white" : "text-slate-400"}`} />
                  <span className={`mt-5 block text-[9px] font-semibold tracking-[.25em] ${selected ? "text-white/45" : "text-slate-400"}`}>{p.number}</span>
                  <span className="mt-1 block text-sm font-semibold">{p.name}</span>
                  <span className={`mt-3 block h-0.5 w-0 transition-all duration-500 group-hover:w-full ${selected ? "bg-blue-500 w-full" : "bg-slate-300"}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className={`mt-12 grid gap-5 lg:grid-cols-[1.15fr_.85fr] transition-all duration-1000 delay-150 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <div key={active.id} className="animate-[tshReveal_.7s_ease-out]">
            <ProgramVisual id={active.id} />
          </div>

          <article key={`${active.id}-copy`} className="flex min-h-[430px] flex-col justify-between rounded-[30px] border border-slate-200 bg-[#fbfcfe] p-8 shadow-[0_20px_70px_rgba(15,23,42,.05)] sm:p-12 animate-[tshReveal_.7s_ease-out]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[.3em] text-slate-400">{active.number} / {active.name}</span>
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-16 text-[10px] font-semibold uppercase tracking-[.28em] text-blue-600">{active.eyebrow}</p>
              <h3 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-.045em] text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.02]">{active.headline}</h3>
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-500">{active.description}</p>
            </div>
            <a href={`/programs/${active.id}`} className="mt-10 inline-flex w-fit items-center gap-2 border-t border-slate-200 pt-5 text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600">
              Explore program <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>
        </div>
      </div>

      <style jsx global>{`
        @keyframes tshReveal {
          from { opacity: 0; transform: translateY(16px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  );
}

export default VisualShowcase;

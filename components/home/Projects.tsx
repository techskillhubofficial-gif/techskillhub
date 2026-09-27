"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const projects = [
  {
    number: "01",
    label: "CODEFORGE™",
    title: "Build something people can use.",
    description: "A product-building direction where the work is the centre of the learning experience.",
    kind: "ENGINEERING",
    className: "bg-[#071120]",
  },
  {
    number: "02",
    label: "INSIGHTIQ™",
    title: "Turn information into a useful story.",
    description: "A data and analysis direction focused on making information easier to understand and act on.",
    kind: "ANALYTICS",
    className: "bg-[#f0f2ff]",
  },
  {
    number: "03",
    label: "DESIGNSPHERE™",
    title: "Shape an experience, not just a screen.",
    description: "A design direction centred on visual systems, interfaces and digital experiences.",
    kind: "DESIGN",
    className: "bg-[#faf4ff]",
  },
  {
    number: "04",
    label: "GROWTHX™",
    title: "Turn an idea into a growth workflow.",
    description: "A business direction connecting communication, growth thinking and practical execution.",
    kind: "BUSINESS",
    className: "bg-[#eefbf5]",
  },
];

function Visual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="h-full min-h-[310px] p-7">
        <div className="flex h-full overflow-hidden rounded-[22px] border border-white/10 bg-[#0e1a2d]">
          <div className="w-[23%] border-r border-white/10 p-4">
            {[1,2,3,4,5].map((x) => <div key={x} className={`mb-3 h-2 rounded-full ${x === 2 ? "bg-blue-400/70" : "bg-white/10"}`} />)}
          </div>
          <div className="flex-1 p-5">
            <div className="flex justify-between">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="h-3 w-12 rounded bg-blue-400/40" />
            </div>
            <div className="mt-7 grid grid-cols-[1.5fr_.7fr] gap-3">
              <div className="h-36 rounded-2xl bg-gradient-to-br from-blue-500/45 to-indigo-500/10" />
              <div className="space-y-3"><div className="h-10 rounded-xl bg-white/10" /><div className="h-10 rounded-xl bg-white/5" /><div className="h-10 rounded-xl bg-white/5" /></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">{[1,2,3].map(x => <div key={x} className="h-12 rounded-xl bg-white/5" />)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="h-full min-h-[310px] p-7">
        <div className="h-full rounded-[22px] bg-white p-6 shadow-sm ring-1 ring-indigo-100">
          <div className="flex gap-3">{[1,2,3].map(x => <div key={x} className="flex-1 rounded-xl bg-slate-50 p-3"><div className="h-2 w-12 rounded bg-indigo-100" /><div className="mt-3 h-6 w-10 rounded bg-slate-100" /></div>)}</div>
          <div className="mt-5 flex h-40 items-end gap-3 rounded-2xl bg-slate-50 px-5 pb-5">{[30,45,36,60,50,78,65,88].map((h,i) => <div key={i} className="flex-1 rounded-t-md bg-indigo-400/80" style={{height:`${h}%`}} />)}</div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="flex h-full min-h-[310px] items-center justify-center gap-5 p-7">
        <div className="w-36 -rotate-4 rounded-[24px] bg-white p-3 shadow-xl ring-1 ring-violet-100">
          <div className="h-24 rounded-2xl bg-violet-100" /><div className="mt-3 h-2 w-16 rounded bg-slate-200" /><div className="mt-2 h-2 w-12 rounded bg-slate-100" /><div className="mt-4 h-9 rounded-xl bg-violet-500" />
        </div>
        <div className="w-48 rotate-3 rounded-[24px] bg-white p-4 shadow-xl ring-1 ring-violet-100">
          <div className="grid grid-cols-3 gap-2">{Array.from({length:9}).map((_,i)=><div key={i} className="h-8 rounded-lg bg-slate-100" />)}</div>
          <div className="mt-4 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[310px] p-7">
      <div className="h-full rounded-[22px] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <div className="grid grid-cols-[.65fr_1.35fr] gap-5">
          <div className="space-y-4">{["Audience","Message","Channel","Measure"].map((x,i)=><div key={x} className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-emerald-100 text-center text-[8px] leading-6 text-emerald-700">{i+1}</span><span className="text-[10px] font-semibold text-slate-600">{x}</span></div>)}</div>
          <div className="space-y-4">{[65,88,48,78].map((w,i)=><div key={i} className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-400" style={{width:`${w}%`}} /></div>)}</div>
        </div>
        <div className="mt-7 rounded-2xl bg-emerald-50 p-4 text-[10px] leading-5 text-emerald-800">Clear action. Practical context. Measurable follow-through.</div>
      </div>
    </div>
  );
}

export function Projects() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = document.getElementById("tsh-projects");
    if (!node) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); o.disconnect(); } }, { threshold: .12 });
    o.observe(node);
    return () => o.disconnect();
  }, []);

  return (
    <section id="tsh-projects" className="overflow-hidden bg-[#071120] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className={`flex flex-col justify-between gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-end transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.34em] text-blue-300">Practical work</p>
            <h2 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-.055em] sm:text-6xl lg:text-[70px] lg:leading-[.95]">
              The work should make the learning visible.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/45">Illustrative project directions and interface studies — not claims of completed student work.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {projects.map((project, i) => (
            <article key={project.number} className={`group overflow-hidden rounded-[28px] border border-white/10 ${project.className} transition-transform duration-500 hover:-translate-y-1`}>
              <Visual index={i} />
              <div className="border-t border-black/5 p-7 text-slate-950 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold tracking-[.28em] text-slate-400">{project.number} / {project.label}</span>
                  <span className="text-[9px] font-semibold tracking-[.2em] text-slate-400">{project.kind}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">{project.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{project.description}</p>
                <a href="/programs" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-900 transition-colors hover:text-blue-600">Explore the direction <ArrowUpRight className="h-4 w-4" /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;

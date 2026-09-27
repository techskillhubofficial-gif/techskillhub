"use client";

import { ArrowUpRight, CheckCircle2, ExternalLink, FolderOpen, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export function PortfolioShowcase() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = document.getElementById("tsh-portfolio");
    if (!node) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); o.disconnect(); } }, { threshold: .15 });
    o.observe(node);
    return () => o.disconnect();
  }, []);

  return (
    <section id="tsh-portfolio" className="overflow-hidden border-b border-slate-200 bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className={`grid gap-14 lg:grid-cols-[.72fr_1.28fr] lg:items-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.34em] text-blue-600">Portfolio</p>
            <h2 className="mt-5 text-5xl font-semibold tracking-[-.055em] text-slate-950 sm:text-6xl">Let the work speak.</h2>
            <p className="mt-7 max-w-md text-base leading-7 text-slate-500">A professional profile can bring approved work, learning records and credentials together in one shareable experience.</p>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {[
                ["01", "Project work", "Show what was actually built or submitted."],
                ["02", "Learning record", "Keep the learning journey connected to the work."],
                ["03", "Credentials", "Present approved records in one place."],
                ["04", "Shareable profile", "A professional public-facing portfolio experience."],
              ].map(([n, title, text]) => (
                <div key={n} className="flex gap-4 py-5">
                  <span className="text-[9px] font-semibold tracking-[.25em] text-blue-500">{n}</span>
                  <div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-[32px] border border-slate-200 bg-[#f7f9fc] p-4 shadow-[0_35px_100px_rgba(15,23,42,.10)] sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div><p className="text-[10px] font-semibold text-slate-800">Professional profile</p><p className="mt-1 text-[8px] text-slate-400">Example experience — not student data</p></div>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-medium text-slate-500">Share ↗</button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[.62fr_1.38fr]">
              <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
                  <UserRound className="h-10 w-10 text-slate-300" />
                </div>
                <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[8px] font-semibold uppercase tracking-[.18em] text-blue-600">Profile image area</span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Your professional story</h3>
                <p className="mt-2 text-[10px] leading-4 text-slate-500">Profile identity, approved work and learning records can come together here.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[.2em] text-blue-500">Featured work</span><span className="text-[8px] text-slate-400">VIEW</span></div>
                  <div className="mt-4 overflow-hidden rounded-2xl bg-[#071120] p-4">
                    <div className="h-2 w-20 rounded bg-white/15" />
                    <div className="mt-4 h-20 rounded-xl bg-gradient-to-br from-blue-500/45 to-indigo-500/10" />
                    <div className="mt-3 flex gap-2"><div className="h-2 w-14 rounded bg-white/10" /><div className="h-2 w-20 rounded bg-white/10" /></div>
                  </div>
                </div>

                <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[.2em] text-slate-400">Learning record</span><span className="text-[8px] text-blue-500">PUBLIC PROFILE ↗</span></div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[FolderOpen, CheckCircle2, ExternalLink].map((Icon, i) => <div key={i} className={`flex h-12 items-center justify-center rounded-xl ${i === 2 ? "bg-blue-50" : "bg-slate-50"}`}><Icon className={`h-4 w-4 ${i === 2 ? "text-blue-500" : "text-slate-300"}`} /></div>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[20px] bg-slate-950 px-5 py-4 text-white">
              <div><p className="text-[8px] font-semibold uppercase tracking-[.22em] text-blue-300">Public portfolio</p><p className="mt-1 text-[10px] text-white/55">A shareable professional presentation of approved work.</p></div>
              <span className="flex items-center gap-2 text-[10px] font-semibold">View profile <ArrowUpRight className="h-3 w-3" /></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PortfolioShowcase;

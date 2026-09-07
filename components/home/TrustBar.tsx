"use client";

import { Container } from "@/components/layout/Container";
import {
  GraduationCap,
  Building2,
  BrainCircuit,
  Briefcase,
} from "lucide-react";

const items = [
  {
    icon: GraduationCap,
    title: "5 Career Programs",
    subtitle: "Industry-focused learning",
  },
  {
    icon: BrainCircuit,
    title: "AI Powered",
    subtitle: "Modern learning experience",
  },
  {
    icon: Building2,
    title: "Institute Partnerships",
    subtitle: "Campus collaboration",
  },
  {
    icon: Briefcase,
    title: "Career Focused",
    subtitle: "Practical & project-based",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <Container>
        <div className="grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl p-4 transition hover:bg-slate-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
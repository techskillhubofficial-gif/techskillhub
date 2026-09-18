"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

type NavigationIcon =
  | "dashboard"
  | "learning"
  | "assignments"
  | "calendar"
  | "attendance"
  | "performance"
  | "documents"
  | "payments"
  | "certificates";

type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIcon;
};

type NavigationSection = {
  section: string;
  items: NavigationItem[];
};

const icons = {
  dashboard: LayoutDashboard,
  learning: BookOpen,
  assignments: ClipboardList,
  calendar: CalendarDays,
  attendance: UsersRound,
  performance: Trophy,
  documents: FileText,
  payments: CreditCard,
  certificates: GraduationCap,
};

export default function StudentPortalShell({
  children,
  studentName,
  initials,
  navigation,
}: {
  children: React.ReactNode;
  studentName: string;
  initials: string;
  navigation: NavigationSection[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/student-portal") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[274px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[88px] items-center border-b border-slate-100 px-7">
          <Link
            href="/student-portal"
            onClick={closeMobile}
            className="flex min-w-0 items-center"
          >
            <Image
              src="/logo/Full-logo.png"
              alt="TechSkillHub"
              width={154}
              height={44}
              priority
              className="h-auto w-[154px] object-contain object-left"
            />
          </Link>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7">
          {navigation.map((group) => (
            <div key={group.section} className="mb-7">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = icons[item.icon];
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className={[
                        "group flex h-[44px] items-center gap-3 rounded-[13px] px-3.5 text-[13px] font-semibold transition-all",
                        active
                          ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-[18px] w-[18px] shrink-0",
                          active
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-800",
                        ].join(" ")}
                      />

                      <span className="flex-1">{item.label}</span>

                      {active && (
                        <ChevronRight className="h-4 w-4 text-white/90" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <Link
            href="/contact"
            onClick={closeMobile}
            className="group flex items-center gap-3 rounded-[15px] border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Headphones className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-900">
                Student Support
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Need help? Contact us
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 h-[88px] border-b border-slate-200/80 bg-white/95 backdrop-blur-xl lg:left-[274px]">
        <div className="flex h-full items-center justify-between px-5 sm:px-7 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
                Student Workspace
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Learn, build and track your growth.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-bold text-slate-900">
                {studentName}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">Student</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[11px] font-bold text-blue-600">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-[88px] lg:pl-[274px]">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-7 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

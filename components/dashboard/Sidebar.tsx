"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Network,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const workspaceItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Users,
    badge: "12",
  },
  {
    label: "Admissions",
    href: "/dashboard/admissions",
    icon: GraduationCap,
  },
  {
    label: "Admission Applications",
    href: "/dashboard/admission-applications",
    icon: FileText,
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
];

const educationItems: NavigationItem[] = [
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    badge: "4",
  },
];

const businessItems: NavigationItem[] = [
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CircleDollarSign,
  },
  {
    label: "Registration Payments",
    href: "/dashboard/registration-payments",
    icon: ClipboardCheck,
  },
  {
    label: "Growth Network",
    href: "/dashboard/growth-network",
    icon: Network,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavigationItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <section className="mb-7">
      <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="group relative block"
            >
              {active && (
                <motion.div
                  layoutId="dashboard-active-navigation"
                  className="absolute inset-0 rounded-2xl bg-[#2563EB]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <div
                className={[
                  "relative flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-[18px] w-[18px] shrink-0",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-700",
                  ].join(" ")}
                />

                <span className="flex-1">{item.label}</span>

                {item.badge && (
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    {item.badge}
                  </span>
                )}

                {active && (
                  <ChevronRight className="h-4 w-4 text-white/80" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="flex items-center"
        >
          <Image
            src="/logo/Full-logo.png"
            alt="TechSkillHub"
            width={205}
            height={72}
            priority
            className="h-auto w-[190px] object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={closeMobile}
          className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="rounded-[22px] bg-gradient-to-br from-[#2563EB] via-[#315BEA] to-[#4F46E5] p-4 text-white shadow-[0_16px_35px_rgba(37,99,235,0.20)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                TechSkillHub
              </p>
              <p className="text-[11px] text-blue-100">
                Education OS
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
            All systems operational
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-5">
        <NavigationSection
          title="Workspace"
          items={workspaceItems}
          pathname={pathname}
          onNavigate={closeMobile}
        />

        <NavigationSection
          title="Education"
          items={educationItems}
          pathname={pathname}
          onNavigate={closeMobile}
        />

        <NavigationSection
          title="Business"
          items={businessItems}
          pathname={pathname}
          onNavigate={closeMobile}
        />
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">
                TechSkill AI
              </p>
              <p className="text-[10px] text-slate-400">
                Business assistant
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-5 text-slate-500">
            Your education business command center is ready.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] border-r border-slate-200/80 bg-white lg:block">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />

            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[290px] bg-white shadow-2xl lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 left-5 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_12px_30px_rgba(37,99,235,0.30)] lg:hidden"
        aria-label="Open navigation"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>
    </>
  );
}

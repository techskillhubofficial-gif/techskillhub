"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";

interface DashboardShellProps {
  children: ReactNode;
  displayName: string;
  initials: string;
  roleLabel: string;
  isNetworkManager: boolean;
}

export default function DashboardShell({
  children,
  displayName,
  initials,
  roleLabel,
  isNetworkManager,
}: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell min-h-screen bg-[#F7F9FC] text-slate-950 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        isNetworkManager={isNetworkManager}
        mobileOpen={mobileSidebarOpen}
        onMobileOpen={() => setMobileSidebarOpen(true)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[290px]">
        <TopNavbar
          displayName={displayName}
          initials={initials}
          roleLabel={roleLabel}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-76px)] px-4 pb-10 pt-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1700px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

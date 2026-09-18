import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  // TGN members use the dedicated Growth Network portal.
  if (role === "TGN_TEAM_LEADER" || role === "TGN_EXECUTIVE") {
    redirect("/growth-network/portal");
  }

  // The Team Workspace is never available to students.
  if (role === "STUDENT") {
    redirect("/student-portal");
  }

  // Only recognized internal roles can enter the workspace.
  if (role !== "ADMIN" && role !== "MENTOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-950">
      <Sidebar />

      <div className="min-h-screen lg:pl-[290px]">
        <TopNavbar />

        <main className="min-h-[calc(100vh-76px)] px-4 pb-10 pt-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1700px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

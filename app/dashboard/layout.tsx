import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getTgnContext } from "@/lib/tgn/authorization";
import DashboardShell from "@/components/dashboard/DashboardShell";

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
  const tgnContext = await getTgnContext();

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

  const isNetworkManager =
    role === "ADMIN" &&
    tgnContext?.access === "NETWORK_MANAGER";

  const displayName =
    session.user.name?.trim().split(/\s+/)[0] ||
    session.user.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = isNetworkManager
    ? "Network Manager"
    : role === "ADMIN"
      ? "Administrator"
      : role === "MENTOR"
        ? "Mentor"
        : "User";

  return (
    <DashboardShell
      displayName={displayName}
      initials={initials}
      roleLabel={roleLabel}
      isNetworkManager={isNetworkManager}
    >
      {children}
    </DashboardShell>
  );
}

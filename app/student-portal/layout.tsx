import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentPortalShell from "./StudentPortalShell";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const studentName = session.user.name?.trim() || "Student";

  const initials =
    studentName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TS";

  const navigation = [
    {
      section: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/student-portal",
          icon: "dashboard" as const,
        },
      ],
    },
    {
      section: "Learning",
      items: [
        {
          label: "My Learning",
          href: "/student-portal/learning",
          icon: "learning" as const,
        },
        {
          label: "Assignments",
          href: "/student-portal/assignments",
          icon: "assignments" as const,
        },
        {
          label: "Calendar",
          href: "/student-portal/calendar",
          icon: "calendar" as const,
        },
      ],
    },
    {
      section: "Performance",
      items: [
        {
          label: "Attendance",
          href: "/student-portal/attendance",
          icon: "attendance" as const,
        },
        {
          label: "Performance",
          href: "/student-portal/performance",
          icon: "performance" as const,
        },
      ],
    },
    {
      section: "Account",
      items: [
        {
          label: "Documents",
          href: "/student-portal/documents",
          icon: "documents" as const,
        },
        {
          label: "Payments",
          href: "/student-portal/payments",
          icon: "payments" as const,
        },
        {
          label: "Certificates",
          href: "/student-portal/certificates",
          icon: "certificates" as const,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <StudentPortalShell
        studentName={studentName}
        initials={initials}
        navigation={navigation}
      >
        {children}
      </StudentPortalShell>
    </div>
  );
}

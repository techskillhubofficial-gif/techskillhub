import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <aside
        style={{
          width: "260px",
          background: "#111827",
          color: "#fff",
          padding: "24px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>TechSkillHub</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <Link href="/dashboard" style={{ color: "white" }}>
            Dashboard
          </Link>

          <Link href="/dashboard/courses" style={{ color: "white" }}>
            Courses
          </Link>

          <Link href="/dashboard/assignments" style={{ color: "white" }}>
            Assignments
          </Link>

          <Link href="/dashboard/profile" style={{ color: "white" }}>
            Profile
          </Link>

          <Link href="/dashboard/settings" style={{ color: "white" }}>
            Settings
          </Link>
        </nav>

        <div style={{ marginTop: "40px" }}>
          <LogoutButton />
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Footer } from "@/components/home/Footer";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome back, {session.user?.name} 👋</h1>

      <p>{session.user?.email}</p>

      <br />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
        }}
      >
        <div style={{ padding: 20, background: "#fff", borderRadius: 10 }}>
          <h2>12</h2>
          <p>Courses</p>
        </div>

        <div style={{ padding: 20, background: "#fff", borderRadius: 10 }}>
          <h2>5</h2>
          <p>Assignments</p>
        </div>

        <div style={{ padding: 20, background: "#fff", borderRadius: 10 }}>
          <h2>3</h2>
          <p>Certificates</p>
        </div>

        <div style={{ padding: 20, background: "#fff", borderRadius: 10 }}>
          <h2>82%</h2>
          <p>Overall Progress</p>
        </div>
      </div>
    </div>
  );
}
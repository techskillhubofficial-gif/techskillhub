import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import AttendanceManager from "./AttendanceManager";

type PageProps = {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LectureAttendancePage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "MENTOR"
  ) {
    redirect("/student-portal");
  }

  const { id, lessonId } = await params;

  if (!id || !lessonId) {
    redirect("/dashboard/courses");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AttendanceManager
          courseId={id}
          lessonId={lessonId}
        />
      </div>
    </main>
  );
}

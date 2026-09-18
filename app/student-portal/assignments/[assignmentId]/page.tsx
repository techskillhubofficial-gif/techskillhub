import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AssignmentWorkspace from "./AssignmentWorkspace";

type PageProps = {
  params: Promise<{ assignmentId: string }>;
};

export default async function StudentAssignmentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const { assignmentId } = await params;

  return <AssignmentWorkspace assignmentId={assignmentId} />;
}

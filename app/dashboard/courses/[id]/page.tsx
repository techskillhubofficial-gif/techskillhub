import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>{course.title}</h1>

      <p>{course.description}</p>

      <hr />

      <p><strong>Level:</strong> {course.level}</p>
      <p><strong>Duration:</strong> {course.duration}</p>
      <p><strong>Price:</strong> ₹{course.price}</p>
      <p><strong>Status:</strong> {course.published ? "Published" : "Draft"}</p>
    </div>
  );
}
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1>📚 Courses</h1>

        <Link href="/dashboard/courses/new">
          Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        courses.map((course) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h2>
              <Link href={`/dashboard/courses/${course.id}`}>
                {course.title}
              </Link>
            </h2>

            <p>{course.description}</p>

            <p>Level: {course.level}</p>
            <p>Duration: {course.duration}</p>
            <p>Price: ₹{course.price}</p>
          </div>
        ))
      )}
    </div>
  );
}
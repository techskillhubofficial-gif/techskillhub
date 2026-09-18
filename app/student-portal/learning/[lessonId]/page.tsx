import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LectureViewer from "./LectureViewer";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lessonId: string }>;
};

export default async function LecturePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const { lessonId } = await params;

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      status: {
        in: ["ACTIVE", "COMPLETED"],
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          modules: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              title: true,
              order: true,
              lessons: {
                orderBy: {
                  order: "asc",
                },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  order: true,
                  scheduledAt: true,
                  endsAt: true,
                  meetingUrl: true,
                  presentationUrl: true,
                  studyMaterialUrl: true,
                  instructorNotes: true,
                  resources: {
                    orderBy: {
                      order: "asc",
                    },
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      url: true,
                      type: true,
                    },
                  },
                  assignments: {
                    orderBy: {
                      createdAt: "asc",
                    },
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      dueDate: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    redirect("/student-portal/learning");
  }

  const allLessons = enrollment.course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
      scheduledAt: lesson.scheduledAt?.toISOString() ?? null,
      endsAt: lesson.endsAt?.toISOString() ?? null,
      assignments: lesson.assignments.map((assignment) => ({
        ...assignment,
        dueDate: assignment.dueDate?.toISOString() ?? null,
      })),
    })),
  );

  const lessonIndex = allLessons.findIndex(
    (lesson) => lesson.id === lessonId,
  );

  if (lessonIndex === -1) {
    notFound();
  }

  const lesson = allLessons[lessonIndex];

  const progress = await prisma.lectureProgress.findUnique({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
      },
    },
    select: {
      completed: true,
      startedAt: true,
      lastViewedAt: true,
      completedAt: true,
    },
  });

  const previousLesson =
    lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;

  const nextLesson =
    lessonIndex < allLessons.length - 1
      ? allLessons[lessonIndex + 1]
      : null;

  return (
    <LectureViewer
      enrollmentId={enrollment.id}
      course={{
        title: enrollment.course.title,
        slug: enrollment.course.slug,
      }}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        moduleTitle: lesson.moduleTitle,
        scheduledAt: lesson.scheduledAt,
        endsAt: lesson.endsAt,
        meetingUrl: lesson.meetingUrl,
        presentationUrl: lesson.presentationUrl,
        studyMaterialUrl: lesson.studyMaterialUrl,
        instructorNotes: lesson.instructorNotes,
        resources: lesson.resources,
        assignments: lesson.assignments,
        completed: progress?.completed ?? false,
      }}
      previousLesson={
        previousLesson
          ? {
              id: previousLesson.id,
              title: previousLesson.title,
            }
          : null
      }
      nextLesson={
        nextLesson
          ? {
              id: nextLesson.id,
              title: nextLesson.title,
            }
          : null
      }
    />
  );
}

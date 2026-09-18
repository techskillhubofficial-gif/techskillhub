import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LearningWorkspace from "./LearningWorkspace";

export const dynamic = "force-dynamic";

export default async function StudentLearningPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

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
      status: true,
      enrolledAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          duration: true,
          thumbnail: true,
          modules: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              title: true,
              description: true,
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
                      order: true,
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
                      type: true,
                      dueDate: true,
                      createdAt: true,
                    },
                  },
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
                  type: true,
                  dueDate: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return (
      <LearningWorkspace
        initialData={{
          success: true,
          enrolled: false,
          enrollment: null,
          course: null,
          progress: {
            completedLectures: 0,
            totalLectures: 0,
            percentage: 0,
          },
        }}
      />
    );
  }

  const progressRecords = await prisma.lectureProgress.findMany({
    where: {
      enrollmentId: enrollment.id,
    },
    select: {
      id: true,
      lessonId: true,
      completed: true,
      startedAt: true,
      lastViewedAt: true,
      completedAt: true,
    },
  });

  const progressMap = new Map(
    progressRecords.map((record) => [record.lessonId, record]),
  );

  const modules = enrollment.course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    order: module.order,
    assignments: module.assignments.map((assignment) => ({
      ...assignment,
      dueDate: assignment.dueDate?.toISOString() ?? null,
      createdAt: assignment.createdAt.toISOString(),
    })),
    lessons: module.lessons.map((lesson) => {
      const progress = progressMap.get(lesson.id) ?? null;

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        scheduledAt: lesson.scheduledAt?.toISOString() ?? null,
        endsAt: lesson.endsAt?.toISOString() ?? null,
        meetingUrl: lesson.meetingUrl,
        presentationUrl: lesson.presentationUrl,
        studyMaterialUrl: lesson.studyMaterialUrl,
        instructorNotes: lesson.instructorNotes,
        resources: lesson.resources,
        assignments: lesson.assignments.map((assignment) => ({
          ...assignment,
          dueDate: assignment.dueDate?.toISOString() ?? null,
          createdAt: assignment.createdAt.toISOString(),
        })),
        progress: progress
          ? {
              id: progress.id,
              completed: progress.completed,
              startedAt: progress.startedAt?.toISOString() ?? null,
              lastViewedAt: progress.lastViewedAt?.toISOString() ?? null,
              completedAt: progress.completedAt?.toISOString() ?? null,
            }
          : null,
      };
    }),
  }));

  const allLessons = modules.flatMap((module) => module.lessons);
  const completedLectures = allLessons.filter(
    (lesson) => lesson.progress?.completed,
  ).length;
  const totalLectures = allLessons.length;

  const data = {
    success: true,
    enrolled: true,
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt.toISOString(),
    },
    course: {
      ...enrollment.course,
      modules,
    },
    progress: {
      completedLectures,
      totalLectures,
      percentage:
        totalLectures > 0
          ? Math.round((completedLectures / totalLectures) * 100)
          : 0,
    },
  };

  return <LearningWorkspace initialData={data} />;
}

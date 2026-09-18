import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Authentication required." },
    { status: 401 },
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return unauthorized();
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Student access required." },
        { status: 403 },
      );
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
                    progressRecords: {
                      where: {
                        enrollmentId: {
                          equals: "",
                        },
                      },
                      select: {
                        id: true,
                        completed: true,
                        startedAt: true,
                        lastViewedAt: true,
                        completedAt: true,
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
      return NextResponse.json({
        success: true,
        enrolled: false,
        enrollment: null,
        course: null,
        progress: {
          completedLectures: 0,
          totalLectures: 0,
          percentage: 0,
        },
      });
    }

    const lectures = enrollment.course.modules.flatMap(
      (module) => module.lessons,
    );

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
      progressRecords.map((record) => [
        record.lessonId,
        record,
      ]),
    );

    const assignmentSubmissions =
      await prisma.assignmentSubmission.findMany({
        where: {
          userId: session.user.id,
          assignment: {
            courseId: enrollment.course.id,
          },
        },
        select: {
          id: true,
          assignmentId: true,
          status: true,
          score: true,
          maxScore: true,
          feedback: true,
          submittedAt: true,
          reviewedAt: true,
        },
      });

    const submissionMap = new Map(
      assignmentSubmissions.map((submission) => [
        submission.assignmentId,
        submission,
      ]),
    );

    const attachSubmission = <
      T extends { id: string },
    >(
      assignment: T,
    ) => ({
      ...assignment,
      submission: submissionMap.get(assignment.id) ?? null,
    });

    const modules = enrollment.course.modules.map((module) => ({
      ...module,
      assignments: module.assignments.map(attachSubmission),
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        assignments: lesson.assignments.map(attachSubmission),
        progress: progressMap.get(lesson.id) ?? null,
      })),
    }));

    const completedLectures = lectures.filter((lesson) =>
      progressMap.get(lesson.id)?.completed,
    ).length;

    const totalLectures = lectures.length;

    const percentage =
      totalLectures > 0
        ? Math.round(
            (completedLectures / totalLectures) * 100,
          )
        : 0;

    return NextResponse.json({
      success: true,
      enrolled: true,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      },
      course: {
        ...enrollment.course,
        modules,
      },
      progress: {
        completedLectures,
        totalLectures,
        percentage,
      },
    });
  } catch (error) {
    console.error("GET /api/student/learning error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your learning content.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return unauthorized();
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Student access required." },
        { status: 403 },
      );
    }

    const body = await req.json();

    const lessonId =
      typeof body.lessonId === "string"
        ? body.lessonId.trim()
        : "";

    const completed =
      typeof body.completed === "boolean"
        ? body.completed
        : true;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lecture ID is required.",
        },
        { status: 400 },
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
        course: {
          lessons: {
            some: {
              id: lessonId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this lecture.",
        },
        { status: 403 },
      );
    }

    const existing = await prisma.lectureProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
    });

    const now = new Date();

    const progress = await prisma.lectureProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        completed,
        startedAt: now,
        lastViewedAt: now,
        completedAt: completed ? now : null,
      },
      update: {
        completed,
        lastViewedAt: now,
        completedAt: completed
          ? existing?.completedAt ?? now
          : null,
        startedAt: existing?.startedAt ?? now,
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

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("POST /api/student/learning error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update lecture progress.",
      },
      { status: 500 },
    );
  }
}

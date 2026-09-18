import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ASSIGNMENT_TYPES = [
  "THEORY",
  "PRACTICAL",
  "PROJECT",
  "CASE_STUDY",
] as const;

type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

function isAssignmentType(value: unknown): value is AssignmentType {
  return (
    typeof value === "string" &&
    (ASSIGNMENT_TYPES as readonly string[]).includes(value)
  );
}

async function canManage(session: any, courseId: string) {
  if (!session?.user?.id || !session.user.role) {
    return false;
  }

  if (session.user.role === "ADMIN") {
    return true;
  }

  if (session.user.role !== "MENTOR") {
    return false;
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      instructorId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  return Boolean(course);
}

async function getCourseId(context: RouteContext) {
  const params = await context.params;

  return typeof params?.id === "string"
    ? params.id.trim()
    : "";
}

export async function GET(
  _req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const courseId = await getCourseId(context);

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required.",
        },
        { status: 400 }
      );
    }

    if (session.user.role === "STUDENT") {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          courseId,
          status: {
            in: ["ACTIVE", "COMPLETED"],
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
            message: "You are not enrolled in this course.",
          },
          { status: 403 }
        );
      }
    } else if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this course.",
        },
        { status: 403 }
      );
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("GET COURSE ASSIGNMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch course assignments.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    const courseId = await getCourseId(context);

    if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin or mentor access required.",
        },
        { status: 403 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found.",
        },
        { status: 404 }
      );
    }

    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : "";

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment title and description are required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200 || description.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment content exceeds the allowed length.",
        },
        { status: 400 }
      );
    }

    const typeValue =
      typeof body?.type === "string"
        ? body.type.trim().toUpperCase()
        : "PRACTICAL";

    if (!isAssignmentType(typeValue)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid assignment type. Allowed types: THEORY, PRACTICAL, PROJECT, CASE_STUDY.",
        },
        { status: 400 }
      );
    }

    const moduleId =
      typeof body?.moduleId === "string" && body.moduleId.trim()
        ? body.moduleId.trim()
        : null;

    const lessonId =
      typeof body?.lessonId === "string" && body.lessonId.trim()
        ? body.lessonId.trim()
        : null;

    if (moduleId) {
      const module = await prisma.courseModule.findFirst({
        where: {
          id: moduleId,
          courseId,
        },
        select: {
          id: true,
        },
      });

      if (!module) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected module does not belong to this course.",
          },
          { status: 400 }
        );
      }
    }

    if (lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          courseId,
        },
        select: {
          id: true,
          moduleId: true,
        },
      });

      if (!lesson) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected lecture does not belong to this course.",
          },
          { status: 400 }
        );
      }

      if (moduleId && lesson.moduleId !== moduleId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected lecture is not inside the selected module.",
          },
          { status: 400 }
        );
      }
    }

    const dueDate =
      body?.dueDate === null || body?.dueDate === ""
        ? null
        : body?.dueDate
          ? new Date(body.dueDate)
          : null;

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment due date.",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type: typeValue,
        dueDate,
        courseId,
        moduleId,
        lessonId,
      },
      include: {
        module: true,
        lesson: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment created successfully.",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE COURSE ASSIGNMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create the assignment.",
      },
      { status: 500 }
    );
  }
}

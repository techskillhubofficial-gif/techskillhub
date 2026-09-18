import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    assignmentId: string;
  }>;
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

async function getIds(context: RouteContext) {
  const params = await context.params;

  return {
    courseId:
      typeof params?.id === "string"
        ? params.id.trim()
        : "",
    assignmentId:
      typeof params?.assignmentId === "string"
        ? params.assignmentId.trim()
        : "",
  };
}

async function getAssignment(
  courseId: string,
  assignmentId: string
) {
  return prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      courseId,
    },
  });
}

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId, assignmentId } = await getIds(context);

    if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin or mentor access required.",
        },
        { status: 403 }
      );
    }

    if (!assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required.",
        },
        { status: 400 }
      );
    }

    const existing = await getAssignment(courseId, assignmentId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found.",
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
        : existing.title;

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : existing.description;

    const moduleId =
      body?.moduleId === null || body?.moduleId === ""
        ? null
        : body?.moduleId !== undefined
          ? String(body.moduleId).trim()
          : existing.moduleId;

    const lessonId =
      body?.lessonId === null || body?.lessonId === ""
        ? null
        : body?.lessonId !== undefined
          ? String(body.lessonId).trim()
          : existing.lessonId;

    const typeValue =
      body?.type === undefined || body?.type === null || body?.type === ""
        ? existing.type
        : String(body.type).trim().toUpperCase();

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

    if (
      !title ||
      !description ||
      title.length > 200 ||
      description.length > 10000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment content.",
        },
        { status: 400 }
      );
    }

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
        : body?.dueDate !== undefined
          ? new Date(body.dueDate)
          : existing.dueDate;

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment due date.",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        title,
        description,
        type: typeValue,
        dueDate,
        moduleId,
        lessonId,
      },
      include: {
        module: true,
        lesson: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully.",
      assignment,
    });
  } catch (error) {
    console.error("PATCH COURSE ASSIGNMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update the assignment.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId, assignmentId } = await getIds(context);

    if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin or mentor access required.",
        },
        { status: 403 }
      );
    }

    if (!assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required.",
        },
        { status: 400 }
      );
    }

    const existing = await getAssignment(courseId, assignmentId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found.",
        },
        { status: 404 }
      );
    }

    await prisma.assignment.delete({
      where: {
        id: assignmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE COURSE ASSIGNMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete the assignment.",
      },
      { status: 500 }
    );
  }
}

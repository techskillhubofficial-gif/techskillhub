import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManage(session: any) {
  return (
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "MENTOR"
  );
}

function isStudent(session: any) {
  return session?.user?.role === "STUDENT";
}

function validHttpUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
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

    if (!session?.user?.id || !session.user.role) {
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

    if (isStudent(session)) {
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
    } else if (!canManage(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this course.",
        },
        { status: 403 }
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        courseId,
      },
      orderBy: [
        {
          moduleId: "asc",
        },
        {
          order: "asc",
        },
        {
          createdAt: "asc",
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
        resources: {
          orderBy: {
            order: "asc",
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            dueDate: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error("GET COURSE LESSONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch course lectures.",
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

    if (!canManage(session)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin or mentor access required.",
        },
        { status: 403 }
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

    const moduleId =
      typeof body?.moduleId === "string"
        ? body.moduleId.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Lecture title is required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lecture title cannot exceed 200 characters.",
        },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lecture description cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    if (!moduleId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A module must be selected for every new lecture.",
        },
        { status: 400 }
      );
    }

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
          message:
            "Selected module does not belong to this course.",
        },
        { status: 400 }
      );
    }

    const requestedOrder = Number(body?.order);

    let order =
      Number.isInteger(requestedOrder) &&
      requestedOrder > 0
        ? requestedOrder
        : 1;

    if (
      !Number.isInteger(requestedOrder) ||
      requestedOrder < 1
    ) {
      const latest = await prisma.lesson.findFirst({
        where: {
          courseId,
          moduleId,
        },
        orderBy: {
          order: "desc",
        },
        select: {
          order: true,
        },
      });

      order = (latest?.order ?? 0) + 1;
    }

    const scheduledAt = body?.scheduledAt
      ? new Date(body.scheduledAt)
      : null;

    const endsAt = body?.endsAt
      ? new Date(body.endsAt)
      : null;

    if (
      scheduledAt &&
      Number.isNaN(scheduledAt.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lecture start date/time.",
        },
        { status: 400 }
      );
    }

    if (
      endsAt &&
      Number.isNaN(endsAt.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lecture end date/time.",
        },
        { status: 400 }
      );
    }

    if (
      scheduledAt &&
      endsAt &&
      endsAt <= scheduledAt
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lecture end time must be after the start time.",
        },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || null,
        order,
        courseId,
        moduleId,
        scheduledAt,
        endsAt,
        meetingUrl: validHttpUrl(body?.meetingUrl),
        presentationUrl: validHttpUrl(
          body?.presentationUrl
        ),
        studyMaterialUrl: validHttpUrl(
          body?.studyMaterialUrl
        ),
        instructorNotes:
          typeof body?.instructorNotes === "string"
            ? body.instructorNotes
                .trim()
                .slice(0, 10000) || null
            : null,
      },
      include: {
        module: true,
        resources: true,
        assignments: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lecture created successfully.",
        lesson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE COURSE LESSON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create the lecture.",
      },
      { status: 500 }
    );
  }
}

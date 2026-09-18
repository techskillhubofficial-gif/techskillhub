import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    batchId: string;
  }>;
};

async function getParams(context: RouteContext) {
  const params = await context.params;

  return {
    courseId:
      typeof params?.id === "string"
        ? params.id.trim()
        : "",
    batchId:
      typeof params?.batchId === "string"
        ? params.batchId.trim()
        : "",
  };
}

async function requireManager(courseId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      ),
    };
  }

  if (session.user.role === "ADMIN") {
    return {
      session,
      error: null,
    };
  }

  if (session.user.role !== "MENTOR") {
    return {
      session: null,
      error: NextResponse.json(
        {
          success: false,
          message:
            "Admin or assigned mentor access required.",
        },
        { status: 403 },
      ),
    };
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

  if (!course) {
    return {
      session: null,
      error: NextResponse.json(
        {
          success: false,
          message:
            "You do not have access to this course.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    session,
    error: null,
  };
}

export async function GET(
  _req: Request,
  context: RouteContext,
) {
  try {
    const { courseId, batchId } =
      await getParams(context);

    if (!courseId || !batchId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course and batch are required.",
        },
        { status: 400 },
      );
    }

    const access =
      await requireManager(courseId);

    if (access.error) {
      return access.error;
    }

    const batch =
      await prisma.courseBatch.findFirst({
        where: {
          id: batchId,
          courseId,
        },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      });

    if (!batch) {
      return NextResponse.json(
        {
          success: false,
          message: "Batch not found.",
        },
        { status: 404 },
      );
    }

    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          courseId,
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
        },
        orderBy: {
          user: {
            name: "asc",
          },
        },
        select: {
          id: true,
          userId: true,
          batchId: true,
          status: true,
          enrolledAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      batch,
      enrollments,
    });
  } catch (error) {
    console.error(
      "GET BATCH ENROLLMENTS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load batch enrollments.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: RouteContext,
) {
  try {
    const { courseId, batchId } =
      await getParams(context);

    if (!courseId || !batchId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course and batch are required.",
        },
        { status: 400 },
      );
    }

    const access =
      await requireManager(courseId);

    if (access.error) {
      return access.error;
    }

    const batch =
      await prisma.courseBatch.findFirst({
        where: {
          id: batchId,
          courseId,
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
      });

    if (!batch) {
      return NextResponse.json(
        {
          success: false,
          message: "Batch not found.",
        },
        { status: 404 },
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.enrollmentIds)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "enrollmentIds must be an array.",
        },
        { status: 400 },
      );
    }

    const enrollmentIds = [
      ...new Set(
        body.enrollmentIds
          .filter(
            (value): value is string =>
              typeof value === "string",
          )
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];

    if (enrollmentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one enrollment must be selected.",
        },
        { status: 400 },
      );
    }

    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          id: {
            in: enrollmentIds,
          },
          courseId,
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
        },
        select: {
          id: true,
        },
      });

    if (
      enrollments.length !==
      enrollmentIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more enrollment IDs are invalid for this course.",
        },
        { status: 400 },
      );
    }

    await prisma.enrollment.updateMany({
      where: {
        id: {
          in: enrollmentIds,
        },
        courseId,
      },
      data: {
        batchId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        `${enrollmentIds.length} ${
          enrollmentIds.length === 1
            ? "student"
            : "students"
        } assigned to ${batch.name}.`,
      batch,
      enrollmentIds,
    });
  } catch (error) {
    console.error(
      "PUT BATCH ENROLLMENTS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to assign students to batch.",
      },
      { status: 500 },
    );
  }
}

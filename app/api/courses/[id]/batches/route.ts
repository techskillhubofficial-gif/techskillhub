import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getCourseId(context: RouteContext) {
  const params = await context.params;
  return typeof params?.id === "string"
    ? params.id.trim()
    : "";
}

async function requireManager(
  courseId: string,
) {
  const session =
    await getServerSession(authOptions);

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

  const course =
    await prisma.course.findFirst({
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
    const courseId =
      await getCourseId(context);

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required.",
        },
        { status: 400 },
      );
    }

    const access =
      await requireManager(courseId);

    if (access.error) {
      return access.error;
    }

    const batches =
      await prisma.courseBatch.findMany({
        where: {
          courseId,
        },
        orderBy: [
          {
            startDate: "desc",
          },
          {
            name: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          instructorId: true,
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error(
      "GET COURSE BATCHES ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load course batches.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  context: RouteContext,
) {
  try {
    const courseId =
      await getCourseId(context);

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required.",
        },
        { status: 400 },
      );
    }

    const access =
      await requireManager(courseId);

    if (access.error) {
      return access.error;
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    if (!name || !code) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Batch name and batch code are required.",
        },
        { status: 400 },
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Batch name cannot exceed 150 characters.",
        },
        { status: 400 },
      );
    }

    if (code.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Batch code cannot exceed 50 characters.",
        },
        { status: 400 },
      );
    }

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const startDate =
      typeof body.startDate === "string" &&
      body.startDate.trim()
        ? new Date(body.startDate)
        : null;

    const endDate =
      typeof body.endDate === "string" &&
      body.endDate.trim()
        ? new Date(body.endDate)
        : null;

    if (
      startDate &&
      Number.isNaN(startDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start date.",
        },
        { status: 400 },
      );
    }

    if (
      endDate &&
      Number.isNaN(endDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid end date.",
        },
        { status: 400 },
      );
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End date cannot be earlier than start date.",
        },
        { status: 400 },
      );
    }

    const existing =
      await prisma.courseBatch.findFirst({
        where: {
          courseId,
          code,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A batch with this code already exists for this course.",
        },
        { status: 409 },
      );
    }

    const instructorId =
      typeof body.instructorId === "string" &&
      body.instructorId.trim()
        ? body.instructorId.trim()
        : null;

    if (instructorId) {
      const instructor =
        await prisma.user.findFirst({
          where: {
            id: instructorId,
            role: "MENTOR",
          },
          select: {
            id: true,
          },
        });

      if (!instructor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected instructor is not a valid mentor.",
          },
          { status: 400 },
        );
      }
    }

    const batch =
      await prisma.courseBatch.create({
        data: {
          courseId,
          name,
          code,
          description,
          startDate,
          endDate,
          instructorId,
        },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          instructorId: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Batch created successfully.",
        batch,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST COURSE BATCH ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create course batch.",
      },
      { status: 500 },
    );
  }
}

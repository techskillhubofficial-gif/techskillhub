import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isAdminOrMentor(session: any) {
  return (
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "MENTOR"
  );
}

function isStudent(session: any) {
  return session?.user?.role === "STUDENT";
}

async function getCourseId(context: RouteContext) {
  const params = await context.params;
  return typeof params?.id === "string" ? params.id.trim() : "";
}

/**
 * GET /api/courses/[id]/modules
 *
 * ADMIN / MENTOR:
 * - Can view modules for any course.
 *
 * STUDENT:
 * - Can view modules only when actively/completely enrolled.
 */
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

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
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
          status: true,
          progress: true,
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
    } else if (!isAdminOrMentor(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this course.",
        },
        { status: 403 }
      );
    }

    const modules = await prisma.courseModule.findMany({
      where: {
        courseId,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        _count: {
          select: {
            lessons: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      course,
      modules,
    });
  } catch (error) {
    console.error("GET COURSE MODULES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch course modules.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/modules
 *
 * ADMIN / MENTOR only.
 */
export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrMentor(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin or mentor access required.",
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
        title: true,
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

    let body: unknown;

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
      typeof (body as any)?.title === "string"
        ? (body as any).title.trim()
        : "";

    const description =
      typeof (body as any)?.description === "string"
        ? (body as any).description.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Module title is required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Module title cannot exceed 200 characters.",
        },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Module description cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    const requestedOrder = Number((body as any)?.order);

    let order: number;

    if (
      Number.isInteger(requestedOrder) &&
      requestedOrder > 0
    ) {
      order = requestedOrder;
    } else {
      const latestModule = await prisma.courseModule.findFirst({
        where: {
          courseId,
        },
        orderBy: {
          order: "desc",
        },
        select: {
          order: true,
        },
      });

      order = (latestModule?.order ?? 0) + 1;
    }

    const conflictingModule = await prisma.courseModule.findFirst({
      where: {
        courseId,
        order,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (conflictingModule) {
      return NextResponse.json(
        {
          success: false,
          message: `Module order ${order} is already in use for this course.`,
        },
        { status: 409 }
      );
    }

    const module = await prisma.courseModule.create({
      data: {
        title,
        description: description || null,
        order,
        courseId,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course module created successfully.",
        module,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE COURSE MODULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create course module.",
      },
      { status: 500 }
    );
  }
}

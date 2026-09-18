import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; moduleId: string }>;
};

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

function isStudent(session: any) {
  return session?.user?.role === "STUDENT";
}

async function getIds(context: RouteContext) {
  const params = await context.params;

  return {
    courseId:
      typeof params?.id === "string" ? params.id.trim() : "",
    moduleId:
      typeof params?.moduleId === "string"
        ? params.moduleId.trim()
        : "",
  };
}

async function getModule(courseId: string, moduleId: string) {
  return prisma.courseModule.findFirst({
    where: {
      id: moduleId,
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

    const { courseId, moduleId } = await getIds(context);

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID and module ID are required.",
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
    } else if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this course.",
        },
        { status: 403 }
      );
    }

    const module = await getModule(courseId, moduleId);

    if (!module) {
      return NextResponse.json(
        {
          success: false,
          message: "Course module not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      module,
    });
  } catch (error) {
    console.error("GET COURSE MODULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch the course module.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    const { courseId, moduleId } = await getIds(context);

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID and module ID are required.",
        },
        { status: 400 }
      );
    }

    if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin or assigned mentor access required.",
        },
        { status: 403 }
      );
    }

    const existing = await getModule(courseId, moduleId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Course module not found.",
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
        : existing.description ?? "";

    if (!title || title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Module title is required and must be 200 characters or fewer.",
        },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Module description cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    let order = existing.order;

    if (body?.order !== undefined) {
      const requestedOrder = Number(body.order);

      if (
        !Number.isInteger(requestedOrder) ||
        requestedOrder < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Module order must be a positive integer.",
          },
          { status: 400 }
        );
      }

      const conflict =
        await prisma.courseModule.findFirst({
          where: {
            courseId,
            order: requestedOrder,
            NOT: {
              id: moduleId,
            },
          },
          select: {
            id: true,
          },
        });

      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            message: `Module order ${requestedOrder} is already in use for this course.`,
          },
          { status: 409 }
        );
      }

      order = requestedOrder;
    }

    const module = await prisma.courseModule.update({
      where: {
        id: moduleId,
      },
      data: {
        title,
        description: description || null,
        order,
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
      message: "Course module updated successfully.",
      module,
    });
  } catch (error) {
    console.error("PATCH COURSE MODULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update the course module.",
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

    const { courseId, moduleId } = await getIds(context);

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID and module ID are required.",
        },
        { status: 400 }
      );
    }

    if (!(await canManage(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin or assigned mentor access required.",
        },
        { status: 403 }
      );
    }

    const existing = await getModule(courseId, moduleId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Course module not found.",
        },
        { status: 404 }
      );
    }

    if (
      existing._count.lessons > 0 ||
      existing._count.assignments > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This module contains learning content. Move or delete its lectures and assignments before deleting the module.",
        },
        { status: 409 }
      );
    }

    await prisma.courseModule.delete({
      where: {
        id: moduleId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course module deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE COURSE MODULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete the course module.",
      },
      { status: 500 }
    );
  }
}

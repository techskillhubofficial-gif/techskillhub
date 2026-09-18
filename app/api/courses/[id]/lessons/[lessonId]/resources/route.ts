import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
};

function canManage(session: any) {
  return (
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "MENTOR"
  );
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

async function getIds(context: RouteContext) {
  const params = await context.params;

  return {
    courseId:
      typeof params?.id === "string"
        ? params.id.trim()
        : "",
    lessonId:
      typeof params?.lessonId === "string"
        ? params.lessonId.trim()
        : "",
  };
}

async function verifyLesson(
  courseId: string,
  lessonId: string
) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId,
    },
    select: {
      id: true,
    },
  });
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

    const { courseId, lessonId } =
      await getIds(context);

    const lesson = await verifyLesson(
      courseId,
      lessonId
    );

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lecture not found.",
        },
        { status: 404 }
      );
    }

    if (session.user.role === "STUDENT") {
      const enrollment =
        await prisma.enrollment.findFirst({
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
            message:
              "You are not enrolled in this course.",
          },
          { status: 403 }
        );
      }
    } else if (!canManage(session)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have access to this lecture.",
        },
        { status: 403 }
      );
    }

    const resources =
      await prisma.learningResource.findMany({
        where: {
          lessonId,
        },
        orderBy: {
          order: "asc",
        },
      });

    return NextResponse.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error(
      "GET LEARNING RESOURCES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch learning resources.",
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

    const { courseId, lessonId } =
      await getIds(context);

    const lesson = await verifyLesson(
      courseId,
      lessonId
    );

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lecture not found.",
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

    const url = validHttpUrl(body?.url);

    const type =
      typeof body?.type === "string"
        ? body.type.trim().toUpperCase()
        : "LINK";

    if (!title || title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resource title is required and must be 200 characters or fewer.",
        },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid HTTP/HTTPS resource URL is required.",
        },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resource description cannot exceed 2000 characters.",
        },
        { status: 400 }
      );
    }

    const requestedOrder = Number(
      body?.order
    );

    let order =
      Number.isInteger(requestedOrder) &&
      requestedOrder > 0
        ? requestedOrder
        : 1;

    if (
      !Number.isInteger(requestedOrder) ||
      requestedOrder < 1
    ) {
      const latest =
        await prisma.learningResource.findFirst({
          where: {
            lessonId,
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

    const resource =
      await prisma.learningResource.create({
        data: {
          title,
          description: description || null,
          url,
          type:
            type.slice(0, 50) || "LINK",
          order,
          lessonId,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Learning resource added successfully.",
        resource,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE LEARNING RESOURCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to add the learning resource.",
      },
      { status: 500 }
    );
  }
}

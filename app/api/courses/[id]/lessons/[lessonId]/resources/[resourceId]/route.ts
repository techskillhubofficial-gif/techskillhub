import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    lessonId: string;
    resourceId: string;
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
    resourceId:
      typeof params?.resourceId === "string"
        ? params.resourceId.trim()
        : "",
  };
}

async function getResource(
  courseId: string,
  lessonId: string,
  resourceId: string
) {
  return prisma.learningResource.findFirst({
    where: {
      id: resourceId,
      lessonId,
      lesson: {
        courseId,
      },
    },
  });
}

export async function PATCH(
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

    const { courseId, lessonId, resourceId } =
      await getIds(context);

    const existing = await getResource(
      courseId,
      lessonId,
      resourceId
    );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Learning resource not found.",
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

    const url =
      body?.url === undefined
        ? existing.url
        : validHttpUrl(body.url);

    const order =
      body?.order === undefined
        ? existing.order
        : Number(body.order);

    if (
      !title ||
      title.length > 200 ||
      !url ||
      !Number.isInteger(order) ||
      order < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid resource details.",
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

    const resource =
      await prisma.learningResource.update({
        where: {
          id: resourceId,
        },
        data: {
          title,
          description: description || null,
          url,
          order,
          type:
            typeof body?.type === "string"
              ? body.type
                  .trim()
                  .toUpperCase()
                  .slice(0, 50) ||
                existing.type
              : existing.type,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Learning resource updated successfully.",
      resource,
    });
  } catch (error) {
    console.error(
      "PATCH LEARNING RESOURCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update the learning resource.",
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

    const { courseId, lessonId, resourceId } =
      await getIds(context);

    const existing = await getResource(
      courseId,
      lessonId,
      resourceId
    );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Learning resource not found.",
        },
        { status: 404 }
      );
    }

    await prisma.learningResource.delete({
      where: {
        id: resourceId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Learning resource deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE LEARNING RESOURCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete the learning resource.",
      },
      { status: 500 }
    );
  }
}

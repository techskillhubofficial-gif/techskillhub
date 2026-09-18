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

async function getLesson(
  courseId: string,
  lessonId: string
) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId,
    },
    include: {
      module: true,
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
}

export async function GET(
  req: Request,
  context: RouteContext
) {
  void req;

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

    if (!courseId || !lessonId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course ID and lecture ID are required.",
        },
        { status: 400 }
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

    const lesson = await getLesson(
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

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error(
      "GET COURSE LESSON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch the lecture.",
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

    const existing = await getLesson(
      courseId,
      lessonId
    );

    if (!existing) {
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
        : existing.title;

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : existing.description ?? "";

    const moduleId =
      body?.moduleId === null
        ? null
        : typeof body?.moduleId === "string"
        ? body.moduleId.trim()
        : existing.moduleId;

    if (!title || title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lecture title is required and must be 200 characters or fewer.",
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

    if (moduleId) {
      const module =
        await prisma.courseModule.findFirst({
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
    }

    const order =
      body?.order === undefined
        ? existing.order
        : Number(body.order);

    if (!Number.isInteger(order) || order < 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lecture order must be a positive integer.",
        },
        { status: 400 }
      );
    }

    const scheduledAt =
      body?.scheduledAt === null ||
      body?.scheduledAt === ""
        ? null
        : body?.scheduledAt !== undefined
        ? new Date(body.scheduledAt)
        : existing.scheduledAt;

    const endsAt =
      body?.endsAt === null ||
      body?.endsAt === ""
        ? null
        : body?.endsAt !== undefined
        ? new Date(body.endsAt)
        : existing.endsAt;

    if (
      scheduledAt &&
      Number.isNaN(new Date(scheduledAt).getTime())
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
      Number.isNaN(new Date(endsAt).getTime())
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
      new Date(endsAt) <= new Date(scheduledAt)
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

    const lesson = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title,
        description: description || null,
        moduleId,
        order,
        scheduledAt,
        endsAt,
        meetingUrl:
          body?.meetingUrl === "" ||
          body?.meetingUrl === null
            ? null
            : body?.meetingUrl !== undefined
            ? validHttpUrl(body.meetingUrl)
            : existing.meetingUrl,
        presentationUrl:
          body?.presentationUrl === "" ||
          body?.presentationUrl === null
            ? null
            : body?.presentationUrl !== undefined
            ? validHttpUrl(
                body.presentationUrl
              )
            : existing.presentationUrl,
        studyMaterialUrl:
          body?.studyMaterialUrl === "" ||
          body?.studyMaterialUrl === null
            ? null
            : body?.studyMaterialUrl !== undefined
            ? validHttpUrl(
                body.studyMaterialUrl
              )
            : existing.studyMaterialUrl,
        instructorNotes:
          body?.instructorNotes === "" ||
          body?.instructorNotes === null
            ? null
            : body?.instructorNotes !== undefined
            ? String(body.instructorNotes)
                .trim()
                .slice(0, 10000)
            : existing.instructorNotes,
      },
      include: {
        module: true,
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
      message: "Lecture updated successfully.",
      lesson,
    });
  } catch (error) {
    console.error(
      "PATCH COURSE LESSON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update the lecture.",
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

    const { courseId, lessonId } =
      await getIds(context);

    const existing = await getLesson(
      courseId,
      lessonId
    );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Lecture not found.",
        },
        { status: 404 }
      );
    }

    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lecture deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE COURSE LESSON ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete the lecture.",
      },
      { status: 500 }
    );
  }
}

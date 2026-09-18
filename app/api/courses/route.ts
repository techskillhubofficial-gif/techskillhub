import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { CourseLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

/**
 * The current database still contains Course.level for backward
 * compatibility with existing records.
 *
 * The application no longer exposes or asks users to choose a level.
 * New courses use a neutral legacy value internally until the database
 * field can be safely removed in a later schema cleanup.
 */
function getLegacyCourseLevel(): CourseLevel {
  return CourseLevel.BEGINNER;
}

/**
 * GET /api/courses
 *
 * Public:
 * - Returns published courses.
 *
 * Admin:
 * - Returns all courses.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const courses = await prisma.course.findMany({
      where: isAdmin(session)
        ? undefined
        : {
            published: true,
          },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            assignments: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("GET COURSES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch courses.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 *
 * Admin only.
 *
 * The application contract intentionally contains no course level.
 * The currently authenticated admin is automatically assigned as the
 * course instructor.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const title =
      typeof body?.title === "string" ? body.title.trim() : "";

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : "";

    const duration =
      typeof body?.duration === "string" ? body.duration.trim() : "";

    const rawPrice = body?.price;

    if (!title || !description || !duration || rawPrice === undefined) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course title, description, duration and fee are required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Course title cannot exceed 200 characters.",
        },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Course description cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    if (duration.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Course duration cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    const parsedPrice = Number(rawPrice);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid course fee.",
        },
        { status: 400 }
      );
    }

    const cleanPrice = Math.round(parsedPrice);

    const slug = generateSlug(title);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid course title.",
        },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        {
          success: false,
          message: "A course with this title already exists.",
        },
        { status: 409 }
      );
    }

    const adminId = session?.user?.id;

    if (!adminId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to identify the authenticated administrator.",
        },
        { status: 401 }
      );
    }

    const instructor = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
      },
    });

    if (!instructor || instructor.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "The authenticated administrator could not be verified.",
        },
        { status: 403 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        duration,
        price: cleanPrice,
        published: false,

        // Compatibility value for the existing required database field.
        // This field is intentionally not exposed in the UI or API.
        level: getLegacyCourseLevel(),

        instructor: {
          connect: {
            id: instructor.id,
          },
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            assignments: true,
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully.",
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST COURSE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the course.",
      },
      { status: 500 }
    );
  }
}

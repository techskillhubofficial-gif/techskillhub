import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      level,
      duration,
      price,
      instructorId,
    } = body;

    if (
      !title ||
      !description ||
      !level ||
      !duration ||
      !instructorId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const existingCourse = await prisma.course.findUnique({
      where: { slug },
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

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        level,
        duration,
        price: Number(price) || 0,
        published: false,

        instructor: {
          connect: {
            id: instructorId,
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
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
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
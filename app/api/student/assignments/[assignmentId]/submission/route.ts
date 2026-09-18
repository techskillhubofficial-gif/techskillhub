import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    assignmentId: string;
  }>;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validHttpUrl(value: unknown) {
  const input = cleanString(value);

  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

async function getAssignmentId(context: RouteContext) {
  const params = await context.params;

  return typeof params?.assignmentId === "string"
    ? params.assignmentId.trim()
    : "";
}

async function getStudentAssignment(
  userId: string,
  assignmentId: string
) {
  return prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: {
        enrollments: {
          some: {
            userId,
            status: {
              in: ["ACTIVE", "COMPLETED"],
            },
          },
        },
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      module: {
        select: {
          id: true,
          title: true,
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
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

    if (
      !session?.user?.id ||
      session.user.role !== "STUDENT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Student authentication required.",
        },
        { status: 403 }
      );
    }

    const assignmentId = await getAssignmentId(context);

    if (!assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required.",
        },
        { status: 400 }
      );
    }

    const assignment = await getStudentAssignment(
      session.user.id,
      assignmentId
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Assignment not found or you are not enrolled in this course.",
        },
        { status: 404 }
      );
    }

    const submission =
      await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId,
            userId: session.user.id,
          },
        },
      });

    return NextResponse.json({
      success: true,
      assignment,
      submission,
    });
  } catch (error) {
    console.error(
      "GET STUDENT ASSIGNMENT SUBMISSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch the assignment submission.",
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

    if (
      !session?.user?.id ||
      session.user.role !== "STUDENT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Student authentication required.",
        },
        { status: 403 }
      );
    }

    const assignmentId = await getAssignmentId(context);

    if (!assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required.",
        },
        { status: 400 }
      );
    }

    const assignment = await getStudentAssignment(
      session.user.id,
      assignmentId
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Assignment not found or you are not enrolled in this course.",
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

    const content = cleanString(body?.content);
    const submissionUrl = validHttpUrl(
      body?.submissionUrl
    );
    const fileUrl = validHttpUrl(body?.fileUrl);

    if (content.length > 20000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Submission content cannot exceed 20,000 characters.",
        },
        { status: 400 }
      );
    }

    if (
      !content &&
      !submissionUrl &&
      !fileUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Provide submission content, a valid submission URL, or a file URL.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId,
            userId: session.user.id,
          },
        },
      });

    if (
      existing?.status === "GRADED" &&
      body?.action !== "RESUBMIT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This submission has already been graded. It cannot be overwritten.",
        },
        { status: 409 }
      );
    }

    if (
      existing?.status === "UNDER_REVIEW" &&
      body?.action !== "RESUBMIT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This submission is currently under review.",
        },
        { status: 409 }
      );
    }

    const action =
      cleanString(body?.action).toUpperCase() ||
      "SUBMIT";

    if (!["DRAFT", "SUBMIT", "RESUBMIT"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid submission action.",
        },
        { status: 400 }
      );
    }

    const status =
      action === "DRAFT"
        ? "DRAFT"
        : "SUBMITTED";

    const submission =
      await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_userId: {
            assignmentId,
            userId: session.user.id,
          },
        },
        create: {
          assignmentId,
          userId: session.user.id,
          status,
          content: content || null,
          submissionUrl,
          fileUrl,
          submittedAt:
            status === "SUBMITTED"
              ? new Date()
              : null,
        },
        update: {
          status,
          content: content || null,
          submissionUrl,
          fileUrl,
          submittedAt:
            status === "SUBMITTED"
              ? new Date()
              : null,
          score:
            action === "RESUBMIT"
              ? null
              : undefined,
          maxScore:
            action === "RESUBMIT"
              ? null
              : undefined,
          feedback:
            action === "RESUBMIT"
              ? null
              : undefined,
          reviewedAt:
            action === "RESUBMIT"
              ? null
              : undefined,
          reviewedById:
            action === "RESUBMIT"
              ? null
              : undefined,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        status === "DRAFT"
          ? "Assignment draft saved successfully."
          : "Assignment submitted successfully.",
      submission,
    });
  } catch (error) {
    console.error(
      "POST STUDENT ASSIGNMENT SUBMISSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save the assignment submission.",
      },
      { status: 500 }
    );
  }
}

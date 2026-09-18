import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    assignmentId: string;
  }>;
};

const REVIEW_STATUSES = [
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "GRADED",
] as const;

type ReviewStatus = (typeof REVIEW_STATUSES)[number];

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return (
    typeof value === "string" &&
    (REVIEW_STATUSES as readonly string[]).includes(value)
  );
}

async function getIds(context: RouteContext) {
  const params = await context.params;

  return {
    courseId:
      typeof params?.id === "string"
        ? params.id.trim()
        : "",
    assignmentId:
      typeof params?.assignmentId === "string"
        ? params.assignmentId.trim()
        : "",
  };
}

async function canManageCourse(
  session: any,
  courseId: string
) {
  if (!session?.user?.id) {
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

async function getAssignment(
  courseId: string,
  assignmentId: string
) {
  return prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      courseId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      dueDate: true,
      courseId: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId, assignmentId } =
      await getIds(context);

    if (!(await canManageCourse(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin or assigned mentor access required.",
        },
        { status: 403 }
      );
    }

    if (!courseId || !assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course ID and assignment ID are required.",
        },
        { status: 400 }
      );
    }

    const assignment = await getAssignment(
      courseId,
      assignmentId
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found.",
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter =
      cleanString(searchParams.get("status")).toUpperCase();

    const where: any = {
      assignmentId,
    };

    if (statusFilter) {
      if (!isReviewStatus(statusFilter) && statusFilter !== "SUBMITTED" && statusFilter !== "DRAFT") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid submission status filter.",
          },
          { status: 400 }
        );
      }

      where.status = statusFilter;
    }

    const submissions =
      await prisma.assignmentSubmission.findMany({
        where,
        orderBy: [
          {
            submittedAt: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      assignment,
      submissions,
    });
  } catch (error) {
    console.error(
      "GET ASSIGNMENT SUBMISSIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch assignment submissions.",
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
    const { courseId, assignmentId } =
      await getIds(context);

    if (!(await canManageCourse(session, courseId))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin or assigned mentor access required.",
        },
        { status: 403 }
      );
    }

    if (!courseId || !assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course ID and assignment ID are required.",
        },
        { status: 400 }
      );
    }

    const assignment = await getAssignment(
      courseId,
      assignmentId
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found.",
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

    const submissionId =
      typeof body?.submissionId === "string"
        ? body.submissionId.trim()
        : "";

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission ID is required.",
        },
        { status: 400 }
      );
    }

    const submission =
      await prisma.assignmentSubmission.findFirst({
        where: {
          id: submissionId,
          assignmentId,
        },
      });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found.",
        },
        { status: 404 }
      );
    }

    const requestedStatus =
      cleanString(body?.status).toUpperCase();

    if (!isReviewStatus(requestedStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status must be UNDER_REVIEW, CHANGES_REQUESTED, or GRADED.",
        },
        { status: 400 }
      );
    }

    if (
      requestedStatus === "UNDER_REVIEW" &&
      !["SUBMITTED", "CHANGES_REQUESTED"].includes(
        submission.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only submitted or resubmitted work can enter review.",
        },
        { status: 409 }
      );
    }

    if (
      requestedStatus === "CHANGES_REQUESTED" &&
      !["SUBMITTED", "UNDER_REVIEW"].includes(
        submission.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Changes can only be requested from submitted or under-review work.",
        },
        { status: 409 }
      );
    }

    const feedback =
      body?.feedback === undefined
        ? submission.feedback
        : cleanString(body.feedback) || null;

    if (
      typeof feedback === "string" &&
      feedback.length > 20000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback cannot exceed 20,000 characters.",
        },
        { status: 400 }
      );
    }

    let score: number | null =
      submission.score ?? null;

    let maxScore: number | null =
      submission.maxScore ?? null;

    if (body?.score !== undefined) {
      if (
        body.score === null ||
        body.score === ""
      ) {
        score = null;
      } else {
        score = Number(body.score);

        if (
          !Number.isFinite(score) ||
          score < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Score must be a non-negative number.",
            },
            { status: 400 }
          );
        }
      }
    }

    if (body?.maxScore !== undefined) {
      if (
        body.maxScore === null ||
        body.maxScore === ""
      ) {
        maxScore = null;
      } else {
        maxScore = Number(body.maxScore);

        if (
          !Number.isFinite(maxScore) ||
          maxScore <= 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Maximum score must be greater than zero.",
            },
            { status: 400 }
          );
        }
      }
    }

    if (
      requestedStatus === "GRADED" &&
      (score === null || maxScore === null)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A score and maximum score are required when grading.",
        },
        { status: 400 }
      );
    }

    if (
      score !== null &&
      maxScore !== null &&
      score > maxScore
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Score cannot exceed the maximum score.",
        },
        { status: 400 }
      );
    }

    if (
      requestedStatus === "CHANGES_REQUESTED" &&
      !feedback
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback is required when requesting changes.",
        },
        { status: 400 }
      );
    }

    const updated =
      await prisma.assignmentSubmission.update({
        where: {
          id: submission.id,
        },
        data: {
          status: requestedStatus,
          score,
          maxScore,
          feedback,
          reviewedAt: new Date(),
          reviewedById: session?.user?.id ?? null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message:
        requestedStatus === "GRADED"
          ? "Assignment graded successfully."
          : requestedStatus === "CHANGES_REQUESTED"
            ? "Changes requested successfully."
            : "Submission moved to review successfully.",
      submission: updated,
    });
  } catch (error) {
    console.error(
      "PATCH ASSIGNMENT SUBMISSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to review the assignment submission.",
      },
      { status: 500 }
    );
  }
}

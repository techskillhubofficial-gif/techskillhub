import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
};

type AttendanceInput = {
  enrollmentId: string;
  status: string;
  source?: string;
  joinedAt?: unknown;
  leftAt?: unknown;
  durationMinutes?: unknown;
  notes?: unknown;
};

const MANAGER_ROLES = new Set(["ADMIN", "MENTOR"]);

const ATTENDANCE_STATUSES = new Set([
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
]);

const ATTENDANCE_SOURCES = new Set([
  "MANUAL",
  "GOOGLE_MEET",
]);

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

async function getParams(context: RouteContext) {
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

async function getLesson(courseId: string, lessonId: string) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId,
    },
    select: {
      id: true,
      title: true,
      courseId: true,
      scheduledAt: true,
      endsAt: true,
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true,
        },
      },
    },
  });
}

async function canManageCourse(
  session: Session | null,
  courseId: string,
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

function parseDate(
  value: unknown,
  fieldName: string,
): { value: Date | null; error: string | null } {
  if (value === null || value === undefined || value === "") {
    return {
      value: null,
      error: null,
    };
  }

  if (typeof value !== "string") {
    return {
      value: null,
      error: `${fieldName} must be a valid date.`,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      value: null,
      error: `${fieldName} must be a valid date.`,
    };
  }

  return {
    value: date,
    error: null,
  };
}

function parseOptionalInteger(
  value: unknown,
  fieldName: string,
): { value: number | null; error: string | null } {
  if (value === null || value === undefined || value === "") {
    return {
      value: null,
      error: null,
    };
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return {
      value: null,
      error: `${fieldName} must be a non-negative integer.`,
    };
  }

  return {
    value: parsed,
    error: null,
  };
}

function normalizeBatchId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function normalizeAttendanceInput(
  input: AttendanceInput,
) {
  const enrollmentId =
    typeof input.enrollmentId === "string"
      ? input.enrollmentId.trim()
      : "";

  const status =
    typeof input.status === "string"
      ? input.status.trim().toUpperCase()
      : "";

  const source =
    typeof input.source === "string"
      ? input.source.trim().toUpperCase()
      : "MANUAL";

  if (!enrollmentId) {
    return {
      error: "Enrollment ID is required.",
    };
  }

  if (!ATTENDANCE_STATUSES.has(status)) {
    return {
      error: "Invalid attendance status.",
    };
  }

  if (!ATTENDANCE_SOURCES.has(source)) {
    return {
      error: "Invalid attendance source.",
    };
  }

  const joinedAtResult = parseDate(
    input.joinedAt,
    "joinedAt",
  );

  if (joinedAtResult.error) {
    return {
      error: joinedAtResult.error,
    };
  }

  const leftAtResult = parseDate(
    input.leftAt,
    "leftAt",
  );

  if (leftAtResult.error) {
    return {
      error: leftAtResult.error,
    };
  }

  if (
    joinedAtResult.value &&
    leftAtResult.value &&
    leftAtResult.value < joinedAtResult.value
  ) {
    return {
      error: "leftAt cannot be earlier than joinedAt.",
    };
  }

  const durationResult = parseOptionalInteger(
    input.durationMinutes,
    "durationMinutes",
  );

  if (durationResult.error) {
    return {
      error: durationResult.error,
    };
  }

  if (
    durationResult.value !== null &&
    durationResult.value > 24 * 60
  ) {
    return {
      error: "durationMinutes cannot exceed 1440 minutes.",
    };
  }

  /*
   * Manual attendance:
   *   PRESENT/LATE may be entered without timing information.
   *
   * Google Meet:
   *   PRESENT/LATE must contain actual participation timing.
   */
  if (
    source === "GOOGLE_MEET" &&
    (status === "PRESENT" || status === "LATE") &&
    !joinedAtResult.value &&
    durationResult.value === null
  ) {
    return {
      error:
        "Google Meet present or late attendance requires joinedAt or durationMinutes.",
    };
  }

  const notes =
    typeof input.notes === "string"
      ? input.notes.trim()
      : null;

  if (notes && notes.length > 2000) {
    return {
      error: "Attendance notes cannot exceed 2000 characters.",
    };
  }

  return {
    value: {
      enrollmentId,
      status,
      source,
      joinedAt: joinedAtResult.value,
      leftAt: leftAtResult.value,
      durationMinutes: durationResult.value,
      notes: notes || null,
    },
  };
}

/**
 * GET
 *
 * ADMIN / assigned MENTOR:
 *   Returns active/completed students for the selected batch.
 *
 * STUDENT:
 *   Returns only the authenticated student's own attendance.
 *
 * Query:
 *   ?batchId=<course batch id>
 */
export async function GET(
  req: Request,
  context: RouteContext,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return jsonError(
        "Authentication required.",
        401,
      );
    }

    const { courseId, lessonId } =
      await getParams(context);

    if (!courseId || !lessonId) {
      return jsonError(
        "Course and lecture are required.",
        400,
      );
    }

    const lesson = await getLesson(
      courseId,
      lessonId,
    );

    if (!lesson) {
      return jsonError(
        "Lecture not found.",
        404,
      );
    }

    const url = new URL(req.url);
    const batchId =
      normalizeBatchId(
        url.searchParams.get("batchId"),
      );

    const isManager = await canManageCourse(
      session,
      courseId,
    );

    if (isManager) {
      const enrollments =
        await prisma.enrollment.findMany({
          where: {
            courseId,
            ...(batchId
              ? { batchId }
              : {}),
            status: {
              in: ["ACTIVE", "COMPLETED"],
            },
          },
          orderBy: [
            {
              user: {
                name: "asc",
              },
            },
            {
              enrolledAt: "asc",
            },
          ],
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            batchId: true,
            batch: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
              },
            },
            attendanceRecords: {
              where: {
                lessonId,
              },
              select: {
                id: true,
                status: true,
                source: true,
                joinedAt: true,
                leftAt: true,
                durationMinutes: true,
                notes: true,
                markedById: true,
                createdAt: true,
                updatedAt: true,
                markedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

      const records = enrollments.map(
        (enrollment) => ({
          enrollmentId: enrollment.id,
          enrollmentStatus: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          batchId: enrollment.batchId,
          batch: enrollment.batch,
          student: enrollment.user,
          attendance:
            enrollment.attendanceRecords[0] ?? null,
        }),
      );

      return NextResponse.json({
        success: true,
        access: "MANAGER",
        batchId,
        lecture: {
          id: lesson.id,
          title: lesson.title,
          courseId: lesson.courseId,
          scheduledAt: lesson.scheduledAt,
          endsAt: lesson.endsAt,
          course: lesson.course,
        },
        totalStudents: records.length,
        records,
      });
    }

    if (session.user.role !== "STUDENT") {
      return jsonError(
        "Admin, mentor, or student access required.",
        403,
      );
    }

    const enrollment =
      await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          courseId,
          ...(batchId
            ? { batchId }
            : {}),
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
        },
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          batchId: true,
          batch: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
            },
          },
          attendanceRecords: {
            where: {
              lessonId,
            },
            select: {
              id: true,
              status: true,
              source: true,
              joinedAt: true,
              leftAt: true,
              durationMinutes: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!enrollment) {
      return jsonError(
        "You are not enrolled in this course.",
        403,
      );
    }

    return NextResponse.json({
      success: true,
      access: "STUDENT",
      batchId,
      lecture: {
        id: lesson.id,
        title: lesson.title,
        courseId: lesson.courseId,
        scheduledAt: lesson.scheduledAt,
        endsAt: lesson.endsAt,
        course: lesson.course,
      },
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        batchId: enrollment.batchId,
        batch: enrollment.batch,
      },
      attendance:
        enrollment.attendanceRecords[0] ?? null,
    });
  } catch (error) {
    console.error(
      "GET LECTURE ATTENDANCE ERROR:",
      error,
    );

    return jsonError(
      "Unable to load attendance.",
      500,
    );
  }
}

/**
 * PUT
 *
 * ADMIN / assigned MENTOR only.
 *
 * Updates one attendance record.
 */
export async function PUT(
  req: Request,
  context: RouteContext,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return jsonError(
        "Authentication required.",
        401,
      );
    }

    const { courseId, lessonId } =
      await getParams(context);

    if (!courseId || !lessonId) {
      return jsonError(
        "Course and lecture are required.",
        400,
      );
    }

    const canManage = await canManageCourse(
      session,
      courseId,
    );

    if (!canManage) {
      return jsonError(
        "Admin or assigned mentor access required.",
        403,
      );
    }

    const lesson = await getLesson(
      courseId,
      lessonId,
    );

    if (!lesson) {
      return jsonError(
        "Lecture not found.",
        404,
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return jsonError(
        "Invalid request body.",
        400,
      );
    }

    /*
     * Bulk request:
     *
     * {
     *   batchId?: string,
     *   records: [...]
     * }
     */
    if (Array.isArray(body.records)) {
      const batchId = normalizeBatchId(body.batchId);

      const rawRecords = body.records as unknown[];

      if (rawRecords.length === 0) {
        return jsonError(
          "At least one attendance record is required.",
          400,
        );
      }

      if (rawRecords.length > 500) {
        return jsonError(
          "A maximum of 500 attendance records can be saved at once.",
          400,
        );
      }

      const normalized = [];

      for (const rawRecord of rawRecords) {
        if (
          !rawRecord ||
          typeof rawRecord !== "object" ||
          Array.isArray(rawRecord)
        ) {
          return jsonError(
            "Each attendance record must be an object.",
            400,
          );
        }

        const parsed =
          normalizeAttendanceInput(
            rawRecord as AttendanceInput,
          );

        if (parsed.error) {
          return jsonError(
            parsed.error,
            400,
          );
        }

        normalized.push(parsed.value);
      }

      const enrollmentIds = [
        ...new Set(
          normalized.map(
            (record) => record!.enrollmentId,
          ),
        ),
      ];

      const enrollments =
        await prisma.enrollment.findMany({
          where: {
            id: {
              in: enrollmentIds,
            },
            courseId,
            status: {
              in: ["ACTIVE", "COMPLETED"],
            },
            ...(batchId
              ? { batchId }
              : {}),
          },
          select: {
            id: true,
            batchId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

      const enrollmentMap = new Map(
        enrollments.map(
          (enrollment) => [
            enrollment.id,
            enrollment,
          ],
        ),
      );

      if (
        enrollmentMap.size !==
        enrollmentIds.length
      ) {
        return jsonError(
          "One or more selected students are not active/completed enrollments in the selected batch.",
          400,
        );
      }

      const saved = [];

      for (const record of normalized) {
        const enrollment =
          enrollmentMap.get(
            record!.enrollmentId,
          );

        if (!enrollment) {
          return jsonError(
            "Enrollment validation failed.",
            400,
          );
        }

        const attendance =
          await prisma.lectureAttendance.upsert({
            where: {
              enrollmentId_lessonId: {
                enrollmentId:
                  record!.enrollmentId,
                lessonId,
              },
            },
            create: {
              enrollmentId:
                record!.enrollmentId,
              lessonId,
              status:
                record!.status as
                  | "PRESENT"
                  | "ABSENT"
                  | "LATE"
                  | "EXCUSED",
              source:
                record!.source as
                  | "MANUAL"
                  | "GOOGLE_MEET",
              joinedAt:
                record!.joinedAt,
              leftAt:
                record!.leftAt,
              durationMinutes:
                record!.durationMinutes,
              notes:
                record!.notes,
              markedById:
                session.user.id,
            },
            update: {
              status:
                record!.status as
                  | "PRESENT"
                  | "ABSENT"
                  | "LATE"
                  | "EXCUSED",
              source:
                record!.source as
                  | "MANUAL"
                  | "GOOGLE_MEET",
              joinedAt:
                record!.joinedAt,
              leftAt:
                record!.leftAt,
              durationMinutes:
                record!.durationMinutes,
              notes:
                record!.notes,
              markedById:
                session.user.id,
            },
          });

        saved.push({
          enrollmentId:
            enrollment.id,
          student:
            enrollment.user,
          attendance,
        });
      }

      return NextResponse.json({
        success: true,
        message:
          `Attendance saved for ${saved.length} ${
            saved.length === 1
              ? "student"
              : "students"
          }.`,
        batchId,
        saved,
      });
    }

    /*
     * Backward-compatible single-record request.
     */
    const parsed =
      normalizeAttendanceInput(
        body as AttendanceInput,
      );

    if (parsed.error) {
      return jsonError(
        parsed.error,
        400,
      );
    }

    const batchId =
      normalizeBatchId(body.batchId);

    const enrollment =
      await prisma.enrollment.findFirst({
        where: {
          id: parsed.value!.enrollmentId,
          courseId,
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
          ...(batchId
            ? { batchId }
            : {}),
        },
        select: {
          id: true,
          userId: true,
          batchId: true,
          status: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    if (!enrollment) {
      return jsonError(
        batchId
          ? "Active or completed enrollment was not found in the selected batch."
          : "Active or completed enrollment not found.",
        404,
      );
    }

    const attendance =
      await prisma.lectureAttendance.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId:
              enrollment.id,
            lessonId,
          },
        },
        create: {
          enrollmentId:
            enrollment.id,
          lessonId,
          status:
            parsed.value!.status as
              | "PRESENT"
              | "ABSENT"
              | "LATE"
              | "EXCUSED",
          source:
            parsed.value!.source as
              | "MANUAL"
              | "GOOGLE_MEET",
          joinedAt:
            parsed.value!.joinedAt,
          leftAt:
            parsed.value!.leftAt,
          durationMinutes:
            parsed.value!.durationMinutes,
          notes:
            parsed.value!.notes,
          markedById:
            session.user.id,
        },
        update: {
          status:
            parsed.value!.status as
              | "PRESENT"
              | "ABSENT"
              | "LATE"
              | "EXCUSED",
          source:
            parsed.value!.source as
              | "MANUAL"
              | "GOOGLE_MEET",
          joinedAt:
            parsed.value!.joinedAt,
          leftAt:
            parsed.value!.leftAt,
          durationMinutes:
            parsed.value!.durationMinutes,
          notes:
            parsed.value!.notes,
          markedById:
            session.user.id,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Attendance saved successfully.",
      attendance,
      student:
        enrollment.user,
      lecture: {
        id: lesson.id,
        title: lesson.title,
      },
      batchId:
        enrollment.batchId,
    });
  } catch (error) {
    console.error(
      "PUT LECTURE ATTENDANCE ERROR:",
      error,
    );

    return jsonError(
      "Unable to save attendance.",
      500,
    );
  }
}

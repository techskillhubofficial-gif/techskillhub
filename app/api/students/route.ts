import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const enrollmentStatus =
      searchParams.get("status")?.trim() || "";

    const where: Prisma.UserWhereInput = {
      role: Role.STUDENT,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(enrollmentStatus
        ? {
            enrollments: {
              some: {
                status:
                  enrollmentStatus as never,
              },
            },
          }
        : {}),
    };

    const students =
      await prisma.user.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          emailVerified: true,
          createdAt: true,

          enrollments: {
            orderBy: {
              enrolledAt: "desc",
            },

            select: {
              id: true,
              progress: true,
              status: true,
              enrolledAt: true,

              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  duration: true,
                },
              },
            },
          },

          admissions: {
            orderBy: {
              createdAt: "desc",
            },

            take: 5,

            select: {
              id: true,
              admissionNo: true,
              program: true,
              batchName: true,
              status: true,
              totalFee: true,
              registrationFee: true,
              createdAt: true,
            },
          },
        },
      });

    /* =====================================================
       STATS
    ===================================================== */

    const stats = {
      total: students.length,

      active: students.filter(
        (student) =>
          student.enrollments.some(
            (item) =>
              item.status === "ACTIVE",
          ),
      ).length,

      completed: students.filter(
        (student) =>
          student.enrollments.some(
            (item) =>
              item.status === "COMPLETED",
          ),
      ).length,

      pendingAccounts: students.filter(
        (student) =>
          !student.emailVerified,
      ).length,
    };

    /* =====================================================
       NORMALIZED RESPONSE
    ===================================================== */

    const data = students.map(
      (student) => {
        const activeEnrollment =
          student.enrollments.find(
            (item) =>
              item.status === "ACTIVE",
          ) ??
          student.enrollments[0] ??
          null;

        const latestAdmission =
          student.admissions[0] ??
          null;

        return {
          ...student,

          currentCourse:
            activeEnrollment?.course ??
            null,

          currentProgress:
            activeEnrollment?.progress ??
            0,

          currentEnrollmentStatus:
            activeEnrollment?.status ??
            null,

          currentEnrollmentId:
            activeEnrollment?.id ??
            null,

          latestAdmission,
        };
      },
    );

    return NextResponse.json({
      success: true,

      data,

      students: data,

      total: data.length,

      stats,
    });
  } catch (error) {
    console.error(
      "GET Students Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load students.",
      },
      {
        status: 500,
      },
    );
  }
}
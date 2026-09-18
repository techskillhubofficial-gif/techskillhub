import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  AdmissionStatus,
  EnrollmentStatus,
  LeadStatus,
  PaymentStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hash } from "bcrypt";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: errorResponse("Authentication required.", 401),
    };
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      ok: false as const,
      response: errorResponse(
        "Administrator access is required for enrollment actions.",
        403,
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

function generateTemporaryPassword() {
  return `TSH-${crypto.randomBytes(4).toString("hex")}`;
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId")?.trim();
    const courseId = searchParams.get("courseId")?.trim();
    const status = searchParams.get("status")?.trim();

    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(courseId ? { courseId } : {}),
        ...(status
          ? {
              status: status as EnrollmentStatus,
            }
          : {}),
      },
      orderBy: {
        enrolledAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            level: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("GET Enrollments Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load enrollments.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const body = await req.json();

    const admissionId =
      typeof body.admissionId === "string"
        ? body.admissionId.trim()
        : "";

    if (!admissionId) {
      return errorResponse("Admission ID is required.");
    }

    const admission = await prisma.admission.findUnique({
      where: {
        id: admissionId,
      },
      include: {
        payments: true,
        course: true,
        lead: true,
        user: true,
      },
    });

    if (!admission) {
      return errorResponse("Admission not found.", 404);
    }

    if (admission.status === AdmissionStatus.REJECTED) {
      return errorResponse(
        "Rejected admissions cannot be enrolled.",
      );
    }

    if (admission.status !== AdmissionStatus.APPROVED) {
      return errorResponse(
        `Admission must be Approved before enrollment. Current status: ${admission.status}.`,
      );
    }

    if (!admission.courseId || !admission.course) {
      return errorResponse(
        "This admission is not linked to a real course. Select a course from the admission workspace before enrolling.",
        409,
      );
    }

    const pendingPayments = admission.payments.filter(
      (payment) =>
        payment.status === PaymentStatus.PENDING,
    );

    if (pendingPayments.length > 0) {
      return errorResponse(
        "Enrollment is blocked because one or more payments are still pending verification.",
        409,
      );
    }

    const verifiedPaid = admission.payments
      .filter(
        (payment) =>
          payment.status === PaymentStatus.VERIFIED,
      )
      .reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

    if (verifiedPaid < admission.registrationFee) {
      return errorResponse(
        "The registration payment has not been fully verified.",
        409,
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        let user = admission.user;

        let temporaryPassword: string | null = null;

        if (!user) {
          user = await tx.user.findUnique({
            where: {
              email: admission.studentEmail,
            },
          });
        }

        if (!user) {
          temporaryPassword =
            generateTemporaryPassword();

          const passwordHash = await hash(
            temporaryPassword,
            12,
          );

          user = await tx.user.create({
            data: {
              name: admission.studentName,
              email: admission.studentEmail,
              password: passwordHash,
              phone: admission.studentPhone,
              role: Role.STUDENT,
              emailVerified: false,
            },
          });
        } else {
          user = await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: admission.studentName,
              phone: admission.studentPhone,
              role:
                user.role === Role.ADMIN
                  ? user.role
                  : Role.STUDENT,
            },
          });
        }

        const existingEnrollment =
          await tx.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: user.id,
                courseId: admission.courseId!,
              },
            },
            include: {
              course: true,
            },
          });

        if (existingEnrollment) {
          await tx.admission.update({
            where: {
              id: admission.id,
            },
            data: {
              userId: user.id,
              courseId: admission.courseId!,
              status: AdmissionStatus.ENROLLED,
            },
          });

          if (admission.leadId) {
            await tx.lead.update({
              where: {
                id: admission.leadId,
              },
              data: {
                status: LeadStatus.ENROLLED,
                currentStatus: LeadStatus.ENROLLED,
              },
            });
          }

          return {
            enrollment: existingEnrollment,
            user,
            temporaryPassword,
            alreadyEnrolled: true,
          };
        }

        const enrollment =
          await tx.enrollment.create({
            data: {
              userId: user.id,
              courseId: admission.courseId!,
              status: EnrollmentStatus.ACTIVE,
              progress: 0,
            },
            include: {
              course: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          });

        await tx.admission.update({
          where: {
            id: admission.id,
          },
          data: {
            userId: user.id,
            status: AdmissionStatus.ENROLLED,
          },
        });

        if (admission.leadId) {
          await tx.lead.update({
            where: {
              id: admission.leadId,
            },
            data: {
              status: LeadStatus.ENROLLED,
              currentStatus: LeadStatus.ENROLLED,
            },
          });
        }

        return {
          enrollment,
          user,
          temporaryPassword,
          alreadyEnrolled: false,
        };
      },
    );

    return NextResponse.json({
      success: true,
      message: result.alreadyEnrolled
        ? "Student was already enrolled."
        : "Student enrolled successfully.",
      ...result,
    });
  } catch (error) {
    console.error("POST Enrollment Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to enroll student.",
      },
      { status: 500 },
    );
  }
}

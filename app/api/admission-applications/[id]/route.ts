import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * TechSkillHub Admin Admission Application Review API
 *
 * IMPORTANT:
 * - ADMIN authentication is mandatory.
 * - This route only reviews AdmissionApplication records.
 * - It does NOT create Admission records.
 * - It does NOT create Enrollment records.
 * - It does NOT modify financial values.
 * - It does NOT modify RegistrationPayment verification.
 *
 * Supported review lifecycle:
 *
 * SUBMITTED
 *   ↓
 * UNDER_REVIEW
 *   ├── CHANGES_REQUESTED
 *   │        ↓
 *   │     SUBMITTED
 *   │
 *   ├── APPROVED
 *   │
 *   └── REJECTED
 *
 * APPROVED is only application approval.
 * Admission creation remains a separate controlled workflow.
 */

const REVIEWABLE_STATUSES = new Set([
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
]);

const ALLOWED_TARGET_STATUSES = new Set([
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "SUBMITTED",
]);

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function getAllowedTransitions(
  currentStatus: string,
): Set<string> {
  switch (currentStatus) {
    case "SUBMITTED":
      return new Set([
        "UNDER_REVIEW",
        "CHANGES_REQUESTED",
        "APPROVED",
        "REJECTED",
      ]);

    case "UNDER_REVIEW":
      return new Set([
        "CHANGES_REQUESTED",
        "APPROVED",
        "REJECTED",
      ]);

    case "CHANGES_REQUESTED":
      return new Set([
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
      ]);

    default:
      return new Set();
  }
}

function getLeadCurrentStatus(
  targetStatus: string,
): string {
  switch (targetStatus) {
    case "UNDER_REVIEW":
      return "UNDER_REVIEW";

    case "CHANGES_REQUESTED":
      return "CHANGES_REQUESTED";

    case "APPROVED":
      return "APPROVED";

    case "REJECTED":
      return "REJECTED";

    case "SUBMITTED":
      return "APPLICATION_SUBMITTED";

    default:
      return "APPLICATION_SUBMITTED";
  }
}

function getAuditEventType(
  targetStatus: string,
): string {
  switch (targetStatus) {
    case "UNDER_REVIEW":
      return "APPLICATION_REVIEW_STARTED";

    case "CHANGES_REQUESTED":
      return "APPLICATION_CHANGES_REQUESTED";

    case "APPROVED":
      return "APPLICATION_APPROVED";

    case "REJECTED":
      return "APPLICATION_REJECTED";

    case "SUBMITTED":
      return "APPLICATION_RESUBMITTED";

    default:
      return "APPLICATION_STATUS_UPDATED";
  }
}

async function requireAdmin() {
  const session = await getServerSession(
    authOptions,
  );

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

/**
 * GET
 *
 * Returns one admission application with its
 * review/audit information.
 */
export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const id = cleanString(
      (await context.params).id,
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admission application ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          id,
        },

        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
            },
          },

          lead: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
              currentStatus: true,
            },
          },

          registrationPayment: {
            select: {
              id: true,
              registrationNo: true,
              amount: true,
              mode: true,
              transactionId: true,
              status: true,
              proofUrl: true,
              submittedAt: true,
              verifiedAt: true,
              verifiedBy: true,
            },
          },

          consents: {
            orderBy: {
              createdAt: "asc",
            },
          },

          auditEvents: {
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admission application not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error(
      "GET /api/admission-applications/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch admission application.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH
 *
 * Admin-only application review.
 *
 * Expected body:
 *
 * {
 *   "status": "UNDER_REVIEW"
 * }
 *
 * or:
 *
 * {
 *   "status": "CHANGES_REQUESTED",
 *   "notes": "Please upload the missing document."
 * }
 *
 * or:
 *
 * {
 *   "status": "APPROVED",
 *   "notes": "Application verified and approved."
 * }
 *
 * or:
 *
 * {
 *   "status": "REJECTED",
 *   "reason": "Application requirements were not satisfied."
 * }
 */
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const id = cleanString(
      (await context.params).id,
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admission application ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const input =
      body as Record<string, unknown>;

    const requestedStatus =
      cleanString(input.status)?.toUpperCase();

    if (
      !requestedStatus ||
      !ALLOWED_TARGET_STATUSES.has(
        requestedStatus,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid review status is required.",
          allowedStatuses: Array.from(
            ALLOWED_TARGET_STATUSES,
          ),
        },
        {
          status: 400,
        },
      );
    }

    const notes =
      cleanString(input.notes);

    const reason =
      cleanString(input.reason);

    const reviewMessage =
      notes ?? reason;

    /*
     * CHANGES_REQUESTED and REJECTED must carry
     * an explicit explanation.
     *
     * This prevents silent negative decisions.
     */
    if (
      (
        requestedStatus ===
          "CHANGES_REQUESTED" ||
        requestedStatus ===
          "REJECTED"
      ) &&
      !reviewMessage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            requestedStatus ===
            "CHANGES_REQUESTED"
              ? "Review notes are required when requesting changes."
              : "A rejection reason is required when rejecting an application.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * APPROVED may optionally have notes.
     *
     * No financial fields are accepted from the
     * browser and no admission is created here.
     */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const application =
            await tx.admissionApplication.findUnique(
              {
                where: {
                  id,
                },

                select: {
                  id: true,
                  applicationNo: true,
                  leadId: true,
                  courseId: true,
                  studentName: true,
                  studentEmail: true,
                  studentPhone: true,
                  program: true,
                  status: true,
                  reviewNotes: true,
                  rejectionReason: true,
                  reviewedAt: true,
                  reviewedBy: true,
                },
              },
            );

          if (!application) {
            throw new Error(
              "APPLICATION_NOT_FOUND",
            );
          }

          const currentStatus =
            application.status;

          /*
           * Idempotent repeat request:
           *
           * If the exact target status is already
           * active, reject rather than creating duplicate
           * audit/review activity.
           */
          if (
            currentStatus ===
            requestedStatus
          ) {
            throw new Error(
              "STATUS_ALREADY_SET",
            );
          }

          if (
            !REVIEWABLE_STATUSES.has(
              currentStatus,
            )
          ) {
            throw new Error(
              "APPLICATION_NOT_REVIEWABLE",
            );
          }

          const allowedTransitions =
            getAllowedTransitions(
              currentStatus,
            );

          if (
            !allowedTransitions.has(
              requestedStatus,
            )
          ) {
            throw new Error(
              "INVALID_STATUS_TRANSITION",
            );
          }

          /*
           * ---------------------------------------------------
           * APPLICATION UPDATE
           * ---------------------------------------------------
           *
           * Only review-related fields are changed.
           *
           * Financial snapshot remains untouched.
           */
          const updatedApplication =
            await tx.admissionApplication.update(
              {
                where: {
                  id: application.id,
                },

                data: {
                  status:
                    requestedStatus,

                  reviewedAt:
                    new Date(),

                  reviewedBy:
                    auth.session.user.id,

                  reviewNotes:
                    requestedStatus ===
                    "CHANGES_REQUESTED"
                      ? reviewMessage
                      : requestedStatus ===
                          "APPROVED"
                        ? reviewMessage ??
                          application.reviewNotes
                        : requestedStatus ===
                            "REJECTED"
                          ? reviewMessage ??
                            application.reviewNotes
                          : application.reviewNotes,

                  rejectionReason:
                    requestedStatus ===
                    "REJECTED"
                      ? reviewMessage
                      : requestedStatus ===
                            "CHANGES_REQUESTED"
                        ? null
                        : requestedStatus ===
                            "APPROVED"
                          ? null
                          : application.rejectionReason,
                },

                select: {
                  id: true,
                  applicationNo: true,
                  status: true,
                  studentName: true,
                  studentEmail: true,
                  studentPhone: true,
                  program: true,
                  baseFee: true,
                  concessionPercent: true,
                  concessionAmount: true,
                  totalFee: true,
                  registrationFee: true,
                  firstLectureFee: true,
                  balanceFee: true,
                  reviewNotes: true,
                  rejectionReason: true,
                  reviewedAt: true,
                  reviewedBy: true,
                  submittedAt: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            );

          /*
           * ---------------------------------------------------
           * APPLICATION AUDIT
           * ---------------------------------------------------
           */

          await tx.applicationAuditEvent.create({
            data: {
              applicationId:
                application.id,

              eventType:
                getAuditEventType(
                  requestedStatus,
                ),

              fromStatus:
                currentStatus,

              toStatus:
                requestedStatus,

              actorId:
                auth.session.user.id,

              actorType:
                "ADMIN",

              description:
                reviewMessage ??
                `Application status changed from ${currentStatus} to ${requestedStatus}.`,

              metadata: {
                applicationNo:
                  application.applicationNo,

                courseId:
                  application.courseId,

                studentEmail:
                  application.studentEmail,

                studentPhone:
                  application.studentPhone,

                program:
                  application.program,
              },
            },
          });

          /*
           * ---------------------------------------------------
           * CRM LIFECYCLE
           * ---------------------------------------------------
           */

          if (application.leadId) {
            await tx.lead.update({
              where: {
                id: application.leadId,
              },

              data: {
                currentStatus:
                  getLeadCurrentStatus(
                    requestedStatus,
                  ),

                interestedProgram:
                  application.program,
              },
            });

            await tx.leadActivity.create({
              data: {
                leadId:
                  application.leadId,

                type:
                  "UPDATED",

                title:
                  requestedStatus ===
                  "UNDER_REVIEW"
                    ? "Admission application under review"
                    : requestedStatus ===
                        "CHANGES_REQUESTED"
                      ? "Admission application changes requested"
                      : requestedStatus ===
                          "APPROVED"
                        ? "Admission application approved"
                        : requestedStatus ===
                            "REJECTED"
                          ? "Admission application rejected"
                          : "Admission application resubmitted",

                description:
                  reviewMessage ??
                  `Application ${application.applicationNo} moved from ${currentStatus} to ${requestedStatus}.`,

                metadata: {
                  applicationId:
                    application.id,

                  applicationNo:
                    application.applicationNo,

                  fromStatus:
                    currentStatus,

                  toStatus:
                    requestedStatus,
                },

                createdBy:
                  auth.session.user.id,
              },
            });
          }

          return updatedApplication;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        },
      );

    return NextResponse.json({
      success: true,

      message:
        requestedStatus ===
        "UNDER_REVIEW"
          ? "Admission application moved to review."
          : requestedStatus ===
              "CHANGES_REQUESTED"
            ? "Changes have been requested from the applicant."
            : requestedStatus ===
                "APPROVED"
              ? "Admission application approved successfully."
              : requestedStatus ===
                  "REJECTED"
                ? "Admission application rejected."
                : "Admission application resubmitted successfully.",

      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "APPLICATION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admission application not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "STATUS_ALREADY_SET"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The application is already in the requested status.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "APPLICATION_NOT_REVIEWABLE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This application is no longer available for administrative review.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_STATUS_TRANSITION"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The requested application status transition is not allowed.",
        },
        {
          status: 409,
        },
      );
    }

    console.error(
      "PATCH /api/admission-applications/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to review admission application.",
      },
      {
        status: 500,
      },
    );
  }
}

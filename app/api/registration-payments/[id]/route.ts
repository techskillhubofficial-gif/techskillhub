import { NextResponse } from "next/server";
import {
  getServerSession,
} from "next-auth";
import {
  LeadActivityType,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function errorResponse(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}

function cleanString(
  value: unknown,
  maxLength = 1000,
) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isPaymentStatus(
  value: unknown,
): value is PaymentStatus {
  return (
    typeof value === "string" &&
    Object.values(
      PaymentStatus,
    ).includes(
      value as PaymentStatus,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* GET                                                                       */
/* Registration payment details                                               */
/* -------------------------------------------------------------------------- */

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.id) {
      return errorResponse(
        "Unauthorized.",
        401,
      );
    }

    if (
      session.user.role !==
      "ADMIN"
    ) {
      return errorResponse(
        "Forbidden. Admin access required.",
        403,
      );
    }

    const { id } =
      await context.params;

    if (!id?.trim()) {
      return errorResponse(
        "Registration payment ID is required.",
      );
    }

    const payment =
      await prisma.registrationPayment.findUnique(
        {
          where: {
            id: id.trim(),
          },

          include: {
            lead: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                currentStatus: true,
                interestedProgram: true,
                status: true,
              },
            },

            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                published: true,
              },
            },

            application: {
              select: {
                id: true,
                applicationNo: true,
                status: true,
                studentName: true,
                studentEmail: true,
                studentPhone: true,
                program: true,
                submittedAt: true,
              },
            },
          },
        },
      );

    if (!payment) {
      return errorResponse(
        "Registration payment not found.",
        404,
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/registration-payments/[id] error:",
      error,
    );

    return errorResponse(
      "Failed to load registration payment.",
      500,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PATCH                                                                     */
/* Verify or reject a registration payment                                   */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* ADMIN AUTHORIZATION                                                    */
    /* ---------------------------------------------------------------------- */

    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.id) {
      return errorResponse(
        "Unauthorized.",
        401,
      );
    }

    if (
      session.user.role !==
      "ADMIN"
    ) {
      return errorResponse(
        "Forbidden. Admin access required.",
        403,
      );
    }

    const { id } =
      await context.params;

    if (!id?.trim()) {
      return errorResponse(
        "Registration payment ID is required.",
      );
    }

    /* ---------------------------------------------------------------------- */
    /* REQUEST BODY                                                            */
    /* ---------------------------------------------------------------------- */

    const body =
      await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return errorResponse(
        "Invalid request body.",
      );
    }

    const action =
      cleanString(
        body.action,
        30,
      ).toUpperCase();

    if (
      action !== "VERIFY" &&
      action !== "REJECT"
    ) {
      return errorResponse(
        "Action must be VERIFY or REJECT.",
      );
    }

    const payment =
      await prisma.registrationPayment.findUnique(
        {
          where: {
            id: id.trim(),
          },

          include: {
            lead: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                currentStatus: true,
                interestedProgram: true,
                status: true,
              },
            },

            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
              },
            },

            application: {
              select: {
                id: true,
                applicationNo: true,
                status: true,
              },
            },
          },
        },
      );

    if (!payment) {
      return errorResponse(
        "Registration payment not found.",
        404,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* STATE PROTECTION                                                        */
    /* ---------------------------------------------------------------------- */

    if (
      payment.status !==
      PaymentStatus.PENDING
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `This registration payment is already ${payment.status.toLowerCase()} and cannot be changed through this action.`,

          data: {
            id:
              payment.id,

            registrationNo:
              payment.registrationNo,

            status:
              payment.status,
          },
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* REJECTION                                                              */
    /* ---------------------------------------------------------------------- */

    if (
      action === "REJECT"
    ) {
      const rejectionReason =
        cleanString(
          body.rejectionReason ??
            body.reason,
          2000,
        );

      if (!rejectionReason) {
        return errorResponse(
          "A rejection reason is required.",
        );
      }

      const updated =
        await prisma.$transaction(
          async (tx) => {
            const result =
              await tx.registrationPayment.update(
                {
                  where: {
                    id:
                      payment.id,
                  },

                  data: {
                    status:
                      PaymentStatus.FAILED,

                    rejectionReason,

                    verifiedAt:
                      new Date(),

                    verifiedBy:
                      session.user.id,
                  },

                  include: {
                    lead: {
                      select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        currentStatus: true,
                        status: true,
                      },
                    },

                    course: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                      },
                    },
                  },
                },
              );

            /*
             * We intentionally keep the CRM stage as
             * REGISTRATION_PENDING.
             *
             * The payment failed/requires correction,
             * so the lead has NOT successfully completed
             * registration.
             */
            await tx.lead.update(
              {
                where: {
                  id:
                    payment.leadId,
                },

                data: {
                  currentStatus:
                    "REGISTRATION_PENDING",
                },
              },
            );

            await tx.leadActivity.create(
              {
                data: {
                  leadId:
                    payment.leadId,

                  type:
                    LeadActivityType.UPDATED,

                  title:
                    "Registration payment rejected",

                  description:
                    "The submitted registration payment was rejected by an administrator and requires correction or resubmission.",

                  createdBy:
                    session.user.id,

                  metadata: {
                    registrationPaymentId:
                      payment.id,

                    registrationNo:
                      payment.registrationNo,

                    courseId:
                      payment.courseId,

                    courseTitle:
                      payment.course.title,

                    amount:
                      payment.amount,

                    previousStatus:
                      PaymentStatus.PENDING,

                    newStatus:
                      PaymentStatus.FAILED,

                    rejectionReason,
                  },
                },
              },
            );

            return result;
          },
        );

      return NextResponse.json(
        {
          success: true,

          message:
            "Registration payment rejected successfully.",

          data: {
            payment:
              updated,

            nextStep:
              "The student can correct the payment information and submit a new registration payment.",
          },
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VERIFICATION REQUIREMENTS                                              */
    /* ---------------------------------------------------------------------- */

    /*
     * A manual payment should have traceable evidence
     * before an administrator can verify it.
     *
     * We accept either:
     * - transaction / UTR number
     * - payment proof URL
     *
     * This avoids allowing a completely empty manual
     * payment record to become VERIFIED.
     */
    if (
      !payment.transactionId &&
      !payment.proofUrl
    ) {
      return errorResponse(
        "This payment cannot be verified because no transaction ID/UTR or payment proof has been submitted.",
        422,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VERIFY                                                                 */
    /* ---------------------------------------------------------------------- */

    const updated =
      await prisma.$transaction(
        async (tx) => {
          const result =
            await tx.registrationPayment.update(
              {
                where: {
                  id:
                    payment.id,

                  status:
                    PaymentStatus.PENDING,
                },

                data: {
                  status:
                    PaymentStatus.VERIFIED,

                  verifiedAt:
                    new Date(),

                  verifiedBy:
                    session.user.id,

                  rejectionReason:
                    null,
                },

                include: {
                  lead: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                      currentStatus: true,
                      interestedProgram: true,
                      status: true,
                    },
                  },

                  course: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                      price: true,
                    },
                  },

                  application: {
                    select: {
                      id: true,
                      applicationNo: true,
                      status: true,
                    },
                  },
                },
              },
            );

          /*
           * Registration payment is now confirmed.
           *
           * IMPORTANT:
           * VERIFIED registration payment does NOT create
           * an Admission and does NOT enroll the student.
           */
          await tx.lead.update(
            {
              where: {
                id:
                  payment.leadId,
              },

              data: {
                currentStatus:
                  "REGISTRATION_PAID",

                interestedProgram:
                  payment.course.title,
              },
            },
          );

          await tx.leadActivity.create(
            {
              data: {
                leadId:
                  payment.leadId,

                type:
                  LeadActivityType.UPDATED,

                title:
                  "Registration payment verified",

                description:
                  "The ₹5,000 registration payment was verified by an administrator.",

                createdBy:
                  session.user.id,

                metadata: {
                  registrationPaymentId:
                    payment.id,

                  registrationNo:
                    payment.registrationNo,

                  courseId:
                    payment.courseId,

                  courseTitle:
                    payment.course.title,

                  amount:
                    payment.amount,

                  paymentMode:
                    payment.mode,

                  transactionId:
                    payment.transactionId,

                  previousStatus:
                    PaymentStatus.PENDING,

                  newStatus:
                    PaymentStatus.VERIFIED,
                },
              },
            },
          );

          return result;
        },
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Registration payment verified successfully.",

        data: {
          payment:
            updated,

          nextStep:
            "Registration is confirmed. The student can now continue with the full admission application.",

          admissionApproved:
            false,

          enrolled:
            false,
        },
      },
    );
  } catch (error) {
    console.error(
      "PATCH /api/registration-payments/[id] error:",
      error,
    );

    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (
        error.code ===
        "P2025"
      ) {
        return errorResponse(
          "The registration payment could not be updated because it no longer exists or its status has already changed.",
          409,
        );
      }
    }

    return errorResponse(
      "Failed to update registration payment.",
      500,
    );
  }
}

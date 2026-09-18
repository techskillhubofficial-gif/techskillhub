import { NextResponse } from "next/server";
import {
  LeadActivityType,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function cleanString(
  value: unknown,
  maxLength = 500,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
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

/* -------------------------------------------------------------------------- */
/* POST                                                                      */
/* Upload registration payment proof                                         */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    const paymentId =
      cleanString(
        id,
        100,
      );

    if (!paymentId) {
      return errorResponse(
        "Registration payment ID is required.",
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Read multipart form                                                     */
    /* ---------------------------------------------------------------------- */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const studentEmail =
      cleanString(
        formData.get(
          "studentEmail",
        ),
        254,
      ).toLowerCase();

    if (!(file instanceof File)) {
      return errorResponse(
        "Please select a payment proof file.",
      );
    }

    if (!studentEmail) {
      return errorResponse(
        "Student email is required.",
      );
    }

    if (
      !studentEmail.includes("@")
    ) {
      return errorResponse(
        "Please provide a valid student email.",
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate file                                                           */
    /* ---------------------------------------------------------------------- */

    if (file.size <= 0) {
      return errorResponse(
        "The selected file is empty.",
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "Payment proof must be 10 MB or smaller.",
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse(
        "Only PDF, JPG, PNG or WEBP payment proofs are supported.",
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Find registration payment                                               */
    /* ---------------------------------------------------------------------- */

    const payment =
      await prisma.registrationPayment.findUnique(
        {
          where: {
            id: paymentId,
          },

          select: {
            id: true,
            registrationNo: true,
            leadId: true,
            courseId: true,
            studentName: true,
            studentEmail: true,
            amount: true,
            mode: true,
            transactionId: true,
            status: true,
            proofUrl: true,

            course: {
              select: {
                id: true,
                title: true,
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
    /* Verify student ownership                                                */
    /* ---------------------------------------------------------------------- */

    if (
      payment.studentEmail
        .trim()
        .toLowerCase() !==
      studentEmail
    ) {
      return errorResponse(
        "The provided student email does not match this registration payment.",
        403,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Payment state protection                                                */
    /* ---------------------------------------------------------------------- */

    if (
      payment.status !==
      PaymentStatus.PENDING
    ) {
      return errorResponse(
        `Payment proof cannot be uploaded because this payment is already ${payment.status.toLowerCase()}.`,
        409,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Upload to Cloudinary                                                    */
    /* ---------------------------------------------------------------------- */

    const bytes =
      await file.arrayBuffer();

    const uploadResult =
      await uploadToCloudinary({
        buffer:
          Buffer.from(bytes),

        fileName:
          file.name,

        mimeType:
          file.type,

        folder:
          `techskillhub/registration-payments/${payment.id}`,
      });

    /* ---------------------------------------------------------------------- */
    /* Save proof URL                                                          */
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
                  proofUrl:
                    uploadResult.secureUrl,
                },

                select: {
                  id: true,
                  registrationNo:
                    true,
                  studentName:
                    true,
                  studentEmail:
                    true,
                  amount:
                    true,
                  mode:
                    true,
                  transactionId:
                    true,
                  status:
                    true,
                  proofUrl:
                    true,
                  submittedAt:
                    true,
                  updatedAt:
                    true,
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
                  "Registration payment proof uploaded",

                description:
                  `Payment proof was uploaded for registration ${payment.registrationNo}.`,

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

                  fileName:
                    file.name,

                  mimeType:
                    file.type,

                  fileSize:
                    file.size,
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
          "Payment proof uploaded successfully.",

        data: {
          payment:
            updated,

          registrationNo:
            payment.registrationNo,

          status:
            PaymentStatus.PENDING,

          nextStep:
            "Your payment proof is now available for TechSkillHub admin verification.",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/registration-payments/[id]/proof error:",
      error,
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to upload payment proof.",
      500,
    );
  }
}

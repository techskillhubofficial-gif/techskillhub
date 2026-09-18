import { NextRequest, NextResponse } from "next/server";
import {
  AdmissionStatus,
  LeadActivityType,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REGISTRATION_FEE = 5000;

function errorResponse(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

function makeAdmissionNumber() {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `TSH-ADM-${date}-${random}`;
}

async function createUniqueAdmissionNumber() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const admissionNo = makeAdmissionNumber();

    const existing = await prisma.admission.findUnique({
      where: { admissionNo },
      select: { id: true },
    });

    if (!existing) {
      return admissionNo;
    }
  }

  throw new Error("Unable to generate a unique admission number.");
}

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return errorResponse("Unauthorized.", 401);
  }

  const { id } = await context.params;

  if (!id) {
    return errorResponse("Application ID is required.", 400);
  }

  try {
    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: {
        course: true,
        lead: true,
        registrationPayment: true,
        admission: {
          select: {
            id: true,
            admissionNo: true,
            status: true,
          },
        },
      },
    });

    if (!application) {
      return errorResponse("Admission application not found.", 404);
    }

    /*
     * Idempotency:
     * If an admission has already been created for this application,
     * return it instead of creating another admission/payment.
     */
    if (application.admission.length > 0) {
      const existingAdmission = application.admission[0];

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "Admission already exists for this application.",
        admission: existingAdmission,
      });
    }

    if (application.status !== "APPROVED") {
      return errorResponse(
        "Only an approved admission application can be converted into an admission.",
        409,
      );
    }

    if (!application.courseId || !application.course) {
      return errorResponse(
        "The approved application does not have a valid course.",
        409,
      );
    }

    if (!application.leadId || !application.lead) {
      return errorResponse(
        "The approved application does not have a valid lead.",
        409,
      );
    }

    const registrationPayment =
      application.registrationPayment;

    if (!registrationPayment) {
      return errorResponse(
        "No registration payment is linked to this application.",
        409,
      );
    }

    if (registrationPayment.status !== PaymentStatus.VERIFIED) {
      return errorResponse(
        "The linked registration payment is not verified.",
        409,
      );
    }

    if (registrationPayment.amount !== REGISTRATION_FEE) {
      return errorResponse(
        `The verified registration payment must be ₹${REGISTRATION_FEE.toLocaleString(
          "en-IN",
        )}.`,
        409,
      );
    }

    if (
      registrationPayment.courseId !== application.courseId ||
      registrationPayment.leadId !== application.leadId
    ) {
      return errorResponse(
        "The registration payment does not match the application.",
        409,
      );
    }

    if (
      registrationPayment.studentEmail.trim().toLowerCase() !==
      application.studentEmail.trim().toLowerCase()
    ) {
      return errorResponse(
        "The registration payment email does not match the application.",
        409,
      );
    }

    if (
      registrationPayment.studentPhone.trim() !==
      application.studentPhone.trim()
    ) {
      return errorResponse(
        "The registration payment phone does not match the application.",
        409,
      );
    }

    const totalFee = Math.max(
      0,
      Math.round(application.totalFee),
    );

    const registrationFee = REGISTRATION_FEE;

    if (totalFee < registrationFee) {
      return errorResponse(
        "Application total fee cannot be lower than the registration fee.",
        409,
      );
    }

    const balanceFee = totalFee - registrationFee;
    const admissionNo = await createUniqueAdmissionNumber();

    const result = await prisma.$transaction(
      async (tx) => {
        /*
         * Re-check inside the transaction to protect against
         * duplicate admin clicks/race conditions.
         */
        const lockedApplication =
          await tx.admissionApplication.findUnique({
            where: { id },
            include: {
              admission: {
                select: {
                  id: true,
                  admissionNo: true,
                  status: true,
                },
              },
            },
          });

        if (!lockedApplication) {
          throw new Error("Admission application not found.");
        }

        if (lockedApplication.admission.length > 0) {
          return {
            alreadyExists: true,
            admission: lockedApplication.admission[0],
          };
        }

        if (lockedApplication.status !== "APPROVED") {
          throw new Error(
            "Only an approved admission application can be converted into an admission.",         );
        }

        const admission = await tx.admission.create({
          data: {
            admissionNo,
            applicationId: application.id,
            leadId: application.leadId,
            courseId: application.courseId,
            studentName: application.studentName,
            studentEmail: application.studentEmail,
            studentPhone: application.studentPhone,
            program: application.program,
            totalFee,
            registrationFee,
            balanceFee: new Prisma.Decimal(balanceFee),
            status: AdmissionStatus.DOCUMENTS_PENDING,
            notes:
              "Admission created from approved admission application.",
          },
          include: {
            course: true,
            lead: true,
            payments: true,
          },
        });

        const payment = await tx.payment.create({
          data: {
            admissionId: admission.id,
            amount: registrationPayment.amount,
            type: PaymentType.REGISTRATION_FEE,
            mode: registrationPayment.mode,
            transactionId: registrationPayment.transactionId,
            status: PaymentStatus.VERIFIED,
            paymentDate:
              registrationPayment.verifiedAt ??
              registrationPayment.submittedAt,
            verifiedAt:
              registrationPayment.verifiedAt ??
              new Date(),
            proofUrl: registrationPayment.proofUrl,
            notes:
              registrationPayment.notes ??
              "Migrated from verified registration payment.",
          },
        });

        await tx.applicationAuditEvent.create({
          data: {
            applicationId: application.id,
            eventType: "ADMISSION_CREATED",
            fromStatus: application.status,
            toStatus: application.status,
            actorId: session.user.id,
            actorType: "ADMIN",
            description:
              `Admission ${admission.admissionNo} created from approved application.`,
            metadata: {
              admissionId: admission.id,
              admissionNo: admission.admissionNo,
              paymentId: payment.id,
              registrationPaymentId: registrationPayment.id,
            },
          },
        });

        await tx.leadActivity.create({
          data: {
            leadId: application.leadId!,
            type: LeadActivityType.STATUS_CHANGED,
            title: "Admission created",
            description:
              `Admission ${admission.admissionNo} created from approved application ${application.applicationNo}.`,
            metadata: {
              applicationId: application.id,
              applicationNo: application.applicationNo,
              admissionId: admission.id,
              admissionNo: admission.admissionNo,
              paymentId: payment.id,
            },
            createdBy: session.user.id,
          },
        });

        await tx.lead.update({
          where: { id: application.leadId! },
          data: {
            currentStatus: "DOCUMENTS_PENDING",
          },
        });

        return {
          alreadyExists: false,
          admission,
          payment,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    /*
     * The admission/payment transaction is complete.
     * Receipt generation follows the same architecture already used
     * by the existing verified-payment workflow.
     */
    if (result.alreadyExists) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "Admission already exists for this application.",
        admission: result.admission,
      });
    }

    let receipt = null;

    if (result.payment) {
      const receiptNumber =
        `TSH-RCP-${new Date().getFullYear()}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`;

      try {
        receipt = await prisma.receipt.create({
          data: {
            receiptNumber,
            paymentId: result.payment.id,
            issuedBy: session.user.id,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          receipt = await prisma.receipt.findUnique({
            where: {
              paymentId: result.payment.id,
            },
          });
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      message: "Admission created successfully.",
      admission: result.admission,
      payment: result.payment,
      receipt,
    });
  } catch (error) {
    console.error(
      "POST /api/admission-applications/[id]/admission error:",
      error,
    );

    if (error instanceof Error) {
      return errorResponse(
        error.message || "Failed to create admission.",
        409,
      );
    }

    return errorResponse(
      "Failed to create admission.",
      500,
    );
  }
}

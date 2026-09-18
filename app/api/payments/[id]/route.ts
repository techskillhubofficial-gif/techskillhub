import { NextResponse } from "next/server";
import {
  AdmissionStatus,
  PaymentMode,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

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

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    typeof value === "string" &&
    Object.values(PaymentStatus).includes(value as PaymentStatus)
  );
}

function isPaymentType(value: unknown): value is PaymentType {
  return (
    typeof value === "string" &&
    Object.values(PaymentType).includes(value as PaymentType)
  );
}

function isPaymentMode(value: unknown): value is PaymentMode {
  return (
    typeof value === "string" &&
    Object.values(PaymentMode).includes(value as PaymentMode)
  );
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
) {
  const parsed = Number.parseInt(value || "", 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function cleanString(
  value: unknown,
  maxLength = 500,
) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function money(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString(
    "en-IN",
  )}`;
}

function getVerifiedAmount(
  payments: Array<{
    amount: number;
    status: PaymentStatus;
  }>,
) {
  return payments
    .filter(
      (payment) =>
        payment.status === PaymentStatus.VERIFIED,
    )
    .reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
}

function getPendingAmount(
  payments: Array<{
    amount: number;
    status: PaymentStatus;
  }>,
) {
  return payments
    .filter(
      (payment) =>
        payment.status === PaymentStatus.PENDING,
    )
    .reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
}

/* -------------------------------------------------------------------------- */
/* GET PAYMENT LIST                                                           */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = cleanString(
      searchParams.get("search"),
      100,
    );

    const status = cleanString(
      searchParams.get("status"),
      50,
    );

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
    );

    const pageSize = Math.min(
      parsePositiveInteger(
        searchParams.get("pageSize"),
        DEFAULT_PAGE_SIZE,
      ),
      MAX_PAGE_SIZE,
    );

    if (status && !isPaymentStatus(status)) {
      return errorResponse(
        "Invalid payment status.",
        400,
      );
    }

    const where: Prisma.PaymentWhereInput = {};

    if (isPaymentStatus(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          transactionId: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          admission: {
            admissionNo: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          admission: {
            studentName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          admission: {
            studentEmail: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          admission: {
            program: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [
      payments,
      total,
      aggregateStats,
    ] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: [
          { paymentDate: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          admission: {
            select: {
              id: true,
              admissionNo: true,
              studentName: true,
              studentEmail: true,
              studentPhone: true,
              program: true,
              totalFee: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receipt: {
            select: {
              id: true,
              receiptNumber: true,
              issuedAt: true,
            },
          },
        },
      }),

      prisma.payment.count({
        where,
      }),

      Promise.all([
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.PENDING,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),

        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.VERIFIED,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),

        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.FAILED,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),

        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.REFUNDED,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),

        prisma.payment.aggregate({
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
      ]),
    ]);

    const [
      pendingPayments,
      verifiedPayments,
      failedPayments,
      refundedPayments,
      allPayments,
    ] = aggregateStats;

    const totalRecorded =
      allPayments._sum.amount || 0;

    const verifiedAmount =
      verifiedPayments._sum.amount || 0;

    const pendingAmount =
      pendingPayments._sum.amount || 0;

    const failedAmount =
      failedPayments._sum.amount || 0;

    const refundedAmount =
      refundedPayments._sum.amount || 0;

    return NextResponse.json({
      success: true,
      data: payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(
        total / pageSize,
      ),
      stats: {
        totalPayments:
          allPayments._count._all,
        totalRecorded,
        pending:
          pendingPayments._count._all,
        pendingAmount,
        verified:
          verifiedPayments._count._all,
        verifiedAmount,
        failed:
          failedPayments._count._all,
        failedAmount,
        refunded:
          refundedPayments._count._all,
        refundedAmount,
        netVerifiedAmount:
          verifiedAmount - refundedAmount,
      },
    });
  } catch (error) {
    console.error(
      "GET Payments Error:",
      error,
    );

    return errorResponse(
      "Failed to load payments.",
      500,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* POST PAYMENT                                                               */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return errorResponse(
        "Request body must contain valid JSON.",
        400,
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return errorResponse(
        "Invalid payment request.",
        400,
      );
    }

    const payload =
      body as Record<string, unknown>;

    const admissionId = cleanString(
      payload.admissionId,
      100,
    );

    const rawAmount =
      typeof payload.amount === "number" ||
      typeof payload.amount === "string"
        ? Number(payload.amount)
        : NaN;

    const type = cleanString(
      payload.type,
      50,
    );

    const mode = cleanString(
      payload.mode,
      50,
    );

    const transactionId = cleanString(
      payload.transactionId,
      150,
    );

    const proofUrl = cleanString(
      payload.proofUrl,
      1000,
    );

    const notes = cleanString(
      payload.notes,
      2000,
    );

    if (!admissionId) {
      return errorResponse(
        "Admission ID is required.",
        400,
      );
    }

    if (
      !Number.isFinite(rawAmount) ||
      rawAmount <= 0
    ) {
      return errorResponse(
        "Payment amount must be greater than zero.",
        400,
      );
    }

    const amount = Math.round(rawAmount);

    if (!isPaymentType(type)) {
      return errorResponse(
        "Invalid payment type.",
        400,
      );
    }

    if (!isPaymentMode(mode)) {
      return errorResponse(
        "Invalid payment mode.",
        400,
      );
    }

    if (
      transactionId.length > 0 &&
      transactionId.length < 3
    ) {
      return errorResponse(
        "Transaction ID must contain at least 3 characters.",
        400,
      );
    }

    const admission =
      await prisma.admission.findUnique({
        where: {
          id: admissionId,
        },
        select: {
          id: true,
          admissionNo: true,
          studentName: true,
          userId: true,
          totalFee: true,
          registrationFee: true,
          status: true,
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              transactionId: true,
            },
          },
        },
      });

    if (!admission) {
      return errorResponse(
        "Admission not found.",
        404,
      );
    }

    if (
      admission.status ===
      AdmissionStatus.REJECTED
    ) {
      return errorResponse(
        "Payments cannot be recorded against a rejected admission.",
        409,
      );
    }

    /*
     * IMPORTANT:
     * Enrolled students may still have installments/balances.
     * Therefore payment recording is intentionally NOT blocked
     * merely because an admission is ENROLLED.
     */

    const verifiedAmount =
      getVerifiedAmount(
        admission.payments,
      );

    const pendingAmount =
      getPendingAmount(
        admission.payments,
      );

    const remainingBalance =
      Math.max(
        0,
        admission.totalFee -
          verifiedAmount -
          pendingAmount,
      );

    if (remainingBalance <= 0) {
      return errorResponse(
        "The admission has no remaining balance available for a new payment.",
        409,
        {
          totalFee:
            admission.totalFee,
          verifiedAmount,
          pendingAmount,
          remainingBalance: 0,
        },
      );
    }

    if (amount > remainingBalance) {
      return errorResponse(
        `Payment exceeds the remaining balance of ${money(
          remainingBalance,
        )}.`,
        409,
        {
          totalFee:
            admission.totalFee,
          verifiedAmount,
          pendingAmount,
          remainingBalance,
          requestedAmount: amount,
        },
      );
    }

    if (transactionId) {
      const duplicate =
        await prisma.payment.findFirst({
          where: {
            transactionId,
          },
          select: {
            id: true,
            status: true,
            admissionId: true,
          },
        });

      if (duplicate) {
        return errorResponse(
          "A payment with this transaction ID already exists.",
          409,
          {
            existingPaymentId:
              duplicate.id,
            existingStatus:
              duplicate.status,
            existingAdmissionId:
              duplicate.admissionId,
          },
        );
      }
    }

    const payment =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.payment.create({
              data: {
                admissionId,
                userId:
                  admission.userId ?? null,
                amount,
                type,
                mode,
                transactionId:
                  transactionId || null,
                proofUrl:
                  proofUrl || null,
                notes:
                  notes || null,
                status:
                  PaymentStatus.PENDING,
              },
              include: {
                admission: {
                  select: {
                    id: true,
                    admissionNo: true,
                    studentName: true,
                    program: true,
                    totalFee: true,
                    status: true,
                  },
                },
              },
            });

          /*
           * A new payment must be verified before it can
           * contribute to the paid balance.
           */
          if (
            admission.status ===
              AdmissionStatus.PENDING ||
            admission.status ===
              AdmissionStatus.REJECTED
          ) {
            await tx.admission.update({
              where: {
                id: admissionId,
              },
              data: {
                status:
                  AdmissionStatus.PAYMENT_VERIFICATION,
              },
            });
          }

          return created;
        },
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment recorded and sent for verification.",
        payment,
        financials: {
          totalFee:
            admission.totalFee,
          verifiedAmount,
          pendingAmount:
            pendingAmount + amount,
          remainingBalance:
            remainingBalance - amount,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST Payment Error:",
      error,
    );

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "This payment conflicts with an existing unique record.",
        409,
      );
    }

    return errorResponse(
      "Failed to record payment.",
      500,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PATCH PAYMENT — VERIFY / REJECT / REFUND                                   */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse(
        "You must be signed in to update payments.",
        401,
      );
    }

    const { id } = await context.params;
    const paymentId = cleanString(id, 100);

    if (!paymentId) {
      return errorResponse(
        "Payment ID is required.",
        400,
      );
    }

    let body: unknown = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (!body || typeof body !== "object") {
      return errorResponse(
        "Invalid payment update request.",
        400,
      );
    }

    const payload = body as Record<string, unknown>;

    const rawAction = cleanString(
      payload.action,
      50,
    ).toUpperCase();

    const rawStatus = cleanString(
      payload.status,
      50,
    ).toUpperCase();

    let action:
      | "VERIFY"
      | "REJECT"
      | "REFUND"
      | null = null;

    if (rawAction === "VERIFY") {
      action = "VERIFY";
    } else if (rawAction === "REJECT") {
      action = "REJECT";
    } else if (rawAction === "REFUND") {
      action = "REFUND";
    } else if (rawStatus === PaymentStatus.VERIFIED) {
      action = "VERIFY";
    } else if (rawStatus === PaymentStatus.FAILED) {
      action = "REJECT";
    } else if (rawStatus === PaymentStatus.REFUNDED) {
      action = "REFUND";
    }

    if (!action) {
      return errorResponse(
        "A valid payment action is required: VERIFY, REJECT, or REFUND.",
        400,
      );
    }

    const note = cleanString(
      payload.note ??
        payload.notes ??
        payload.reason,
      2000,
    );

    /*
     * IMPORTANT:
     * Do NOT wrap payment verification, receipt generation and
     * admission progression in one long interactive transaction.
     *
     * Receipt creation can involve a second database operation and
     * previously caused Prisma transaction timeouts (P2028).
     *
     * We therefore make each operation short and idempotent:
     *
     * VERIFY
     * 1. Read payment.
     * 2. Mark payment VERIFIED.
     * 3. Create its receipt if it does not already have one.
     * 4. Move PAYMENT_VERIFICATION -> DOCUMENTS_PENDING.
     *
     * If the browser retries after step 2, the already-verified
     * payment is handled safely instead of failing because it is
     * no longer PENDING.
     */

    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        admission: {
          select: {
            id: true,
            admissionNo: true,
            studentName: true,
            studentEmail: true,
            program: true,
            totalFee: true,
            status: true,
          },
        },
        receipt: true,
      },
    });

    if (!payment) {
      throw new PaymentWorkflowError(
        "Payment not found.",
        404,
      );
    }

    if (action === "VERIFY") {
      /*
       * Idempotency:
       * A double-click or browser retry after a successful database
       * update must not turn into a false error.
       */
      if (payment.status !== PaymentStatus.PENDING &&
          payment.status !== PaymentStatus.VERIFIED) {
        throw new PaymentWorkflowError(
          `Only pending payments can be verified. This payment is currently ${payment.status}.`,
          409,
        );
      }

      let updatedPayment = payment;

      if (payment.status === PaymentStatus.PENDING) {
        updatedPayment = await prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: PaymentStatus.VERIFIED,
            verifiedAt: new Date(),
            ...(note ? { notes: note } : {}),
          },
          include: {
            admission: {
              select: {
                id: true,
                admissionNo: true,
                studentName: true,
                studentEmail: true,
                program: true,
                totalFee: true,
                status: true,
              },
            },
            receipt: true,
          },
        });
      }

      /*
       * Every verified payment should have one receipt.
       *
       * Receipt creation is deliberately outside the payment update
       * transaction so a receipt-generation delay cannot roll back
       * the verified payment.
       */
      let receipt = updatedPayment.receipt;

      if (!receipt) {
        const receiptNumber =
          `TSH-RCP-${new Date().getFullYear()}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`;

        try {
          receipt = await prisma.receipt.create({
            data: {
              receiptNumber,
              paymentId: updatedPayment.id,
              issuedBy: session.user.id,
            },
          });
        } catch (error) {
          /*
           * If another request created the receipt between our
           * read and create, fetch that receipt instead.
           */
          if (
            error instanceof
              Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            receipt = await prisma.receipt.findUnique({
              where: {
                paymentId: updatedPayment.id,
              },
            });

            if (!receipt) {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      /*
       * A verified payment unlocks the document stage only when
       * the admission is currently waiting for payment verification.
       *
       * APPROVED and ENROLLED admissions are never moved backwards.
       */
      let admissionStatus =
        updatedPayment.admission.status;

      if (
        updatedPayment.admission.status ===
        AdmissionStatus.PAYMENT_VERIFICATION
      ) {
        const updatedAdmission =
          await prisma.admission.update({
            where: {
              id: updatedPayment.admissionId,
            },
            data: {
              status:
                AdmissionStatus.DOCUMENTS_PENDING,
            },
            select: {
              status: true,
            },
          });

        admissionStatus =
          updatedAdmission.status;
      }

      const verifiedPayments =
        await prisma.payment.findMany({
          where: {
            admissionId:
              updatedPayment.admissionId,
            status:
              PaymentStatus.VERIFIED,
          },
          select: {
            amount: true,
          },
        });

      const verifiedAmount =
        verifiedPayments.reduce(
          (sum, item) => sum + item.amount,
          0,
        );

      const remainingBalance = Math.max(
        0,
        updatedPayment.admission.totalFee -
          verifiedAmount,
      );

      return NextResponse.json({
        success: true,
        message:
          payment.status === PaymentStatus.VERIFIED
            ? "Payment is already verified. Receipt confirmed."
            : "Payment verified successfully. Receipt generated.",
        data: {
          action,
          payment: updatedPayment,
          receipt,
          admissionStatus,
          verifiedAmount,
          remainingBalance,
        },
      });
    }

    if (action === "REJECT") {
      if (payment.status !== PaymentStatus.PENDING) {
        throw new PaymentWorkflowError(
          `Only pending payments can be rejected. This payment is currently ${payment.status}.`,
          409,
        );
      }

      const rejectionNote =
        note ||
        "Payment was rejected during verification.";

      const updatedPayment =
        await prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: PaymentStatus.FAILED,
            verifiedAt: null,
            notes: rejectionNote,
          },
          include: {
            admission: {
              select: {
                id: true,
                admissionNo: true,
                studentName: true,
                studentEmail: true,
                program: true,
                totalFee: true,
                status: true,
              },
            },
            receipt: true,
          },
        });

      return NextResponse.json({
        success: true,
        message: "Payment rejected successfully.",
        data: {
          action,
          payment: updatedPayment,
          receipt: updatedPayment.receipt,
          admissionStatus:
            payment.admission.status,
          verifiedAmount:
            getVerifiedAmount([]),
          remainingBalance:
            payment.admission.totalFee,
        },
      });
    }

    /*
     * REFUND
     */
    if (payment.status !== PaymentStatus.VERIFIED) {
      throw new PaymentWorkflowError(
        `Only verified payments can be refunded. This payment is currently ${payment.status}.`,
        409,
      );
    }

    const refundNote =
      note || "Payment refunded.";

    const updatedPayment =
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.REFUNDED,
          notes: refundNote,
        },
        include: {
          admission: {
            select: {
              id: true,
              admissionNo: true,
              studentName: true,
              studentEmail: true,
              program: true,
              totalFee: true,
              status: true,
            },
          },
          receipt: true,
        },
      });

    const remainingPayments =
      await prisma.payment.findMany({
        where: {
          admissionId:
            payment.admissionId,
          status:
            PaymentStatus.VERIFIED,
          id: {
            not: payment.id,
          },
        },
        select: {
          amount: true,
        },
      });

    const verifiedAmount =
      remainingPayments.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

    return NextResponse.json({
      success: true,
      message: "Payment refunded successfully.",
      data: {
        action,
        payment: updatedPayment,
        receipt: updatedPayment.receipt,
        admissionStatus:
          payment.admission.status,
        verifiedAmount,
        remainingBalance: Math.max(
          0,
          payment.admission.totalFee -
            verifiedAmount,
        ),
      },
    });
  } catch (error) {
    if (error instanceof PaymentWorkflowError) {
      return errorResponse(
        error.message,
        error.status,
      );
    }

    console.error(
      "PATCH Payment Error:",
      error,
    );

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        return errorResponse(
          "A receipt or payment record with the same unique identifier already exists.",
          409,
        );
      }

      if (error.code === "P2025") {
        return errorResponse(
          "The requested payment record could not be found.",
          404,
        );
      }
    }

    return errorResponse(
      "Failed to update payment.",
      500,
      process.env.NODE_ENV === "development"
        ? {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          }
        : undefined,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* WORKFLOW ERROR                                                             */
/* -------------------------------------------------------------------------- */

class PaymentWorkflowError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400,
  ) {
    super(message);
    this.name =
      "PaymentWorkflowError";
    this.status = status;
  }
}
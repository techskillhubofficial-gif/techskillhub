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

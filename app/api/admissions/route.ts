import { NextResponse } from "next/server";
import {
  AdmissionStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_REGISTRATION_FEE = 5000;

function errorResponse(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details !== undefined
        ? { details }
        : {}),
    },
    { status },
  );
}

function clean(
  value: unknown,
  maxLength = 500,
) {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed.slice(
        0,
        maxLength,
      )
    : undefined;
}

function positivePage(
  value: string | null,
) {
  const parsed =
    Number.parseInt(
      value || "",
      10,
    );

  return Number.isFinite(
    parsed,
  ) && parsed > 0
    ? parsed
    : 1;
}

function pageSize(
  value: string | null,
) {
  const parsed =
    Number.parseInt(
      value || "",
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <= 0
  ) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    parsed,
    MAX_PAGE_SIZE,
  );
}

function isAdmissionStatus(
  value: unknown,
): value is AdmissionStatus {
  return (
    typeof value === "string" &&
    Object.values(
      AdmissionStatus,
    ).includes(
      value as AdmissionStatus,
    )
  );
}

function parseMoney(
  value: unknown,
) {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return NaN;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return NaN;
  }

  return Math.round(parsed);
}

function formatMoney(
  value: number,
) {
  return `₹${Math.max(
    0,
    value,
  ).toLocaleString(
    "en-IN",
  )}`;
}

function makeAdmissionNumber() {
  const now =
    new Date();

  const date = [
    now.getFullYear(),
    String(
      now.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      now.getDate(),
    ).padStart(2, "0"),
  ].join("");

  const random =
    Math.floor(
      1000 +
        Math.random() *
          9000,
    );

  return `TSH-ADM-${date}-${random}`;
}

async function getUniqueAdmissionNumber() {
  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const admissionNo =
      makeAdmissionNumber();

    const existing =
      await prisma.admission.findUnique(
        {
          where: {
            admissionNo,
          },
          select: {
            id: true,
          },
        },
      );

    if (!existing) {
      return admissionNo;
    }
  }

  throw new Error(
    "Unable to generate a unique admission number.",
  );
}

export async function GET(
  req: Request,
) {
  try {
    const {
      searchParams,
    } = new URL(
      req.url,
    );

    const search =
      clean(
        searchParams.get(
          "search",
        ),
        100,
      ) || "";

    const status =
      clean(
        searchParams.get(
          "status",
        ),
        50,
      ) || "";

    const page =
      positivePage(
        searchParams.get(
          "page",
        ),
      );

    const size =
      pageSize(
        searchParams.get(
          "pageSize",
        ),
      );

    if (
      status &&
      !isAdmissionStatus(
        status,
      )
    ) {
      return errorResponse(
        "Invalid admission status.",
        400,
      );
    }

    const where: Prisma.AdmissionWhereInput =
      {};

    if (
      isAdmissionStatus(
        status,
      )
    ) {
      where.status =
        status;
    }

    if (search) {
      where.OR = [
        {
          admissionNo: {
            contains:
              search,
            mode: "insensitive",
          },
        },
        {
          studentName: {
            contains:
              search,
            mode: "insensitive",
          },
        },
        {
          studentEmail: {
            contains:
              search,
            mode: "insensitive",
          },
        },
        {
          studentPhone: {
            contains:
              search,
            mode: "insensitive",
          },
        },
        {
          program: {
            contains:
              search,
            mode: "insensitive",
          },
        },
        {
          batchName: {
            contains:
              search,
            mode: "insensitive",
          },
        },
        {
          counsellor: {
            contains:
              search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [
      admissions,
      total,
      totalCount,
      pendingCount,
      paymentVerificationCount,
      documentsPendingCount,
      approvedCount,
      rejectedCount,
      enrolledCount,
    ] =
      await Promise.all([
        prisma.admission.findMany(
          {
            where,
            orderBy: [
              {
                createdAt:
                  "desc",
              },
              {
                id: "desc",
              },
            ],
            skip:
              (page - 1) *
              size,
            take: size,
            include: {
              lead: {
                select: {
                  id: true,
                  fullName:
                    true,
                  email: true,
                  phone: true,
                },
              },

              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },

              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  price: true,
                  duration:
                    true,
                  level: true,
                  published:
                    true,
                },
              },

              payments: {
                orderBy: [
                  {
                    paymentDate:
                      "desc",
                  },
                  {
                    createdAt:
                      "desc",
                  },
                ],
                select: {
                  id: true,
                  amount: true,
                  type: true,
                  mode: true,
                  transactionId:
                    true,
                  status: true,
                  paymentDate:
                    true,
                  verifiedAt:
                    true,
                  proofUrl:
                    true,
                  notes: true,
                  receipt: {
                    select: {
                      id: true,
                      receiptNumber:
                        true,
                      issuedAt:
                        true,
                    },
                  },
                },
              },

              _count: {
                select: {
                  payments: true,
                },
              },
            },
          },
        ),

        prisma.admission.count({
          where,
        }),

        prisma.admission.count(),

        prisma.admission.count(
          {
            where: {
              status:
                AdmissionStatus.PENDING,
            },
          },
        ),

        prisma.admission.count(
          {
            where: {
              status:
                AdmissionStatus.PAYMENT_VERIFICATION,
            },
          },
        ),

        prisma.admission.count(
          {
            where: {
              status:
                AdmissionStatus.DOCUMENTS_PENDING,
            },
          },
        ),

        prisma.admission.count(
          {
            where: {
              status:
                AdmissionStatus.APPROVED,
            },
          },
        ),

        prisma.admission.count(
          {
            where: {
              status:
                AdmissionStatus.REJECTED,
            },
          },
        ),

        prisma.admission.count(
          {
            where: {
              status:
                AdmissionStatus.ENROLLED,
            },
          },
        ),
      ]);

    const enrichedAdmissions =
      admissions.map(
        (admission) => {
          const verifiedPaid =
            admission.payments
              .filter(
                (
                  payment,
                ) =>
                  payment.status ===
                  PaymentStatus.VERIFIED,
              )
              .reduce(
                (
                  sum,
                  payment,
                ) =>
                  sum +
                  payment.amount,
                0,
              );

          const pendingPayments =
            admission.payments
              .filter(
                (
                  payment,
                ) =>
                  payment.status ===
                  PaymentStatus.PENDING,
              )
              .reduce(
                (
                  sum,
                  payment,
                ) =>
                  sum +
                  payment.amount,
                0,
              );

          const failedPayments =
            admission.payments
              .filter(
                (
                  payment,
                ) =>
                  payment.status ===
                  PaymentStatus.FAILED,
              )
              .reduce(
                (
                  sum,
                  payment,
                ) =>
                  sum +
                  payment.amount,
                0,
              );

          const refundedPayments =
            admission.payments
              .filter(
                (
                  payment,
                ) =>
                  payment.status ===
                  PaymentStatus.REFUNDED,
              )
              .reduce(
                (
                  sum,
                  payment,
                ) =>
                  sum +
                  payment.amount,
                0,
              );

          const balance =
            Math.max(
              admission.totalFee -
                verifiedPaid +
                refundedPayments,
              0,
            );

          return {
            ...admission,

            financials: {
              totalFee:
                admission.totalFee,

              registrationFee:
                admission.registrationFee,

              verifiedPaid,

              pendingPayments,

              failedPayments,

              refundedPayments,

              balance,

              paymentCount:
                admission
                  ._count
                  .payments,

              isFullyPaid:
                balance === 0,
            },
          };
        },
      );

    return NextResponse.json({
      success: true,
      data: enrichedAdmissions,
      total,
      page,
      pageSize: size,
      totalPages:
        Math.ceil(
          total / size,
        ),
      stats: {
        total:
          totalCount,

        pending:
          pendingCount,

        paymentVerification:
          paymentVerificationCount,

        documentsPending:
          documentsPendingCount,

        approved:
          approvedCount,

        rejected:
          rejectedCount,

        enrolled:
          enrolledCount,
      },
    });
  } catch (error) {
    console.error(
      "GET Admissions Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admissions.",
        debug:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
) {
  try {
    let body: unknown;

    try {
      body =
        await req.json();
    } catch {
      return errorResponse(
        "Request body must contain valid JSON.",
        400,
      );
    }

    if (
      !body ||
      typeof body !==
        "object" ||
      Array.isArray(body)
    ) {
      return errorResponse(
        "Invalid admission request.",
        400,
      );
    }

    const payload =
      body as Record<
        string,
        unknown
      >;

    const studentName =
      clean(
        payload.studentName,
        150,
      );

    const studentEmail =
      clean(
        payload.studentEmail,
        254,
      )?.toLowerCase();

    const studentPhone =
      clean(
        payload.studentPhone,
        30,
      );

    const program =
      clean(
        payload.program,
        200,
      );

    const totalFee =
      parseMoney(
        payload.totalFee,
      );

    const registrationFee =
      payload.registrationFee ===
      undefined
        ? DEFAULT_REGISTRATION_FEE
        : parseMoney(
            payload.registrationFee,
          );

    const leadId =
      clean(
        payload.leadId,
        100,
      );

    const courseId =
      clean(
        payload.courseId,
        100,
      );

    const batchName =
      clean(
        payload.batchName,
        150,
      );

    const counsellor =
      clean(
        payload.counsellor,
        150,
      );

    const notes =
      clean(
        payload.notes,
        2000,
      );

    if (
      !studentName ||
      !studentEmail ||
      !studentPhone ||
      !program
    ) {
      return errorResponse(
        "Student name, email, phone and program are required.",
        400,
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        studentEmail,
      )
    ) {
      return errorResponse(
        "Please provide a valid student email address.",
        400,
      );
    }

    if (
      !Number.isSafeInteger(
        totalFee,
      ) ||
      totalFee <= 0
    ) {
      return errorResponse(
        "Total fee must be a positive whole-number amount.",
        400,
      );
    }

    if (
      !Number.isSafeInteger(
        registrationFee,
      ) ||
      registrationFee < 0 ||
      registrationFee >
        totalFee
    ) {
      return errorResponse(
        "Registration fee must be between zero and the total fee.",
        400,
      );
    }

    let resolvedCourse:
      | {
          id: string;
          title: string;
          price: number;
          duration: string;
          level: string;
          published: boolean;
        }
      | null = null;

    if (courseId) {
      resolvedCourse =
        await prisma.course.findUnique(
          {
            where: {
              id: courseId,
            },
            select: {
              id: true,
              title: true,
              price: true,
              duration:
                true,
              level: true,
              published:
                true,
            },
          },
        );

      if (!resolvedCourse) {
        return errorResponse(
          "Selected course does not exist.",
          404,
        );
      }
    }

    if (leadId) {
      const lead =
        await prisma.lead.findUnique(
          {
            where: {
              id: leadId,
            },
            select: {
              id: true,
              fullName:
                true,
              email: true,
              phone: true,
            },
          },
        );

      if (!lead) {
        return errorResponse(
          "Selected lead does not exist.",
          404,
        );
      }
    }

    const admissionNo =
      await getUniqueAdmissionNumber();

    const admission =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.admission.create(
              {
                data: {
                  admissionNo,

                  leadId:
                    leadId ??
                    null,

                  courseId:
                    resolvedCourse?.id ??
                    null,

                  studentName,

                  studentEmail,

                  studentPhone,

                  program,

                  totalFee,

                  registrationFee,

                  batchName:
                    batchName ??
                    null,

                  counsellor:
                    counsellor ??
                    null,

                  notes:
                    notes ??
                    null,

                  status:
                    AdmissionStatus.PENDING,
                },

                include: {
                  lead: {
                    select: {
                      id: true,
                      fullName:
                        true,
                      email: true,
                      phone: true,
                    },
                  },

                  course: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                      price: true,
                      duration:
                        true,
                      level: true,
                    },
                  },

                  payments: true,
                },
              },
            );

          return created;
        },
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Admission created successfully.",

        admission,

        financials: {
          totalFee:
            admission.totalFee,

          registrationFee:
            admission.registrationFee,

          verifiedPaid: 0,

          pendingPayments: 0,

          balance:
            admission.totalFee,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST Admission Error:",
      error,
    );

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "An admission with this admission number already exists. Please try again.",
        409,
      );
    }

    return errorResponse(
      "Failed to create admission.",
      500,
    );
  }
}
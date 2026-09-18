import { NextRequest, NextResponse } from "next/server";
import {
  getServerSession,
} from "next-auth";
import {
  LeadActivityType,
  PaymentMode,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TECHSKILLHUB_REGISTRATION_FEE } from "@/lib/fees";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REGISTRATION_FEE =
  TECHSKILLHUB_REGISTRATION_FEE;

const ALLOWED_PAYMENT_MODES: PaymentMode[] = [
  PaymentMode.UPI,
  PaymentMode.BANK_TRANSFER,
];

function cleanString(
  value: unknown,
  maxLength = 500,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeEmail(
  value: unknown,
): string {
  return cleanString(
    value,
    254,
  ).toLowerCase();
}

function normalizePhone(
  value: unknown,
): string {
  return cleanString(
    value,
    30,
  ).replace(/[^\d+]/g, "");
}

function getClientIp(
  request: NextRequest,
): string | null {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim()
        .slice(0, 100) || null
    );
  }

  const realIp =
    request.headers.get(
      "x-real-ip",
    );

  return realIp
    ? realIp.trim().slice(0, 100)
    : null;
}

function isAllowedPaymentMode(
  value: unknown,
): value is PaymentMode {
  return (
    typeof value === "string" &&
    ALLOWED_PAYMENT_MODES.includes(
      value as PaymentMode,
    )
  );
}

function generateRegistrationNo(): string {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const random =
    Math.floor(
      100000 +
        Math.random() *
          900000,
    );

  return `TSH-REG-${year}-${random}`;
}

async function generateUniqueRegistrationNo(): Promise<string> {
  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    const registrationNo =
      generateRegistrationNo();

    const existing =
      await prisma.registrationPayment.findUnique(
        {
          where: {
            registrationNo,
          },
          select: {
            id: true,
          },
        },
      );

    if (!existing) {
      return registrationNo;
    }
  }

  throw new Error(
    "Unable to generate a unique registration number. Please try again.",
  );
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
/* Create a manual registration payment                                      */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: NextRequest,
) {
  try {
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

    const studentName =
      cleanString(
        body.studentName,
        150,
      );

    const studentEmail =
      normalizeEmail(
        body.studentEmail,
      );

    const studentPhone =
      normalizePhone(
        body.studentPhone,
      );

    const courseId =
      cleanString(
        body.courseId,
        100,
      );

    const leadId =
      cleanString(
        body.leadId,
        100,
      );

    const transactionId =
      cleanString(
        body.transactionId,
        150,
      );

    const proofUrl =
      cleanString(
        body.proofUrl,
        2000,
      );

    const notes =
      cleanString(
        body.notes,
        1000,
      );

    const mode =
      body.mode;

    /* ---------------------------------------------------------------------- */
    /* Validate input                                                         */
    /* ---------------------------------------------------------------------- */

    if (!studentName) {
      return errorResponse(
        "Student name is required.",
      );
    }

    if (!studentEmail) {
      return errorResponse(
        "Student email is required.",
      );
    }

    if (
      !studentEmail.includes("@") ||
      studentEmail.length < 5
    ) {
      return errorResponse(
        "Please provide a valid student email.",
      );
    }

    if (!studentPhone) {
      return errorResponse(
        "Student phone is required.",
      );
    }

    if (!courseId) {
      return errorResponse(
        "Course selection is required.",
      );
    }

    if (
      !isAllowedPaymentMode(
        mode,
      )
    ) {
      return errorResponse(
        "Payment mode must be UPI or BANK_TRANSFER.",
      );
    }

    /*
     * The registration amount is NEVER accepted
     * from the browser.
     *
     * The server controls the amount.
     */
    const amount =
      REGISTRATION_FEE;

    /* ---------------------------------------------------------------------- */
    /* Validate course                                                        */
    /* ---------------------------------------------------------------------- */

    const course =
      await prisma.course.findUnique(
        {
          where: {
            id: courseId,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            published: true,
          },
        },
      );

    if (!course) {
      return errorResponse(
        "Selected course does not exist.",
        404,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Find or validate CRM lead                                              */
    /* ---------------------------------------------------------------------- */

    let lead:
      | {
          id: string;
          fullName: string;
          email: string;
          phone: string;
          currentStatus: string;
          interestedProgram: string;
          status: "NEW" | "CONTACTED" | "QUALIFIED" | "ENROLLED" | "CLOSED";
        }
      | null = null;

    if (leadId) {
      lead =
        await prisma.lead.findUnique(
          {
            where: {
              id: leadId,
            },
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
        );

      if (!lead) {
        return errorResponse(
          "The selected CRM lead does not exist.",
          404,
        );
      }

      /*
       * Never attach a registration to a CRM lead whose identity
       * does not match the applicant submitting the registration.
       *
       * Both email AND phone must match.
       */
      const leadEmail =
        normalizeEmail(lead.email);

      const leadPhone =
        normalizePhone(lead.phone);

      if (
        leadEmail !== studentEmail ||
        leadPhone !== studentPhone
      ) {
        return errorResponse(
          "The selected CRM lead does not match the student's email and phone.",
          409,
        );
      }
    } else {
      /*
       * Reuse an existing CRM lead only when BOTH email and phone
       * identify the same person.
       *
       * We intentionally do NOT use email OR phone here because
       * either value can belong to another existing lead.
       */
      lead =
        await prisma.lead.findFirst(
          {
            where: {
              AND: [
                {
                  email: {
                    equals:
                      studentEmail,
                    mode: "insensitive",
                  },
                },
                {
                  phone:
                    studentPhone,
                },
              ],
            },
            orderBy: {
              createdAt: "desc",
            },
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
        );

      if (!lead) {
        lead =
          await prisma.lead.create(
            {
              data: {
                fullName:
                  studentName,

                email:
                  studentEmail,

                phone:
                  studentPhone,

                currentStatus:
                  "REGISTRATION_PENDING",

                interestedProgram:
                  course.title,

                preferredContact:
                  "WHATSAPP",

                source:
                  "REGISTRATION",

                status:
                  "NEW",
              },
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
          );

        await prisma.leadActivity.create(
          {
            data: {
              leadId:
                lead.id,

              type:
                LeadActivityType.LEAD_CREATED,

              title:
                "Registration lead created",

              description:
                "A CRM lead was created when the student submitted registration payment information.",

              metadata: {
                source:
                  "REGISTRATION",

                courseId:
                  course.id,

                courseTitle:
                  course.title,

                registrationFee:
                  amount,
              },
            },
          },
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Prevent duplicate active registration payments                         */
    /* ---------------------------------------------------------------------- */

    const existingPayment =
      await prisma.registrationPayment.findFirst(
        {
          where: {
            OR: [
              {
                leadId:
                  lead.id,
                courseId:
                  course.id,
              },
              {
                studentEmail,
                courseId:
                  course.id,
              },
              {
                studentPhone,
                courseId:
                  course.id,
              },
            ],

            status: {
              in: [
                PaymentStatus.PENDING,
                PaymentStatus.VERIFIED,
              ],
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            registrationNo: true,
            status: true,
            amount: true,
            mode: true,
            transactionId: true,
            proofUrl: true,
            submittedAt: true,
          },
        },
      );

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,

          message:
            existingPayment.status ===
            PaymentStatus.VERIFIED
              ? "Registration payment has already been verified for this student and course."
              : "A registration payment is already pending verification for this student and course.",

          existingPayment,
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Prevent duplicate transaction IDs                                      */
    /* ---------------------------------------------------------------------- */

    if (transactionId) {
      const duplicateTransaction =
        await prisma.registrationPayment.findUnique(
          {
            where: {
              transactionId,
            },
            select: {
              id: true,
              registrationNo: true,
              status: true,
            },
          },
        );

      if (duplicateTransaction) {
        return NextResponse.json(
          {
            success: false,

            message:
              "This transaction ID has already been submitted.",

            existingPayment:
              duplicateTransaction,
          },
          {
            status: 409,
          },
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Generate registration number                                           */
    /* ---------------------------------------------------------------------- */

    const registrationNo =
      await generateUniqueRegistrationNo();

    const clientIp =
      getClientIp(
        request,
      );

    /* ---------------------------------------------------------------------- */
    /* Create registration payment                                            */
    /* ---------------------------------------------------------------------- */

    const payment =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.registrationPayment.create(
              {
                data: {
                  registrationNo,

                  leadId:
                    lead.id,

                  courseId:
                    course.id,

                  studentName,

                  studentEmail,

                  studentPhone,

                  amount,

                  mode,

                  transactionId:
                    transactionId ||
                    null,

                  status:
                    PaymentStatus.PENDING,

                  proofUrl:
                    proofUrl ||
                    null,

                  notes:
                    notes ||
                    null,
                },

                select: {
                  id: true,
                  registrationNo: true,
                  leadId: true,
                  courseId: true,
                  studentName: true,
                  studentEmail: true,
                  studentPhone: true,
                  amount: true,
                  mode: true,
                  transactionId: true,
                  status: true,
                  proofUrl: true,
                  notes: true,
                  submittedAt: true,
                  createdAt: true,
                },
              },
            );

          await tx.lead.update(
            {
              where: {
                id: lead.id,
              },

              data: {
                currentStatus:
                  "REGISTRATION_PENDING",

                interestedProgram:
                  course.title,
              },
            },
          );

          await tx.leadActivity.create(
            {
              data: {
                leadId:
                  lead.id,

                type:
                  LeadActivityType.UPDATED,

                title:
                  "Registration payment submitted",

                description:
                  "A ₹5,000 manual registration payment was submitted and is awaiting admin verification.",

                metadata: {
                  registrationPaymentId:
                    created.id,

                  registrationNo,

                  courseId:
                    course.id,

                  courseTitle:
                    course.title,

                  amount,

                  paymentMode:
                    mode,

                  transactionId:
                    transactionId ||
                    null,

                  proofProvided:
                    Boolean(
                      proofUrl,
                    ),

                  clientIp,
                },
              },
            },
          );

          return created;
        },
      );

    /* ---------------------------------------------------------------------- */
    /* Response                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        registrationPayment: {
          id: payment.id,
          registrationNo: payment.registrationNo,
          amount: payment.amount,
          status: payment.status,
          mode: payment.mode,
          course: {
            id: course.id,
            title: course.title,
          },
        },

        message:
          "Registration payment submitted successfully. It is now pending admin verification.",

        data: {
          payment,

          course: {
            id:
              course.id,

            title:
              course.title,

            slug:
              course.slug,

            price:
              course.price,
          },

          registrationFee:
            amount,

          status:
            PaymentStatus.PENDING,

          nextStep:
            "TechSkillHub will verify the submitted payment details and payment proof.",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/registration-payments error:",
      error,
    );

    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (
        error.code ===
        "P2002"
      ) {
        return errorResponse(
          "A registration payment with the same unique information already exists.",
          409,
        );
      }
    }

    return errorResponse(
      "Failed to create registration payment.",
      500,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET                                                                       */
/* Admin registration-payment list                                            */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: NextRequest,
) {
  try {
    const session =
      await getServerSession(
        authOptions,
      );

    if (
      !session?.user?.id
    ) {
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

    const {
      searchParams,
    } = new URL(
      request.url,
    );

    const search =
      cleanString(
        searchParams.get(
          "search",
        ),
        100,
      );

    const status =
      cleanString(
        searchParams.get(
          "status",
        ),
        50,
      );

    const requestedPage =
      Number.parseInt(
        searchParams.get(
          "page",
        ) || "1",
        10,
      );

    const requestedPageSize =
      Number.parseInt(
        searchParams.get(
          "pageSize",
        ) || "25",
        10,
      );

    const page =
      Number.isFinite(
        requestedPage,
      ) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const pageSize =
      Number.isFinite(
        requestedPageSize,
      ) &&
      requestedPageSize > 0
        ? Math.min(
            requestedPageSize,
            100,
          )
        : 25;

    const where: Prisma.RegistrationPaymentWhereInput =
      {};

    if (
      status &&
      Object.values(
        PaymentStatus,
      ).includes(
        status as PaymentStatus,
      )
    ) {
      where.status =
        status as PaymentStatus;
    }

    if (search) {
      where.OR = [
        {
          studentName: {
            contains:
              search,
            mode:
              "insensitive",
          },
        },
        {
          studentEmail: {
            contains:
              search,
            mode:
              "insensitive",
          },
        },
        {
          studentPhone: {
            contains:
              search,
            mode:
              "insensitive",
          },
        },
        {
          registrationNo: {
            contains:
              search,
            mode:
              "insensitive",
          },
        },
        {
          transactionId: {
            contains:
              search,
            mode:
              "insensitive",
          },
        },
      ];
    }

    const skip =
      (page - 1) *
      pageSize;

    const [
      payments,
      total,
    ] =
      await prisma.$transaction(
        [
          prisma.registrationPayment.findMany(
            {
              where,

              orderBy: {
                submittedAt:
                  "desc",
              },

              skip,

              take:
                pageSize,

              select: {
                id: true,
                registrationNo:
                  true,
                studentName:
                  true,
                studentEmail:
                  true,
                studentPhone:
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
                notes:
                  true,
                rejectionReason:
                  true,
                submittedAt:
                  true,
                verifiedAt:
                  true,
                verifiedBy:
                  true,
                createdAt:
                  true,
                updatedAt:
                  true,

                lead: {
                  select: {
                    id:
                      true,
                    fullName:
                      true,
                    email:
                      true,
                    phone:
                      true,
                    currentStatus:
                      true,
                    status:
                      true,
                  },
                },

                course: {
                  select: {
                    id:
                      true,
                    title:
                      true,
                    slug:
                      true,
                    price:
                      true,
                  },
                },
              },
            },
          ),

          prisma.registrationPayment.count(
            {
              where,
            },
          ),
        ],
      );

    return NextResponse.json(
      {
        success: true,

        data:
          payments,

        pagination: {
          page,

          pageSize,

          total,

          totalPages:
            Math.ceil(
              total /
                pageSize,
            ),
        },
      },
    );
  } catch (error) {
    console.error(
      "GET /api/registration-payments error:",
      error,
    );

    return errorResponse(
      "Failed to load registration payments.",
      500,
    );
  }
}

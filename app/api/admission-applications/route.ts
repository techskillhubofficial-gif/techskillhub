import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * TechSkillHub Admission Application API
 *
 * Lifecycle:
 *
 * LEAD
 *   ↓
 * REGISTRATION PAYMENT VERIFIED
 *   ↓
 * APPLICATION STARTED / DRAFT
 *   ↓
 * APPLICATION SUBMITTED
 *   ↓
 * ADMIN REVIEW
 *   ↓
 * ADMISSION
 *
 * IMPORTANT:
 * - RegistrationPayment verification is mandatory before application creation.
 * - RegistrationPayment does NOT equal admission.
 * - Admission is NOT created here.
 * - Enrollment is NOT created here.
 * - Applicant cannot set concession/financial values.
 */

const REGISTRATION_FEE = 5000;
const FIRST_LECTURE_FEE = 10000;

const ACTIVE_APPLICATION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
];

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function requiredString(
  value: unknown,
  fieldName: string,
): { value: string } | { error: string } {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return {
      error: `${fieldName} is required.`,
    };
  }

  return {
    value: cleaned,
  };
}

function normalizeEmail(value: unknown): string | null {
  const email = cleanString(value);

  if (!email) return null;

  return email.toLowerCase();
}

function normalizePhone(value: unknown): string | null {
  const phone = cleanString(value);

  if (!phone) return null;

  return phone.replace(/\s+/g, "");
}

function parseOptionalDate(
  value: unknown,
  fieldName: string,
): Date | null {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const date = new Date(cleaned);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return date;
}

function parseOptionalInteger(
  value: unknown,
  fieldName: string,
): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new Error(`${fieldName} must be a valid whole number.`);
  }

  return parsed;
}

function calculateFinancials(baseFee: number) {
  /**
   * Concession is intentionally zero at application stage.
   *
   * Any future concession must be approved by an authorized
   * admin workflow and must never come from applicant input.
   */
  const concessionPercent = 0;

  const concessionAmount = 0;

  const totalFee = Math.max(
    0,
    Math.round(baseFee),
  );

  const registrationFee = Math.min(
    REGISTRATION_FEE,
    totalFee,
  );

  const remainingAfterRegistration = Math.max(
    0,
    totalFee - registrationFee,
  );

  const firstLectureFee = Math.min(
    FIRST_LECTURE_FEE,
    remainingAfterRegistration,
  );

  const balanceFee = Math.max(
    0,
    totalFee -
      registrationFee -
      firstLectureFee,
  );

  return {
    baseFee: Math.round(baseFee),
    concessionPercent,
    concessionAmount,
    totalFee,
    registrationFee,
    firstLectureFee,
    balanceFee,
  };
}

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();

  const randomPart = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `TSH-APP-${year}-${randomPart}`;
}

async function generateUniqueApplicationNumber() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const applicationNo =
      generateApplicationNumber();

    const existing =
      await prisma.admissionApplication.findUnique({
        where: {
          applicationNo,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return applicationNo;
    }
  }

  throw new Error(
    "Unable to generate a unique application number. Please try again.",
  );
}

async function requireAdmin() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
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
          message: "Forbidden.",
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
 * Admin-only application listing.
 */
export async function GET(
  request: NextRequest,
) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } =
      new URL(request.url);

    const status = cleanString(
      searchParams.get("status"),
    );

    const search = cleanString(
      searchParams.get("search"),
    );

    const requestedPage = Number(
      searchParams.get("page") || "1",
    );

    const requestedPageSize = Number(
      searchParams.get("pageSize") || "25",
    );

    const page = Number.isFinite(requestedPage)
      ? Math.max(1, Math.floor(requestedPage))
      : 1;

    const pageSize = Number.isFinite(
      requestedPageSize,
    )
      ? Math.min(
          100,
          Math.max(
            1,
            Math.floor(requestedPageSize),
          ),
        )
      : 25;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          applicationNo: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          studentName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          studentEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          studentPhone: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          program: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [
      applications,
      total,
    ] = await prisma.$transaction([
      prisma.admissionApplication.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
              verifiedAt: true,
              verifiedBy: true,
            },
          },

          consents: true,

          auditEvents: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
        },
      }),

      prisma.admissionApplication.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(
          total / pageSize,
        ),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admission-applications error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch admission applications.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST
 *
 * Creates an admission application.
 *
 * PUBLIC INPUT:
 * - student information
 * - course
 * - registrationPaymentId
 * - application information
 * - consent
 *
 * SERVER CONTROLLED:
 * - registration payment verification
 * - financial snapshot
 * - concession
 * - registration fee
 * - first lecture fee
 * - balance fee
 * - application number
 * - CRM lifecycle
 */
export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body !== "object"
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

    /*
     * ---------------------------------------------------------
     * REQUIRED APPLICANT INFORMATION
     * ---------------------------------------------------------
     */

    const studentNameResult =
      requiredString(
        body.studentName,
        "Student name",
      );

    if ("error" in studentNameResult) {
      return NextResponse.json(
        {
          success: false,
          message:
            studentNameResult.error,
        },
        {
          status: 400,
        },
      );
    }

    const studentPhone =
      normalizePhone(
        body.studentPhone,
      );

    if (!studentPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Student phone is required.",
        },
        {
          status: 400,
        },
      );
    }

    const studentEmail =
      normalizeEmail(
        body.studentEmail,
      );

    if (!studentEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Student email is required.",
        },
        {
          status: 400,
        },
      );
    }

    const programResult =
      requiredString(
        body.program,
        "Program",
      );

    if ("error" in programResult) {
      return NextResponse.json(
        {
          success: false,
          message:
            programResult.error,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * COURSE
     * ---------------------------------------------------------
     */

    const courseId =
      cleanString(body.courseId);

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Course selection is required.",
        },
        {
          status: 400,
        },
      );
    }

    const course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
        },
      });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected course does not exist.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * REGISTRATION PAYMENT
     * ---------------------------------------------------------
     *
     * This is the key production gate.
     *
     * A full application cannot exist without a verified
     * registration payment.
     */

    const registrationPaymentId =
      cleanString(
        body.registrationPaymentId,
      );

    if (!registrationPaymentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verified registration payment is required before starting the admission application.",
          code:
            "REGISTRATION_PAYMENT_REQUIRED",
        },
        {
          status: 409,
        },
      );
    }

    const registrationPayment =
      await prisma.registrationPayment.findUnique(
        {
          where: {
            id: registrationPaymentId,
          },
          select: {
            id: true,
            registrationNo: true,
            leadId: true,
            courseId: true,
            applicationId: true,
            studentName: true,
            studentEmail: true,
            studentPhone: true,
            amount: true,
            status: true,
            transactionId: true,
            verifiedAt: true,
          },
        },
      );

    if (!registrationPayment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration payment not found.",
          code:
            "REGISTRATION_PAYMENT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    if (
      registrationPayment.status !==
      "VERIFIED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration payment must be verified by TechSkillHub before the admission application can be started.",
          code:
            "REGISTRATION_PAYMENT_NOT_VERIFIED",
          paymentStatus:
            registrationPayment.status,
        },
        {
          status: 409,
        },
      );
    }

    if (
      registrationPayment.courseId !==
      course.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration payment does not belong to the selected course.",
          code:
            "REGISTRATION_PAYMENT_COURSE_MISMATCH",
        },
        {
          status: 409,
        },
      );
    }

    if (
      registrationPayment.amount !==
      REGISTRATION_FEE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verified registration payment amount is invalid.",
          code:
            "REGISTRATION_PAYMENT_AMOUNT_INVALID",
        },
        {
          status: 409,
        },
      );
    }

    if (
      registrationPayment.applicationId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This registration payment has already been linked to an admission application.",
          code:
            "REGISTRATION_PAYMENT_ALREADY_USED",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * The registration payment is tied to the identity
     * submitted during registration.
     *
     * This prevents someone from taking another student's
     * verified payment and attaching it to their application.
     */

    if (
      registrationPayment.studentEmail !==
      studentEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Student email does not match the verified registration payment.",
          code:
            "REGISTRATION_PAYMENT_EMAIL_MISMATCH",
        },
        {
          status: 409,
        },
      );
    }

    if (
      registrationPayment.studentPhone !==
      studentPhone
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Student phone does not match the verified registration payment.",
          code:
            "REGISTRATION_PAYMENT_PHONE_MISMATCH",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * LEAD
     * ---------------------------------------------------------
     */

    const suppliedLeadId =
      cleanString(body.leadId);

    let leadId =
      registrationPayment.leadId;

    if (
      suppliedLeadId &&
      suppliedLeadId !== leadId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The supplied lead does not match the verified registration payment.",
          code:
            "LEAD_PAYMENT_MISMATCH",
        },
        {
          status: 409,
        },
      );
    }

    const lead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          currentStatus: true,
        },
      });

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The lead connected to the verified registration payment no longer exists.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * DUPLICATE APPLICATION PROTECTION
     * ---------------------------------------------------------
     */

    const duplicateApplication =
      await prisma.admissionApplication.findFirst(
        {
          where: {
            OR: [
              {
                studentEmail,
              },
              {
                studentPhone,
              },
            ],
            status: {
              in: ACTIVE_APPLICATION_STATUSES,
            },
          },
          select: {
            id: true,
            applicationNo: true,
            status: true,
            studentEmail: true,
            studentPhone: true,
            courseId: true,
          },
        },
      );

    if (duplicateApplication) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An active admission application already exists for this student.",
          existingApplication:
            duplicateApplication,
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * FINANCIAL SNAPSHOT
     * ---------------------------------------------------------
     *
     * NEVER trust:
     * - concessionPercent
     * - totalFee
     * - registrationFee
     * - firstLectureFee
     * - balanceFee
     * - baseFee
     *
     * from the browser.
     *
     * The server derives everything from Course.price.
     */

    const baseFee = Math.round(
      Number(course.price),
    );

    if (
      !Number.isFinite(baseFee) ||
      baseFee <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected course does not have a valid fee configured.",
        },
        {
          status: 409,
        },
      );
    }

    const financials =
      calculateFinancials(baseFee);

    /*
     * ---------------------------------------------------------
     * STATUS
     * ---------------------------------------------------------
     */

    const requestedStatus =
      cleanString(body.status);

    const isSubmitting =
      requestedStatus === "SUBMITTED";

    const applicationStatus =
      isSubmitting
        ? "SUBMITTED"
        : "DRAFT";

    const now = new Date();

    /*
     * ---------------------------------------------------------
     * CONSENTS
     * ---------------------------------------------------------
     */

    const applicantDeclarationAccepted =
      body.applicantDeclarationAccepted ===
      true;

    const parentConsentAccepted =
      body.parentConsentAccepted ===
      true;

    const privacyConsentAccepted =
      body.privacyConsentAccepted ===
      true;

    const marketingConsentAccepted =
      body.marketingConsentAccepted ===
      true;

    const parentConsentRequired =
      body.parentConsentRequired ===
      true;

    if (isSubmitting) {
      if (
        !applicantDeclarationAccepted
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Applicant declaration must be accepted before submission.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        !privacyConsentAccepted
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Privacy/data-processing acknowledgement must be accepted before submission.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        parentConsentRequired &&
        !parentConsentAccepted
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Parent/guardian consent is required before submission.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * APPLICATION NUMBER
     * ---------------------------------------------------------
     */

    const applicationNo =
      await generateUniqueApplicationNumber();

    /*
     * ---------------------------------------------------------
     * OPTIONAL FORM DATA
     * ---------------------------------------------------------
     */

    let dateOfBirth: Date | null =
      null;

    let graduationYear: number | null =
      null;

    try {
      dateOfBirth =
        parseOptionalDate(
          body.dateOfBirth,
          "Date of birth",
        );

      graduationYear =
        parseOptionalInteger(
          body.graduationYear,
          "Graduation year",
        );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Invalid application data.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * CREATE APPLICATION
     * ---------------------------------------------------------
     */

    const application =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Re-check the registration payment inside
           * the transaction to reduce race conditions.
           */

          const payment =
            await tx.registrationPayment.findUnique(
              {
                where: {
                  id: registrationPayment.id,
                },
                select: {
                  id: true,
                  leadId: true,
                  courseId: true,
                  applicationId: true,
                  status: true,
                  amount: true,
                },
              },
            );

          if (!payment) {
            throw new Error(
              "Registration payment could not be found.",
            );
          }

          if (
            payment.status !==
            "VERIFIED"
          ) {
            throw new Error(
              "Registration payment is no longer verified.",
            );
          }

          if (
            payment.applicationId
          ) {
            throw new Error(
              "Registration payment has already been used.",
            );
          }

          if (
            payment.courseId !==
            course.id
          ) {
            throw new Error(
              "Registration payment course mismatch.",
            );
          }

          if (
            payment.amount !==
            REGISTRATION_FEE
          ) {
            throw new Error(
              "Registration payment amount mismatch.",
            );
          }

          /*
           * Create application.
           */

          const createdApplication =
            await tx.admissionApplication.create(
              {
                data: {
                  applicationNo,

                  leadId,

                  courseId:
                    course.id,

                  studentName:
                    studentNameResult.value,

                  studentEmail,

                  studentPhone,

                  dateOfBirth,

                  gender:
                    cleanString(
                      body.gender,
                    ),

                  city:
                    cleanString(
                      body.city,
                    ),

                  state:
                    cleanString(
                      body.state,
                    ),

                  addressLine1:
                    cleanString(
                      body.addressLine1,
                    ),

                  addressLine2:
                    cleanString(
                      body.addressLine2,
                    ),

                  postalCode:
                    cleanString(
                      body.postalCode,
                    ),

                  parentName:
                    cleanString(
                      body.parentName,
                    ),

                  parentRelation:
                    cleanString(
                      body.parentRelation,
                    ),

                  parentPhone:
                    normalizePhone(
                      body.parentPhone,
                    ),

                  parentEmail:
                    normalizeEmail(
                      body.parentEmail,
                    ),

                  parentOccupation:
                    cleanString(
                      body.parentOccupation,
                    ),

                  educationLevel:
                    cleanString(
                      body.educationLevel,
                    ),

                  institutionName:
                    cleanString(
                      body.institutionName,
                    ),

                  graduationYear,

                  educationDetails:
                    cleanString(
                      body.educationDetails,
                    ),

                  currentOccupation:
                    cleanString(
                      body.currentOccupation,
                    ),

                  careerGoal:
                    cleanString(
                      body.careerGoal,
                    ),

                  program:
                    programResult.value,

                  /*
                   * SERVER-CONTROLLED FINANCIAL SNAPSHOT
                   */

                  baseFee:
                    financials.baseFee,

                  concessionPercent:
                    financials.concessionPercent,

                  concessionAmount:
                    financials.concessionAmount,

                  totalFee:
                    financials.totalFee,

                  registrationFee:
                    financials.registrationFee,

                  firstLectureFee:
                    financials.firstLectureFee,

                  balanceFee:
                    financials.balanceFee,

                  paymentPlanName:
                    cleanString(
                      body.paymentPlanName,
                    ),

                  status:
                    applicationStatus,

                  submittedAt:
                    isSubmitting
                      ? now
                      : null,

                  declarationAcceptedAt:
                    applicantDeclarationAccepted
                      ? now
                      : null,

                  parentConsentAt:
                    parentConsentAccepted
                      ? now
                      : null,

                  privacyConsentAt:
                    privacyConsentAccepted
                      ? now
                      : null,

                  marketingConsentAt:
                    marketingConsentAccepted
                      ? now
                      : null,
                },
              },
            );

          /*
           * Link the verified registration payment
           * to this exact application.
           */

          await tx.registrationPayment.update(
            {
              where: {
                id: payment.id,
              },

              data: {
                applicationId:
                  createdApplication.id,
              },
            },
          );

          /*
           * -----------------------------------------------------
           * CONSENT RECORDS
           * -----------------------------------------------------
           */

          const consentRecords = [
            {
              consentType:
                "APPLICANT_DECLARATION",

              accepted:
                applicantDeclarationAccepted,

              consentText:
                "I confirm that the information provided in this admission application is true and complete to the best of my knowledge.",
            },

            {
              consentType:
                "PRIVACY_DATA_PROCESSING",

              accepted:
                privacyConsentAccepted,

              consentText:
                "I acknowledge and agree that TechSkillHub may process the information provided in this application for admission, verification, communication and related operational purposes.",
            },

            {
              consentType:
                "PARENT_GUARDIAN_CONSENT",

              accepted:
                parentConsentAccepted,

              consentText:
                "Parent/guardian confirms consent for the applicant's admission process where such consent is applicable.",
            },

            {
              consentType:
                "MARKETING_COMMUNICATION",

              accepted:
                marketingConsentAccepted,

              consentText:
                "I agree to receive optional marketing and promotional communications from TechSkillHub.",
            },
          ];

          await tx.applicationConsent.createMany(
            {
              data:
                consentRecords.map(
                  (consent) => ({
                    applicationId:
                      createdApplication.id,

                    consentType:
                      consent.consentType,

                    accepted:
                      consent.accepted,

                    consentText:
                      consent.consentText,

                    acceptedAt:
                      consent.accepted
                        ? now
                        : null,

                    ipAddress:
                      request.headers.get(
                        "x-forwarded-for",
                      ),

                    userAgent:
                      request.headers.get(
                        "user-agent",
                      ),
                  }),
                ),
            },
          );

          /*
           * -----------------------------------------------------
           * APPLICATION AUDIT EVENT
           * -----------------------------------------------------
           */

          await tx.applicationAuditEvent.create(
            {
              data: {
                applicationId:
                  createdApplication.id,

                eventType:
                  isSubmitting
                    ? "APPLICATION_SUBMITTED"
                    : "APPLICATION_CREATED",

                fromStatus: null,

                toStatus:
                  applicationStatus,

                actorId: null,

                actorType:
                  "APPLICANT",

                description:
                  isSubmitting
                    ? "Admission application submitted after verified registration payment."
                    : "Admission application draft created after verified registration payment.",

                metadata: {
                  applicationNo,

                  registrationNo:
                    registrationPayment.registrationNo,

                  registrationPaymentId:
                    registrationPayment.id,

                  courseId:
                    course.id,

                  courseTitle:
                    course.title,

                  program:
                    programResult.value,

                  financials,
                },
              },
            },
          );

          /*
           * -----------------------------------------------------
           * CRM LIFECYCLE
           * -----------------------------------------------------
           *
           * currentStatus is intentionally a String in the
           * existing schema, allowing the richer CRM lifecycle.
           */

          await tx.lead.update({
            where: {
              id: leadId,
            },

            data: {
              currentStatus:
                isSubmitting
                  ? "APPLICATION_SUBMITTED"
                  : "APPLICATION_STARTED",

              interestedProgram:
                course.title,

              careerGoal:
                cleanString(
                  body.careerGoal,
                ) ??
                undefined,
            },
          });

          await tx.leadActivity.create({
            data: {
              leadId,

              type:
                "UPDATED",

              title:
                isSubmitting
                  ? "Admission application submitted"
                  : "Admission application started",

              description:
                isSubmitting
                  ? `Application ${applicationNo} submitted after verified registration payment ${registrationPayment.registrationNo}.`
                  : `Application ${applicationNo} created as a draft after verified registration payment ${registrationPayment.registrationNo}.`,

              metadata: {
                applicationId:
                  createdApplication.id,

                applicationNo,

                registrationPaymentId:
                  registrationPayment.id,

                registrationNo:
                  registrationPayment.registrationNo,

                courseId:
                  course.id,

                courseTitle:
                  course.title,

                status:
                  applicationStatus,
              },

              createdBy: null,
            },
          });

          return createdApplication;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        },
      );

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        message:
          isSubmitting
            ? "Admission application submitted successfully."
            : "Admission application draft created successfully.",

        data: {
          id:
            application.id,

          applicationNo:
            application.applicationNo,

          status:
            application.status,

          studentName:
            application.studentName,

          studentEmail:
            application.studentEmail,

          studentPhone:
            application.studentPhone,

          program:
            application.program,

          course: {
            id: course.id,
            title: course.title,
            slug: course.slug,
          },

          registrationPayment: {
            id:
              registrationPayment.id,

            registrationNo:
              registrationPayment.registrationNo,

            amount:
              registrationPayment.amount,

            status:
              registrationPayment.status,

            verifiedAt:
              registrationPayment.verifiedAt,
          },

          financials: {
            baseFee:
              application.baseFee,

            concessionPercent:
              application.concessionPercent,

            concessionAmount:
              application.concessionAmount,

            totalFee:
              application.totalFee,

            registrationFee:
              application.registrationFee,

            firstLectureFee:
              application.firstLectureFee,

            balanceFee:
              application.balanceFee,
          },

          submittedAt:
            application.submittedAt,

          createdAt:
            application.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/admission-applications error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create admission application.",
      },
      {
        status: 500,
      },
    );
  }
}

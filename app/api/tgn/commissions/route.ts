import { NextRequest, NextResponse } from "next/server";
import { Prisma, TgnCommissionStatus } from "@prisma/client";
import { getTgnContext, canManageNetwork } from "@/lib/tgn/authorization";
import { prisma } from "@/lib/prisma";

const MAX_COMMISSION = 5000;

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status });

async function authorized() {
  const context = await getTgnContext();
  return context && canManageNetwork(context) ? context : null;
}

async function evaluate(admissionId: string, memberId: string) {
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: {
      lead: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          tgnSourceMemberId: true,
          tgnOwnerId: true,
        },
      },
      course: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
      payments: {
        where: { status: "VERIFIED" },
        orderBy: { paymentDate: "asc" },
        select: {
          id: true,
          amount: true,
          type: true,
          paymentDate: true,
          verifiedAt: true,
        },
      },
    },
  });

  if (!admission) {
    return {
      eligible: false,
      reasons: ["Admission was not found."],
      admission: null,
    };
  }

  const reasons: string[] = [];

  const attributed =
    admission.lead?.tgnSourceMemberId === memberId ||
    admission.lead?.tgnOwnerId === memberId;

  if (!attributed)
    reasons.push("Admission is not attributed to this TGN member.");

  if (!["APPROVED", "ENROLLED"].includes(admission.status))
    reasons.push("Admission is not approved or enrolled.");

  if (!admission.approvedAt)
    reasons.push("Admission approval has not been recorded.");

  const registration = admission.payments.find(
    (p) => p.type === "REGISTRATION_FEE"
  );

  if (!registration)
    reasons.push("Verified registration payment is missing.");

  const installment = admission.payments.find(
    (p) => p.type === "INSTALLMENT" || p.type === "EMI"
  );

  if (!installment)
    reasons.push("Verified first installment/EMI payment is missing.");

  let firstLecture = null;
  let attendance = null;

  if (!admission.userId || !admission.courseId) {
    reasons.push("Student account or course link is missing.");
  } else {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: admission.userId,
        courseId: admission.courseId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      select: { id: true },
    });

    if (!enrollment) {
      reasons.push("Active/completed enrollment is missing.");
    } else {
      firstLecture = await prisma.lesson.findFirst({
        where: { courseId: admission.courseId },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          order: true,
          scheduledAt: true,
        },
      });

      if (!firstLecture) {
        reasons.push("The course has no lecture yet.");
      } else {
        attendance = await prisma.lectureAttendance.findUnique({
          where: {
            enrollmentId_lessonId: {
              enrollmentId: enrollment.id,
              lessonId: firstLecture.id,
            },
          },
          select: {
            status: true,
            source: true,
            joinedAt: true,
            durationMinutes: true,
          },
        });

        if (
          !attendance ||
          !["PRESENT", "LATE"].includes(attendance.status)
        ) {
          reasons.push(
            "First lecture attendance has not been confirmed as present/late."
          );
        }
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    admission: {
      id: admission.id,
      admissionNo: admission.admissionNo,
      status: admission.status,
      approvedAt: admission.approvedAt,
      studentName: admission.studentName,
      studentEmail: admission.studentEmail,
      course: admission.course,
      lead: admission.lead,
      registrationPayment: registration
        ? {
            id: registration.id,
            amount: registration.amount,
            paymentDate: registration.paymentDate,
          }
        : null,
      firstInstallment: installment
        ? {
            id: installment.id,
            amount: installment.amount,
            type: installment.type,
            paymentDate: installment.paymentDate,
          }
        : null,
      firstLecture,
      attendance,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await authorized())) return fail("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const memberId = searchParams.get("memberId");
    const search = searchParams.get("search")?.trim();

    if (searchParams.get("availableAdmissions") === "true") {
      const admissions = await prisma.admission.findMany({
        where: {
          status: { in: ["APPROVED", "ENROLLED"] },
          lead: {
            OR: [
              { tgnSourceMemberId: { not: null } },
              { tgnOwnerId: { not: null } },
            ],
          },
        },
        orderBy: { approvedAt: "desc" },
        take: 100,
        include: {
          course: { select: { id: true, title: true } },
          lead: {
            select: {
              id: true,
              fullName: true,
              email: true,
              tgnSourceMemberId: true,
              tgnOwnerId: true,
            },
          },
        },
      });

      const existing = await prisma.tgnCommission.findMany({
        where: {
          admissionId: { in: admissions.map((a) => a.id) },
        },
        select: {
          id: true,
          admissionId: true,
          memberId: true,
          status: true,
          amount: true,
        },
      });

      return NextResponse.json({
        success: true,
        admissions: admissions.map((a) => ({
          ...a,
          commissions: existing
            .filter((c) => c.admissionId === a.id)
            .map((c) => ({
              ...c,
              amount: Number(c.amount),
            })),
        })),
      });
    }

    const where: Prisma.TgnCommissionWhereInput = {};

    if (
      status &&
      Object.values(TgnCommissionStatus).includes(
        status as TgnCommissionStatus
      )
    ) {
      where.status = status as TgnCommissionStatus;
    }

    if (memberId) where.memberId = memberId;

    if (search) {
      where.OR = [
        {
          member: {
            user: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          member: {
            user: {
              email: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const commissions = await prisma.tgnCommission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        member: {
          select: {
            id: true,
            memberType: true,
            status: true,
            referralCode: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    const leadIds = [
      ...new Set(
        commissions
          .map((c) => c.leadId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const admissionIds = [
      ...new Set(
        commissions
          .map((c) => c.admissionId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const [leads, admissions] = await Promise.all([
      leadIds.length
        ? prisma.lead.findMany({
            where: { id: { in: leadIds } },
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              currentStatus: true,
            },
          })
        : [],
      admissionIds.length
        ? prisma.admission.findMany({
            where: { id: { in: admissionIds } },
            select: {
              id: true,
              admissionNo: true,
              studentName: true,
              studentEmail: true,
              status: true,
              program: true,
              totalFee: true,
              approvedAt: true,
            },
          })
        : [],
    ]);

    const leadMap = new Map(leads.map((l) => [l.id, l]));
    const admissionMap = new Map(admissions.map((a) => [a.id, a]));

    const totals = {
      total: 0,
      PENDING: 0,
      ELIGIBLE: 0,
      APPROVED: 0,
      PAID: 0,
      REJECTED: 0,
    };

    for (const commission of commissions) {
      const amount = Number(commission.amount);
      totals.total += amount;
      totals[commission.status] += amount;
    }

    return NextResponse.json({
      success: true,
      commissions: commissions.map((c) => ({
        ...c,
        amount: Number(c.amount),
        lead: c.leadId ? leadMap.get(c.leadId) ?? null : null,
        admission: c.admissionId
          ? admissionMap.get(c.admissionId) ?? null
          : null,
      })),
      totals,
    });
  } catch (error) {
    console.error("TGN commissions GET:", error);
    return fail("Failed to load commissions", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await authorized())) return fail("Unauthorized", 401);

    const body = await request.json();

    const memberId = String(body.memberId ?? "").trim();
    const admissionId = String(body.admissionId ?? "").trim();
    const amount = Number(body.amount);
    const notes =
      typeof body.notes === "string" ? body.notes.trim() || null : null;

    if (!memberId || !admissionId)
      return fail("Member and admission are required.");

    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_COMMISSION)
      return fail("Commission amount must be between ₹1 and ₹5,000.");

    const member = await prisma.tgnMemberProfile.findUnique({
      where: { id: memberId },
      select: { id: true, status: true },
    });

    if (!member) return fail("TGN member not found.");

    if (["INACTIVE", "SUSPENDED"].includes(member.status))
      return fail("Inactive or suspended members cannot receive new commissions.");

    const evaluation = await evaluate(admissionId, memberId);

    if (!evaluation.admission)
      return fail("Admission not found.", 404);

    const existing = await prisma.tgnCommission.findFirst({
      where: {
        admissionId,
        status: { not: "REJECTED" },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (existing)
      return fail(
        `A commission already exists for this admission (${existing.status}).`
      );

    const commission = await prisma.tgnCommission.create({
      data: {
        memberId,
        leadId: evaluation.admission.lead?.id ?? null,
        admissionId,
        amount,
        status: evaluation.eligible ? "ELIGIBLE" : "PENDING",
        eligibilityReason: evaluation.eligible
          ? "All documented TGN commission conditions are satisfied."
          : evaluation.reasons.join(" "),
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        commission: {
          ...commission,
          amount: Number(commission.amount),
        },
        evaluation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("TGN commissions POST:", error);
    return fail("Failed to create commission", 500);
  }
}

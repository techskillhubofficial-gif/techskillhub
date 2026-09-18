import { NextResponse } from "next/server";

import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const context = await getTgnContext();

    if (!canManageNetwork(context)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [
      members,
      teams,
      applications,
      tgnLeads,
      tgnAdmissions,
      commissions,
    ] = await Promise.all([
      prisma.tgnMemberProfile.findMany({
        select: {
          id: true,
          memberType: true,
          status: true,
          referralCode: true,
          user: {
            select: {
              name: true,
              email: true,
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
        orderBy: { createdAt: "asc" },
      }),

      prisma.tgnTeam.count({
        where: {
          status: { not: "ARCHIVED" },
        },
      }),

      prisma.tgnApplication.findMany({
        select: {
          id: true,
          memberType: true,
          status: true,
          sourceMemberId: true,
          createdAt: true,
        },
      }),

      prisma.lead.findMany({
        where: {
          OR: [
            { tgnSourceMemberId: { not: null } },
            { tgnOwnerId: { not: null } },
          ],
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          currentStatus: true,
          status: true,
          tgnSourceMemberId: true,
          tgnOwnerId: true,
          createdAt: true,
          admissions: {
            select: {
              id: true,
              admissionNo: true,
              status: true,
              studentName: true,
              totalFee: true,
              approvedAt: true,
              payments: {
                where: {
                  status: "VERIFIED",
                },
                select: {
                  id: true,
                  amount: true,
                  type: true,
                  paymentDate: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.admission.findMany({
        where: {
          lead: {
            OR: [
              { tgnSourceMemberId: { not: null } },
              { tgnOwnerId: { not: null } },
            ],
          },
        },
        select: {
          id: true,
          admissionNo: true,
          studentName: true,
          studentEmail: true,
          status: true,
          totalFee: true,
          approvedAt: true,
          lead: {
            select: {
              id: true,
              tgnSourceMemberId: true,
              tgnOwnerId: true,
            },
          },
          payments: {
            where: {
              status: "VERIFIED",
            },
            select: {
              amount: true,
              type: true,
              paymentDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.tgnCommission.findMany({
        select: {
          id: true,
          memberId: true,
          amount: true,
          status: true,
          admissionId: true,
          leadId: true,
          createdAt: true,
          member: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const activeMembers = members.filter(
      (member) => member.status === "ACTIVE"
    ).length;

    const teamLeaders = members.filter(
      (member) => member.memberType === "TEAM_LEADER"
    ).length;

    const executives = members.filter(
      (member) => member.memberType === "EXECUTIVE"
    ).length;

    const enrolledAdmissions = tgnAdmissions.filter(
      (admission) => admission.status === "ENROLLED"
    ).length;

    const approvedAdmissions = tgnAdmissions.filter((admission) =>
      ["APPROVED", "ENROLLED"].includes(admission.status)
    ).length;

    const verifiedRevenue = tgnAdmissions.reduce(
      (total, admission) =>
        total +
        admission.payments.reduce(
          (paymentTotal, payment) => paymentTotal + payment.amount,
          0
        ),
      0
    );

    const revenueByType = {
      REGISTRATION_FEE: 0,
      COURSE_FEE: 0,
      INSTALLMENT: 0,
      EMI: 0,
      OTHER: 0,
    };

    for (const admission of tgnAdmissions) {
      for (const payment of admission.payments) {
        if (payment.type in revenueByType) {
          revenueByType[payment.type as keyof typeof revenueByType] +=
            payment.amount;
        }
      }
    }

    const commissionTotals = {
      PENDING: 0,
      ELIGIBLE: 0,
      APPROVED: 0,
      PAID: 0,
      REJECTED: 0,
    };

    for (const commission of commissions) {
      commissionTotals[commission.status] += Number(commission.amount);
    }

    const memberReports = members.map((member) => {
      const memberLeads = tgnLeads.filter(
        (lead) =>
          lead.tgnSourceMemberId === member.id ||
          lead.tgnOwnerId === member.id
      );

      const memberLeadIds = new Set(memberLeads.map((lead) => lead.id));

      const memberAdmissions = tgnAdmissions.filter(
        (admission) =>
          admission.lead?.tgnSourceMemberId === member.id ||
          admission.lead?.tgnOwnerId === member.id
      );

      const memberAdmissionIds = new Set(
        memberAdmissions.map((admission) => admission.id)
      );

      const memberRevenue = memberAdmissions.reduce(
        (total, admission) =>
          total +
          admission.payments.reduce(
            (paymentTotal, payment) => paymentTotal + payment.amount,
            0
          ),
        0
      );

      const memberCommissions = commissions.filter(
        (commission) =>
          commission.memberId === member.id &&
          (commission.leadId === null ||
            memberLeadIds.has(commission.leadId)) &&
          (commission.admissionId === null ||
            memberAdmissionIds.has(commission.admissionId))
      );

      return {
        id: member.id,
        name: member.user.name || member.user.email,
        email: member.user.email,
        memberType: member.memberType,
        status: member.status,
        referralCode: member.referralCode,
        team: member.team,
        leads: memberLeads.length,
        admissions: memberAdmissions.length,
        enrolled: memberAdmissions.filter(
          (admission) => admission.status === "ENROLLED"
        ).length,
        verifiedRevenue: memberRevenue,
        commissionPaid: memberCommissions
          .filter((commission) => commission.status === "PAID")
          .reduce(
            (total, commission) => total + Number(commission.amount),
            0
          ),
        commissionApproved: memberCommissions
          .filter((commission) => commission.status === "APPROVED")
          .reduce(
            (total, commission) => total + Number(commission.amount),
            0
          ),
      };
    });

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      overview: {
        totalMembers: members.length,
        activeMembers,
        teamLeaders,
        executives,
        teams,
        applications: applications.length,
        pendingApplications: applications.filter((application) =>
          ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW"].includes(
            application.status
          )
        ).length,
        tgnLeads: tgnLeads.length,
        admissions: tgnAdmissions.length,
        approvedAdmissions,
        enrolledAdmissions,
        verifiedRevenue,
      },
      revenue: {
        total: verifiedRevenue,
        ...revenueByType,
      },
      commissions: {
        ...commissionTotals,
        total:
          commissionTotals.PENDING +
          commissionTotals.ELIGIBLE +
          commissionTotals.APPROVED +
          commissionTotals.PAID +
          commissionTotals.REJECTED,
      },
      memberReports,
      recentAdmissions: tgnAdmissions.slice(0, 10).map((admission) => ({
        id: admission.id,
        admissionNo: admission.admissionNo,
        studentName: admission.studentName,
        status: admission.status,
        totalFee: admission.totalFee,
        approvedAt: admission.approvedAt,
      })),
    });
  } catch (error) {
    console.error("TGN reports GET:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate TGN report",
      },
      { status: 500 }
    );
  }
}

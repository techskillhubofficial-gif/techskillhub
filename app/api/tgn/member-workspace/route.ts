import { NextResponse } from "next/server";
import { TgnMemberType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getTgnContext } from "@/lib/tgn/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getTgnContext();

    if (
      !context ||
      !context.memberId ||
      (context.access !== "TEAM_LEADER" &&
        context.access !== "EXECUTIVE")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN member access is required.",
        },
        { status: 403 },
      );
    }

    const isTeamLeader = context.access === "TEAM_LEADER";

    const directReports = isTeamLeader
      ? await prisma.tgnMemberProfile.findMany({
          where: {
            managerId: context.memberId,
            memberType: TgnMemberType.EXECUTIVE,
          },
          select: {
            id: true,
            status: true,
          },
        })
      : [];

    const accessibleMemberIds = [
      context.memberId,
      ...directReports.map((member) => member.id),
    ];

    const [
      leads,
      admissions,
      commissions,
      applications,
    ] = await Promise.all([
      prisma.lead.findMany({
        where: {
          OR: [
            {
              tgnOwnerId: {
                in: accessibleMemberIds,
              },
            },
            {
              tgnSourceMemberId: {
                in: accessibleMemberIds,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          interestedProgram: true,
          createdAt: true,
          lastContactedAt: true,
          tgnOwnerId: true,
          tgnSourceMemberId: true,
        },
      }),

      prisma.admission.findMany({
        where: {
          lead: {
            OR: [
              {
                tgnOwnerId: {
                  in: accessibleMemberIds,
                },
              },
              {
                tgnSourceMemberId: {
                  in: accessibleMemberIds,
                },
              },
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          admissionNo: true,
          studentName: true,
          program: true,
          status: true,
          approvedAt: true,
          createdAt: true,
          leadId: true,
        },
      }),

      prisma.tgnCommission.findMany({
        where: {
          memberId: {
            in: accessibleMemberIds,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          amount: true,
          status: true,
          leadId: true,
          admissionId: true,
          createdAt: true,
          approvedAt: true,
          paidAt: true,
        },
      }),

      isTeamLeader
        ? prisma.tgnApplication.findMany({
            where: {
              sourceMemberId: context.memberId,
              memberType: TgnMemberType.EXECUTIVE,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 100,
            select: {
              id: true,
              applicationNo: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const leadPipeline = leads.reduce<Record<string, number>>(
      (result, lead) => {
        result[lead.status] = (result[lead.status] ?? 0) + 1;
        return result;
      },
      {},
    );

    const admissionPipeline = admissions.reduce<Record<string, number>>(
      (result, admission) => {
        result[admission.status] =
          (result[admission.status] ?? 0) + 1;

        return result;
      },
      {},
    );

    const commissionTotals = commissions.reduce(
      (result, commission) => {
        const amount = Number(commission.amount);

        if (commission.status === "APPROVED") {
          result.approved += amount;
        }

        if (commission.status === "PAID") {
          result.paid += amount;
        }

        if (commission.status === "ELIGIBLE") {
          result.eligible += amount;
        }

        if (commission.status === "PENDING") {
          result.pending += amount;
        }

        return result;
      },
      {
        eligible: 0,
        pending: 0,
        approved: 0,
        paid: 0,
      },
    );

    const recruitmentPipeline = applications.reduce<Record<string, number>>(
      (result, application) => {
        result[application.status] =
          (result[application.status] ?? 0) + 1;

        return result;
      },
      {},
    );

    return NextResponse.json({
      success: true,

      metrics: {
        leads: leads.length,
        admissions: admissions.length,
        directExecutives: directReports.length,
        applications: applications.length,
      },

      pipelines: {
        leads: leadPipeline,
        admissions: admissionPipeline,
        recruitment: recruitmentPipeline,
      },

      commissions: commissionTotals,

      recentLeads: leads.slice(0, 8),

      recentAdmissions: admissions.slice(0, 6),

      recentApplications: applications.slice(0, 6),
    });
  } catch (error) {
    console.error("TGN member workspace GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load TGN workspace data.",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  TgnApplicationStatus,
  TgnMemberStatus,
  TgnMemberType,
  TgnCommissionStatus,
} from "@prisma/client";
import {
  getTgnContext,
  canManageNetwork,
} from "@/lib/tgn/authorization";
import {
  getTgnAccessibleMemberIds,
  getTgnLeadScope,
} from "@/lib/tgn/hierarchy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getTgnContext();

    if (!canManageNetwork(context)) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN network management access is required.",
        },
        { status: 403 },
      );
    }

    const isFounder = context?.access === "FOUNDER";
    const accessibleMemberIds = isFounder
      ? null
      : await getTgnAccessibleMemberIds(context);
    const tgnLeadScope = await getTgnLeadScope(context);

    if (!isFounder && (accessibleMemberIds?.length ?? 0) === 0) {
      return NextResponse.json({
        success: true,
        data: {
          members: {
            total: 0,
            active: 0,
            teamLeaders: 0,
            executives: 0,
          },
          teams: {
            total: 0,
            active: 0,
          },
          applications: {
            total: 0,
            pending: 0,
          },
          leads: {
            total: 0,
          },
          commissions: {
            total: 0,
            pending: 0,
            approved: 0,
            paid: 0,
            amounts: {},
          },
        },
      });
    }

    const memberScope = isFounder
      ? {}
      : { id: { in: accessibleMemberIds! } };

    const teamScope = isFounder
      ? {}
      : { leaderMemberId: { in: accessibleMemberIds! } };

    const applicationScope = isFounder
      ? {}
      : { sourceMemberId: { in: accessibleMemberIds! } };

    const commissionScope = isFounder
      ? {}
      : { memberId: { in: accessibleMemberIds! } };

    const [
      totalMembers,
      activeMembers,
      teamLeaders,
      executives,
      totalTeams,
      activeTeams,
      totalApplications,
      pendingApplications,
      totalTgnLeads,
      totalCommissions,
      pendingCommissions,
      approvedCommissions,
      paidCommissions,
    ] = await Promise.all([
      prisma.tgnMemberProfile.count({
        where: memberScope,
      }),
      prisma.tgnMemberProfile.count({
        where: {
          ...memberScope,
          status: TgnMemberStatus.ACTIVE,
        },
      }),
      prisma.tgnMemberProfile.count({
        where: {
          ...memberScope,
          memberType: TgnMemberType.TEAM_LEADER,
          status: { not: TgnMemberStatus.INACTIVE },
        },
      }),
      prisma.tgnMemberProfile.count({
        where: {
          ...memberScope,
          memberType: TgnMemberType.EXECUTIVE,
          status: { not: TgnMemberStatus.INACTIVE },
        },
      }),
      prisma.tgnTeam.count({
        where: teamScope,
      }),
      prisma.tgnTeam.count({
        where: {
          ...teamScope,
          status: "ACTIVE",
        },
      }),
      prisma.tgnApplication.count({
        where: applicationScope,
      }),
      prisma.tgnApplication.count({
        where: {
          ...applicationScope,
          status: {
            in: [
              TgnApplicationStatus.SUBMITTED,
              TgnApplicationStatus.UNDER_REVIEW,
              TgnApplicationStatus.SHORTLISTED,
              TgnApplicationStatus.INTERVIEW,
            ],
          },
        },
      }),
      prisma.lead.count({
        where: tgnLeadScope,
      }),
      prisma.tgnCommission.count({
        where: commissionScope,
      }),
      prisma.tgnCommission.count({
        where: {
          ...commissionScope,
          status: TgnCommissionStatus.PENDING,
        },
      }),
      prisma.tgnCommission.count({
        where: {
          ...commissionScope,
          status: {
            in: [
              TgnCommissionStatus.ELIGIBLE,
              TgnCommissionStatus.APPROVED,
            ],
          },
        },
      }),
      prisma.tgnCommission.count({
        where: {
          ...commissionScope,
          status: TgnCommissionStatus.PAID,
        },
      }),
    ]);

    const commissionTotals = await prisma.tgnCommission.groupBy({
      by: ["status"],
      where: commissionScope,
      _sum: { amount: true },
    });

    const commissionAmounts = commissionTotals.reduce<
      Record<string, number>
    >((result, item) => {
      result[item.status] = Number(item._sum.amount ?? 0);
      return result;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        members: {
          total: totalMembers,
          active: activeMembers,
          teamLeaders,
          executives,
        },
        teams: {
          total: totalTeams,
          active: activeTeams,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
        },
        leads: {
          total: totalTgnLeads,
        },
        commissions: {
          total: totalCommissions,
          pending: pendingCommissions,
          approved: approvedCommissions,
          paid: paidCommissions,
          amounts: commissionAmounts,
        },
      },
    });
  } catch (error) {
    console.error("TGN overview GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Growth Network overview.",
      },
      { status: 500 },
    );
  }
}

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
      prisma.tgnMemberProfile.count(),
      prisma.tgnMemberProfile.count({
        where: { status: TgnMemberStatus.ACTIVE },
      }),
      prisma.tgnMemberProfile.count({
        where: {
          memberType: TgnMemberType.TEAM_LEADER,
          status: { not: TgnMemberStatus.INACTIVE },
        },
      }),
      prisma.tgnMemberProfile.count({
        where: {
          memberType: TgnMemberType.EXECUTIVE,
          status: { not: TgnMemberStatus.INACTIVE },
        },
      }),
      prisma.tgnTeam.count(),
      prisma.tgnTeam.count({
        where: { status: "ACTIVE" },
      }),
      prisma.tgnApplication.count(),
      prisma.tgnApplication.count({
        where: {
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
        where: {
          OR: [
            { tgnSourceMemberId: { not: null } },
            { tgnOwnerId: { not: null } },
          ],
        },
      }),
      prisma.tgnCommission.count(),
      prisma.tgnCommission.count({
        where: { status: TgnCommissionStatus.PENDING },
      }),
      prisma.tgnCommission.count({
        where: {
          status: {
            in: [
              TgnCommissionStatus.ELIGIBLE,
              TgnCommissionStatus.APPROVED,
            ],
          },
        },
      }),
      prisma.tgnCommission.count({
        where: { status: TgnCommissionStatus.PAID },
      }),
    ]);

    const commissionTotals = await prisma.tgnCommission.groupBy({
      by: ["status"],
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

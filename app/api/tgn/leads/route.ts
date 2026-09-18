import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "";

    const validStatus =
      status &&
      Object.values(LeadStatus).includes(
        status as LeadStatus,
      )
        ? (status as LeadStatus)
        : null;

    const where = {
      OR: [
        {
          tgnSourceMemberId: {
            not: null,
          },
        },
        {
          tgnOwnerId: {
            not: null,
          },
        },
      ],
      ...(validStatus
        ? {
            status: validStatus,
          }
        : {}),
      ...(search
        ? {
            AND: [
              {
                OR: [
                  {
                    fullName: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    phone: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    interestedProgram: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
      include: {
        tgnSourceMember: {
          select: {
            id: true,
            memberType: true,
            referralCode: true,
            status: true,
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
        },
        tgnOwner: {
          select: {
            id: true,
            memberType: true,
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
        },
        admissions: {
          select: {
            id: true,
            admissionNo: true,
            status: true,
            totalFee: true,
            balanceFee: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            admissions: true,
            applications: true,
            counsellingSessions: true,
            registrationPayments: true,
          },
        },
      },
    });

    const [total, statusCounts] =
      await Promise.all([
        prisma.lead.count({
          where: {
            OR: [
              {
                tgnSourceMemberId: {
                  not: null,
                },
              },
              {
                tgnOwnerId: {
                  not: null,
                },
              },
            ],
          },
        }),

        prisma.lead.groupBy({
          by: ["status"],
          where: {
            OR: [
              {
                tgnSourceMemberId: {
                  not: null,
                },
              },
              {
                tgnOwnerId: {
                  not: null,
                },
              },
            ],
          },
          _count: {
            _all: true,
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      leads,
      total,
      statusCounts: statusCounts.reduce<
        Record<string, number>
      >((result, item) => {
        result[item.status] = item._count._all;
        return result;
      }, {}),
    });
  } catch (error) {
    console.error("TGN leads GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load TGN leads.",
      },
      { status: 500 },
    );
  }
}

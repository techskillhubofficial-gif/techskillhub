import { NextResponse } from "next/server";
import { TgnTeamStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
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

    const teams = await prisma.tgnTeam.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        leader: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    const counts = await prisma.tgnTeam.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      success: true,
      teams,
      counts: counts.reduce<Record<string, number>>(
        (result, item) => {
          result[item.status] = item._count._all;
          return result;
        },
        {},
      ),
    });
  } catch (error) {
    console.error("TGN teams GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load TGN teams.",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { TgnMemberStatus, TgnMemberType } from "@prisma/client";

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
    const memberType = searchParams.get("memberType");
    const status = searchParams.get("status");

    const members = await prisma.tgnMemberProfile.findMany({
      where: {
        ...(memberType &&
        Object.values(TgnMemberType).includes(
          memberType as TgnMemberType,
        )
          ? { memberType: memberType as TgnMemberType }
          : {}),
        ...(status &&
        Object.values(TgnMemberStatus).includes(
          status as TgnMemberStatus,
        )
          ? { status: status as TgnMemberStatus }
          : {}),
        ...(search
          ? {
              OR: [
                {
                  user: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  user: {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  referralCode: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        manager: {
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
        team: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error("TGN members GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load TGN members.",
      },
      { status: 500 },
    );
  }
}

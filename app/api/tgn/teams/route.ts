import { NextResponse } from "next/server";
import { TgnTeamStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";
import { getTgnAccessibleMemberIds } from "@/lib/tgn/hierarchy";

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

    const accessibleMemberIds =
      await getTgnAccessibleMemberIds(context);

    const teams = await prisma.tgnTeam.findMany({
      where:
        context.access === "FOUNDER"
          ? undefined
          : {
              OR: [
                {
                  leaderMemberId: {
                    in: accessibleMemberIds,
                  },
                },
                {
                  members: {
                    some: {
                      id: {
                        in: accessibleMemberIds,
                    },
                    },
                  },
                },
              ],
            },
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


export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const code =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const leaderMemberId =
      typeof body.leaderMemberId === "string"
        ? body.leaderMemberId
        : "";

    if (!name || !code || !leaderMemberId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Team name, team code and Team Leader are required.",
        },
        { status: 400 },
      );
    }

    const leader =
      await prisma.tgnMemberProfile.findUnique({
        where: { id: leaderMemberId },
        select: {
          id: true,
          memberType: true,
          status: true,
          managerId: true,
          teamId: true,
          isNetworkManager: true,
        },
      });

    if (!leader) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected Team Leader was not found.",
        },
        { status: 404 },
      );
    }

    if (leader.memberType !== "TEAM_LEADER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only a Team Leader can lead a TGN team.",
        },
        { status: 400 },
      );
    }

    if (leader.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only an active Team Leader can lead a team.",
        },
        { status: 400 },
      );
    }

    const accessibleIds =
      await getTgnAccessibleMemberIds(context);

    if (
      context.access !== "FOUNDER" &&
      !accessibleIds.includes(leader.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected Team Leader is outside your network.",
        },
        { status: 403 },
      );
    }

    if (leader.teamId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This Team Leader already has a team.",
        },
        { status: 409 },
      );
    }

    const existingCode =
      await prisma.tgnTeam.findUnique({
        where: { code },
        select: { id: true },
      });

    if (existingCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A team with this code already exists.",
        },
        { status: 409 },
      );
    }

    const team = await prisma.$transaction(
      async (tx) => {
        const created = await tx.tgnTeam.create({
          data: {
            name,
            code,
            description,
            leaderMemberId: leader.id,
          },
        });

        await tx.tgnMemberProfile.update({
          where: { id: leader.id },
          data: {
            teamId: created.id,
          },
        });

        await tx.tgnAuditEvent.create({
          data: {
            action: "TEAM_CREATED",
            actorUserId: context.userId,
            memberId: leader.id,
            metadata: {
              teamId: created.id,
              name,
              code,
            },
          },
        });

        return tx.tgnTeam.findUnique({
          where: { id: created.id },
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
      },
    );

    return NextResponse.json(
      {
        success: true,
        team,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("TGN team POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create TGN team.",
      },
      { status: 500 },
    );
  }
}

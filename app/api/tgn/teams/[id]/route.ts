import { NextResponse } from "next/server";
import {
  TgnAuditAction,
  TgnMemberStatus,
  TgnMemberType,
  TgnTeamStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";
import { getTgnAccessibleMemberIds } from "@/lib/tgn/hierarchy";

type Params = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

export async function GET(
  _request: Request,
  { params }: Params,
) {
  try {
    const context = await getTgnContext();

    if (!canManageNetwork(context)) {
      return errorResponse(
        "TGN network management access is required.",
        403,
      );
    }

    const { id } = await params;

    const team =
      await prisma.tgnTeam.findUnique({
        where: { id },
        include: {
          leader: {
            select: {
              id: true,
              memberType: true,
              status: true,
              managerId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          members: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              memberType: true,
              status: true,
              managerId: true,
              teamId: true,
              referralCode: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
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

    if (!team) {
      return errorResponse("TGN team not found.", 404);
    }

    const accessibleIds =
      await getTgnAccessibleMemberIds(context);

    if (
      context.access !== "FOUNDER" &&
      !team.leader ||
      (
        context.access !== "FOUNDER" &&
        !accessibleIds.includes(team.leaderMemberId)
      )
    ) {
      return errorResponse(
        "This team is outside your TGN network.",
        403,
      );
    }

    return NextResponse.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("TGN team GET error:", error);
    return errorResponse("Unable to load TGN team.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  try {
    const context = await getTgnContext();

    if (!canManageNetwork(context)) {
      return errorResponse(
        "TGN network management access is required.",
        403,
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const team =
      await prisma.tgnTeam.findUnique({
        where: { id },
        include: {
          leader: {
            select: {
              id: true,
              memberType: true,
              status: true,
              managerId: true,
              teamId: true,
            },
          },
          members: {
            select: {
              id: true,
              memberType: true,
              status: true,
              managerId: true,
              teamId: true,
            },
          },
        },
      });

    if (!team) {
      return errorResponse("TGN team not found.", 404);
    }

    const accessibleIds =
      await getTgnAccessibleMemberIds(context);

    if (
      context.access !== "FOUNDER" &&
      !accessibleIds.includes(team.leaderMemberId)
    ) {
      return errorResponse(
        "This team is outside your TGN network.",
        403,
      );
    }

    const action =
      typeof body.action === "string"
        ? body.action
        : "update";

    /*
     * --------------------------------------------------------
     * TEAM STATUS
     * --------------------------------------------------------
     */
    if (action === "status") {
      const status = body.status as TgnTeamStatus;

      if (!Object.values(TgnTeamStatus).includes(status)) {
        return errorResponse("Invalid team status.");
      }

      const updated =
        await prisma.$transaction(
          async (tx) => {
            const result =
              await tx.tgnTeam.update({
                where: { id },
                data: { status },
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

            await tx.tgnAuditEvent.create({
              data: {
                action: TgnAuditAction.TEAM_UPDATED,
                actorUserId: context.userId,
                memberId: team.leaderMemberId,
                metadata: {
                  teamId: id,
                  action: "status",
                  previousStatus: team.status,
                  nextStatus: status,
                },
              },
            });

            return result;
          },
        );

      return NextResponse.json({
        success: true,
        team: updated,
      });
    }

    /*
     * --------------------------------------------------------
     * TEAM UPDATE / LEADER CHANGE
     * --------------------------------------------------------
     */
    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : undefined;

    const code =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : undefined;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : body.description === null
          ? null
          : undefined;

    const requestedLeaderId =
      typeof body.leaderMemberId === "string"
        ? body.leaderMemberId
        : undefined;

    let nextLeaderId =
      requestedLeaderId ?? team.leaderMemberId;

    if (requestedLeaderId) {
      const leader =
        await prisma.tgnMemberProfile.findUnique({
          where: { id: requestedLeaderId },
          select: {
            id: true,
            memberType: true,
            status: true,
            managerId: true,
            teamId: true,
          },
        });

      if (!leader) {
        return errorResponse(
          "Selected Team Leader was not found.",
          404,
        );
      }

      if (
        leader.memberType !== TgnMemberType.TEAM_LEADER
      ) {
        return errorResponse(
          "A team can only be led by a Team Leader.",
        );
      }

      if (
        leader.status !== TgnMemberStatus.ACTIVE
      ) {
        return errorResponse(
          "The selected Team Leader is not active.",
        );
      }

      if (
        context.access !== "FOUNDER" &&
        !accessibleIds.includes(leader.id)
      ) {
        return errorResponse(
          "The selected Team Leader is outside your network.",
          403,
        );
      }

      if (
        leader.teamId &&
        leader.teamId !== id
      ) {
        return errorResponse(
          "This Team Leader already belongs to another team.",
          409,
        );
      }

      nextLeaderId = leader.id;
    }

    if (code && code !== team.code) {
      const existing =
        await prisma.tgnTeam.findUnique({
          where: { code },
          select: { id: true },
        });

      if (existing && existing.id !== id) {
        return errorResponse(
          "A team with this code already exists.",
          409,
        );
      }
    }

    const updated =
      await prisma.$transaction(
        async (tx) => {
          /*
           * If the leader changes, remove the old
           * leader's team assignment.
           */
          if (
            nextLeaderId !== team.leaderMemberId
          ) {
            await tx.tgnMemberProfile.update({
              where: {
                id: team.leaderMemberId,
              },
              data: {
                teamId: null,
              },
            });
          }

          const result =
            await tx.tgnTeam.update({
              where: { id },
              data: {
                ...(name !== undefined ? { name } : {}),
                ...(code !== undefined ? { code } : {}),
                ...(description !== undefined
                  ? { description }
                  : {}),
                ...(nextLeaderId !== team.leaderMemberId
                  ? {
                      leaderMemberId: nextLeaderId,
                    }
                  : {}),
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

          await tx.tgnMemberProfile.update({
            where: {
              id: nextLeaderId,
            },
            data: {
              teamId: id,
            },
          });

          await tx.tgnAuditEvent.create({
            data: {
              action: TgnAuditAction.TEAM_UPDATED,
              actorUserId: context.userId,
              memberId: nextLeaderId,
              metadata: {
                teamId: id,
                previousLeaderMemberId:
                  team.leaderMemberId,
                nextLeaderMemberId: nextLeaderId,
                name,
                code,
              },
            },
          });

          return result;
        },
      );

    return NextResponse.json({
      success: true,
      team: updated,
    });
  } catch (error) {
    console.error("TGN team PATCH error:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to update TGN team.",
      500,
    );
  }
}

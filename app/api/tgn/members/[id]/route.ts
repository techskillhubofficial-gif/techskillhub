import { NextResponse } from "next/server";
import {
  TgnAuditAction,
  TgnMemberStatus,
  TgnMemberType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";
import {
  getTgnAccessibleMemberIds,
  canManageTgnMember,
} from "@/lib/tgn/hierarchy";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

const allowedStatuses = new Set<TgnMemberStatus>(
  Object.values(TgnMemberStatus),
);

function jsonError(message: string, status = 400) {
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
      return jsonError(
        "TGN network management access is required.",
        403,
      );
    }

    const { id } = await params;

    const accessibleIds =
      await getTgnAccessibleMemberIds(context);

    if (!accessibleIds.includes(id)) {
      return jsonError(
        "This member is outside your TGN network.",
        403,
      );
    }

    const member = await prisma.tgnMemberProfile.findUnique({
      where: { id },
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
            memberType: true,
            status: true,
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
            status: true,
            leaderMemberId: true,
          },
        },
        directReports: {
          select: {
            id: true,
            memberType: true,
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
      },
    });

    if (!member) {
      return jsonError("TGN member not found.", 404);
    }

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("TGN member GET error:", error);
    return jsonError("Unable to load TGN member.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  try {
    const context = await getTgnContext();

    if (!canManageNetwork(context)) {
      return jsonError(
        "TGN network management access is required.",
        403,
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const member = await prisma.tgnMemberProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        manager: {
          select: {
            id: true,
            memberType: true,
            managerId: true,
            teamId: true,
            status: true,
            isNetworkManager: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            leaderMemberId: true,
          },
        },
      },
    });

    if (!member) {
      return jsonError("TGN member not found.", 404);
    }

    if (
      !context ||
      !canManageTgnMember(member)
    ) {
      return jsonError(
        "You cannot manage this TGN member.",
        403,
      );
    }

    const action =
      typeof body.action === "string"
        ? body.action
        : "";

    /*
     * --------------------------------------------------------
     * STATUS
     * --------------------------------------------------------
     */
    if (action === "status") {
      const nextStatus = body.status as TgnMemberStatus;

      if (!allowedStatuses.has(nextStatus)) {
        return jsonError("Invalid member status.");
      }

      if (
        member.isNetworkManager &&
        context.access !== "FOUNDER"
      ) {
        return jsonError(
          "Network Managers can only be managed by the Founder.",
          403,
        );
      }

      const now = new Date();

      const updated = await prisma.$transaction(
        async (tx) => {
          const result =
            await tx.tgnMemberProfile.update({
              where: { id },
              data: {
                status: nextStatus,
                activatedAt:
                  nextStatus === TgnMemberStatus.ACTIVE
                    ? member.activatedAt ?? now
                    : member.activatedAt,
                joinedAt:
                  nextStatus === TgnMemberStatus.ACTIVE
                    ? member.joinedAt ?? now
                    : member.joinedAt,
              },
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

          await tx.tgnAuditEvent.create({
            data: {
              action: TgnAuditAction.MEMBER_STATUS_CHANGED,
              actorUserId: context.userId,
              memberId: member.id,
              metadata: {
                previousStatus: member.status,
                nextStatus,
              },
            },
          });

          return result;
        },
      );

      return NextResponse.json({
        success: true,
        member: updated,
      });
    }

    /*
     * --------------------------------------------------------
     * ASSIGN / REASSIGN
     *
     * TEAM_LEADER:
     *   managerId = Network Manager
     *   teamId    = optional existing team owned by TL
     *
     * EXECUTIVE:
     *   managerId = Team Leader
     *   teamId    = Team Leader's team
     * --------------------------------------------------------
     */
    if (action === "assign") {
      const requestedManagerId =
        typeof body.managerId === "string"
          ? body.managerId
          : null;

      const requestedTeamId =
        typeof body.teamId === "string"
          ? body.teamId
          : null;

      const targetManagerId =
        requestedManagerId === ""
          ? null
          : requestedManagerId;

      const targetTeamId =
        requestedTeamId === ""
          ? null
          : requestedTeamId;

      let targetManager = null;
      let targetTeam = null;

      if (targetManagerId) {
        targetManager =
          await prisma.tgnMemberProfile.findUnique({
            where: { id: targetManagerId },
            select: {
              id: true,
              memberType: true,
              status: true,
              managerId: true,
              teamId: true,
              isNetworkManager: true,
            },
          });

        if (!targetManager) {
          return jsonError("Target manager not found.");
        }

        if (
          targetManager.status === TgnMemberStatus.SUSPENDED ||
          targetManager.status === TgnMemberStatus.INACTIVE
        ) {
          return jsonError(
            "The target manager is not active.",
          );
        }

        /*
         * Founder can assign anywhere.
         * Network Manager can only assign within their
         * own hierarchy.
         */
        const accessibleIds =
          await getTgnAccessibleMemberIds(context);

        if (
          context.access !== "FOUNDER" &&
          !accessibleIds.includes(targetManager.id)
        ) {
          return jsonError(
            "The selected manager is outside your network.",
            403,
          );
        }
      }

      if (targetTeamId) {
        targetTeam =
          await prisma.tgnTeam.findUnique({
            where: { id: targetTeamId },
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
              leaderMemberId: true,
            },
          });

        if (!targetTeam) {
          return jsonError("Target team not found.");
        }

        if (targetTeam.status !== "ACTIVE") {
          return jsonError(
            "Members can only be assigned to an active team.",
          );
        }

        const teamLeader =
          await prisma.tgnMemberProfile.findUnique({
            where: {
              id: targetTeam.leaderMemberId,
            },
            select: {
              id: true,
              memberType: true,
              status: true,
              managerId: true,
              teamId: true,
              isNetworkManager: true,
            },
          });

        if (
          !teamLeader ||
          teamLeader.memberType !== TgnMemberType.TEAM_LEADER
        ) {
          return jsonError(
            "The selected team does not have a valid Team Leader.",
          );
        }

        if (
          teamLeader.status === TgnMemberStatus.SUSPENDED ||
          teamLeader.status === TgnMemberStatus.INACTIVE
        ) {
          return jsonError(
            "The selected Team Leader is not active.",
          );
        }

        const accessibleIds =
          await getTgnAccessibleMemberIds(context);

        if (
          context.access !== "FOUNDER" &&
          !accessibleIds.includes(teamLeader.id)
        ) {
          return jsonError(
            "The selected team is outside your network.",
            403,
          );
        }

        /*
         * Team Leader's team must actually be the selected team.
         */
        if (
          teamLeader.teamId &&
          teamLeader.teamId !== targetTeam.id
        ) {
          return jsonError(
            "The selected team does not belong to this Team Leader.",
          );
        }

        /*
         * Executive assignments must resolve to the
         * Team Leader who owns the selected team.
         */
        if (
          member.memberType === TgnMemberType.EXECUTIVE &&
          targetManagerId !== teamLeader.id
        ) {
          return jsonError(
            "An Executive must report to the Team Leader of the selected team.",
          );
        }
      }

      /*
       * Team Leaders report to a Network Manager.
       * Executives report to a Team Leader.
       */
      if (
        member.memberType === TgnMemberType.TEAM_LEADER &&
        targetManagerId
      ) {
        const manager =
          await prisma.tgnMemberProfile.findUnique({
            where: { id: targetManagerId },
            select: {
              id: true,
              memberType: true,
              isNetworkManager: true,
              status: true,
            },
          });

        if (
          !manager ||
          !manager.isNetworkManager ||
          manager.status !== TgnMemberStatus.ACTIVE
        ) {
          return jsonError(
            "A Team Leader must report to an active Network Manager.",
          );
        }
      }

      if (
        member.memberType === TgnMemberType.EXECUTIVE &&
        targetManagerId
      ) {
        const manager =
          await prisma.tgnMemberProfile.findUnique({
            where: { id: targetManagerId },
            select: {
              id: true,
              memberType: true,
              status: true,
            },
          });

        if (
          !manager ||
          manager.memberType !== TgnMemberType.TEAM_LEADER ||
          manager.status !== TgnMemberStatus.ACTIVE
        ) {
          return jsonError(
            "An Executive must report to an active Team Leader.",
          );
        }
      }

      /*
       * An Executive cannot have a team without a manager.
       */
      if (
        member.memberType === TgnMemberType.EXECUTIVE &&
        targetTeamId &&
        !targetManagerId
      ) {
        return jsonError(
          "An Executive cannot be assigned to a team without a Team Leader.",
        );
      }

      const updated = await prisma.$transaction(
        async (tx) => {
          const result =
            await tx.tgnMemberProfile.update({
              where: { id },
              data: {
                managerId: targetManagerId,
                teamId: targetTeamId,
              },
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

          await tx.tgnAuditEvent.create({
            data: {
              action:
                member.managerId || member.teamId
                  ? TgnAuditAction.MEMBER_REASSIGNED
                  : TgnAuditAction.MEMBER_ASSIGNED,
              actorUserId: context.userId,
              memberId: member.id,
              metadata: {
                previousManagerId: member.managerId,
                previousTeamId: member.teamId,
                nextManagerId: targetManagerId,
                nextTeamId: targetTeamId,
              },
            },
          });

          return result;
        },
      );

      return NextResponse.json({
        success: true,
        member: updated,
      });
    }

    /*
     * --------------------------------------------------------
     * REMOVE FROM TEAM
     * --------------------------------------------------------
     */
    if (action === "remove-team") {
      if (member.memberType === TgnMemberType.EXECUTIVE) {
        return jsonError(
          "An Executive cannot be removed from their Team Leader's team. Reassign the Executive first.",
          400,
        );
      }

      const updated = await prisma.$transaction(
        async (tx) => {
          const result =
            await tx.tgnMemberProfile.update({
              where: { id },
              data: {
                teamId: null,
              },
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

          await tx.tgnAuditEvent.create({
            data: {
              action: TgnAuditAction.MEMBER_REMOVED,
              actorUserId: context.userId,
              memberId: member.id,
              metadata: {
                previousTeamId: member.teamId,
              },
            },
          });

          return result;
        },
      );

      return NextResponse.json({
        success: true,
        member: updated,
      });
    }

    return jsonError(
      "Unsupported member action. Use status, assign, or remove-team.",
    );
  } catch (error) {
    console.error("TGN member PATCH error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unable to update TGN member.",
      500,
    );
  }
}

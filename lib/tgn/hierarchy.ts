import { Prisma, TgnMemberStatus, TgnMemberType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
  type TgnSessionContext,
} from "@/lib/tgn/authorization";

/**
 * Returns all TGN member IDs that belong to the current user's network scope.
 *
 * Founder:
 *   All TGN members.
 *
 * Network Manager:
 *   The manager + all descendants in the manager hierarchy.
 *
 * Team Leader:
 *   The leader + members of the leader's team.
 *
 * Executive:
 *   The executive only.
 *
 * This function intentionally includes inactive/suspended historical members
 * when they belong to the hierarchy so historical lead attribution is not lost.
 */
export async function getTgnAccessibleMemberIds(
  context?: TgnSessionContext | null,
): Promise<string[]> {
  const resolvedContext =
    context === undefined ? await getTgnContext() : context;

  if (!resolvedContext?.memberId && resolvedContext?.access !== "FOUNDER") {
    return [];
  }

  if (resolvedContext.access === "FOUNDER") {
    const members = await prisma.tgnMemberProfile.findMany({
      select: { id: true },
    });

    return members.map((member) => member.id);
  }

  if (
    resolvedContext.access === "NETWORK_MANAGER" &&
    resolvedContext.memberId
  ) {
    const members = await prisma.tgnMemberProfile.findMany({
      select: {
        id: true,
        managerId: true,
      },
    });

    const accessible = new Set<string>([resolvedContext.memberId]);

    let changed = true;

    while (changed) {
      changed = false;

      for (const member of members) {
        if (
          member.managerId &&
          accessible.has(member.managerId) &&
          !accessible.has(member.id)
        ) {
          accessible.add(member.id);
          changed = true;
        }
      }
    }

    return [...accessible];
  }

  if (
    resolvedContext.access === "TEAM_LEADER" &&
    resolvedContext.memberId
  ) {
    const teamLeader = await prisma.tgnMemberProfile.findUnique({
      where: {
        id: resolvedContext.memberId,
      },
      select: {
        id: true,
        teamId: true,
      },
    });

    if (!teamLeader) {
      return [];
    }

    if (!teamLeader.teamId) {
      return [teamLeader.id];
    }

    const members = await prisma.tgnMemberProfile.findMany({
      where: {
        teamId: teamLeader.teamId,
      },
      select: {
        id: true,
      },
    });

    return [
      ...new Set([
        teamLeader.id,
        ...members.map((member) => member.id),
      ]),
    ];
  }

  if (
    resolvedContext.access === "EXECUTIVE" &&
    resolvedContext.memberId
  ) {
    return [resolvedContext.memberId];
  }

  return [];
}

/**
 * Creates the canonical Lead scope for the current TGN user.
 *
 * Source attribution and current ownership are both considered:
 *
 *   tgnSourceMemberId = original referral source
 *   tgnOwnerId        = current responsible owner
 *
 * Reassignment therefore never removes the original source from the
 * Network Manager's historical visibility.
 */
export async function getTgnLeadScope(
  context?: TgnSessionContext | null,
): Promise<Prisma.LeadWhereInput> {
  const resolvedContext =
    context === undefined ? await getTgnContext() : context;

  if (!resolvedContext) {
    return {
      id: "__NO_TGN_ACCESS__",
    };
  }

  if (resolvedContext.access === "FOUNDER") {
    return {
      OR: [
        { tgnSourceMemberId: { not: null } },
        { tgnOwnerId: { not: null } },
      ],
    };
  }

  const memberIds = await getTgnAccessibleMemberIds(resolvedContext);

  if (memberIds.length === 0) {
    return {
      id: "__NO_TGN_ACCESS__",
    };
  }

  return {
    OR: [
      {
        tgnSourceMemberId: {
          in: memberIds,
        },
      },
      {
        tgnOwnerId: {
          in: memberIds,
        },
      },
    ],
  };
}

/**
 * Returns whether a member belongs to the current user's TGN scope.
 */
export async function canAccessTgnMember(
  targetMemberId: string,
  context?: TgnSessionContext | null,
): Promise<boolean> {
  const memberIds = await getTgnAccessibleMemberIds(context);
  return memberIds.includes(targetMemberId);
}

/**
 * Returns whether the current context can manage the target member.
 *
 * Network Manager:
 *   Team Leaders + all Executives in their network.
 *
 * Team Leader:
 *   Executives in their team.
 *
 * Founder:
 *   Everyone.
 */
export async function canManageTgnMember(
  targetMember: {
    id: string;
    memberType: TgnMemberType;
    managerId: string | null;
  },
  context?: TgnSessionContext | null,
): Promise<boolean> {
  const resolvedContext =
    context === undefined ? await getTgnContext() : context;

  if (!resolvedContext) {
    return false;
  }

  if (resolvedContext.access === "FOUNDER") {
    return true;
  }

  if (resolvedContext.access === "NETWORK_MANAGER") {
    return canAccessTgnMember(targetMember.id, resolvedContext);
  }

  if (resolvedContext.access === "TEAM_LEADER") {
    return (
      targetMember.memberType === TgnMemberType.EXECUTIVE &&
      targetMember.managerId === resolvedContext.memberId
    );
  }

  return false;
}

/**
 * Creates a reusable Prisma Lead scope for downstream business records.
 *
 * Example:
 *
 *   prisma.admission.findMany({
 *     where: {
 *       lead: {
 *         ...await getTgnLeadScope(context),
 *       },
 *     },
 *   })
 */
export async function getTgnLeadRelationScope(
  context?: TgnSessionContext | null,
): Promise<{ lead: Prisma.LeadWhereInput }> {
  return {
    lead: await getTgnLeadScope(context),
  };
}

/**
 * True when the supplied context represents a manager-level TGN authority.
 */
export function isTgnManager(
  context: TgnSessionContext | null,
): boolean {
  return (
    context?.access === "FOUNDER" ||
    context?.access === "NETWORK_MANAGER"
  );
}

/**
 * True when the supplied context is an active TGN operational member.
 */
export function isActiveTgnMember(
  context: TgnSessionContext | null,
): boolean {
  return (
    context !== null &&
    context.memberId !== null &&
    context.access !== "FOUNDER"
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TgnMemberType, TgnMemberStatus } from "@prisma/client";

export type TgnAccess =
  | "FOUNDER"
  | "NETWORK_MANAGER"
  | "TEAM_LEADER"
  | "EXECUTIVE";

export interface TgnSessionContext {
  userId: string;
  access: TgnAccess;
  memberId: string | null;
  memberType: TgnMemberType | null;
  teamId: string | null;
  managerId: string | null;
}

export async function getTgnContext(): Promise<TgnSessionContext | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  /*
   * Existing ADMIN users are the highest-level TGN authorities.
   * A TGN profile can additionally identify a Network Manager who
   * operates beneath the Founder while retaining their own team.
   */
  const profile = await prisma.tgnMemberProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      memberType: true,
      status: true,
      managerId: true,
      teamId: true,
      isNetworkManager: true,
    },
  });

  if (session.user.role === "ADMIN" && !profile) {
    return {
      userId,
      access: "FOUNDER",
      memberId: null,
      memberType: null,
      teamId: null,
      managerId: null,
    };
  }

  if (!profile) {
    return null;
  }

  if (
    profile.status === TgnMemberStatus.SUSPENDED ||
    profile.status === TgnMemberStatus.INACTIVE
  ) {
    return null;
  }

  if (session.user.role === "ADMIN" && profile.isNetworkManager) {
    return {
      userId,
      access: "NETWORK_MANAGER",
      memberId: profile.id,
      memberType: profile.memberType,
      teamId: profile.teamId,
      managerId: profile.managerId,
    };
  }

  if (profile.memberType === TgnMemberType.TEAM_LEADER) {
    return {
      userId,
      access: "TEAM_LEADER",
      memberId: profile.id,
      memberType: profile.memberType,
      teamId: profile.teamId,
      managerId: profile.managerId,
    };
  }

  if (profile.memberType === TgnMemberType.EXECUTIVE) {
    return {
      userId,
      access: "EXECUTIVE",
      memberId: profile.id,
      memberType: profile.memberType,
      teamId: profile.teamId,
      managerId: profile.managerId,
    };
  }

  return null;
}

export function canManageNetwork(
  context: TgnSessionContext | null,
): context is TgnSessionContext & {
  access: "FOUNDER" | "NETWORK_MANAGER";
} {
  return (
    context !== null &&
    (context.access === "FOUNDER" ||
      context.access === "NETWORK_MANAGER")
  );
}

export function canManageTeam(
  context: TgnSessionContext | null,
): context is TgnSessionContext & {
  access: "FOUNDER" | "NETWORK_MANAGER" | "TEAM_LEADER";
} {
  return (
    context !== null &&
    (context.access === "FOUNDER" ||
      context.access === "NETWORK_MANAGER" ||
      context.access === "TEAM_LEADER")
  );
}

export function canManageMember(
  context: TgnSessionContext | null,
  targetMember: {
    id: string;
    memberType: TgnMemberType;
    managerId: string | null;
  },
): boolean {
  if (!context) {
    return false;
  }

  if (context.access === "FOUNDER") {
    return true;
  }

  if (context.access === "NETWORK_MANAGER") {
    return (
      targetMember.memberType === TgnMemberType.TEAM_LEADER ||
      targetMember.managerId === context.memberId
    );
  }

  if (context.access === "TEAM_LEADER") {
    return (
      targetMember.managerId === context.memberId &&
      targetMember.memberType === TgnMemberType.EXECUTIVE
    );
  }

  return false;
}

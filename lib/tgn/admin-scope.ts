import { getServerSession } from "next-auth";
import { Prisma, Role } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getTgnContext,
  type TgnSessionContext,
} from "@/lib/tgn/authorization";
import { getTgnLeadScope } from "@/lib/tgn/hierarchy";

export interface AdminTgnScope {
  session: Awaited<ReturnType<typeof getServerSession>>;
  context: TgnSessionContext | null;
  isAuthorized: boolean;
  isNetworkManager: boolean;
  isFounder: boolean;
  isTgnScoped: boolean;
  tgnMemberId: string | null;
  leadWhere: Prisma.LeadWhereInput;
}

const NO_TGN_ACCESS: Prisma.LeadWhereInput = {
  id: "__NO_TGN_ACCESS__",
};

/**
 * Canonical compatibility wrapper for CRM lead routes.
 *
 * Access model:
 * - Founder: normal full CRM access; TGN leadWhere is available separately.
 * - Network Manager: own hierarchy.
 * - Team Leader: own team.
 * - Executive: own leads.
 * - Normal ADMIN without a TGN profile: normal CRM access.
 * - Inactive/suspended TGN account: denied.
 */
export async function getAdminTgnScope(): Promise<AdminTgnScope> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session,
      context: null,
      isAuthorized: false,
      isNetworkManager: false,
      isFounder: false,
      isTgnScoped: false,
      tgnMemberId: null,
      leadWhere: NO_TGN_ACCESS,
    };
  }

  const role = session.user.role;

  const supportedRole =
    role === Role.ADMIN ||
    role === Role.TGN_TEAM_LEADER ||
    role === Role.TGN_EXECUTIVE;

  if (!supportedRole) {
    return {
      session,
      context: null,
      isAuthorized: false,
      isNetworkManager: false,
      isFounder: false,
      isTgnScoped: false,
      tgnMemberId: null,
      leadWhere: NO_TGN_ACCESS,
    };
  }

  const context = await getTgnContext();

  if (!context) {
    // An ADMIN without a TGN profile is a normal CRM administrator.
    // A TGN-role account without context/profile must not fall back to
    // unrestricted CRM access.
    const profile = await prisma.tgnMemberProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    const hasTgnProfile = Boolean(profile);

    return {
      session,
      context: null,
      isAuthorized:
        role === Role.ADMIN && !hasTgnProfile,
      isNetworkManager: false,
      isFounder: false,
      isTgnScoped: hasTgnProfile || role !== Role.ADMIN,
      tgnMemberId: null,
      leadWhere: NO_TGN_ACCESS,
    };
  }

  const isFounder = context.access === "FOUNDER";
  const isNetworkManager = context.access === "NETWORK_MANAGER";

  return {
    session,
    context,
    isAuthorized: true,
    isNetworkManager,
    isFounder,
    isTgnScoped: !isFounder,
    tgnMemberId: context.memberId,
    leadWhere: isFounder
      ? {}
      : await getTgnLeadScope(context),
  };
}

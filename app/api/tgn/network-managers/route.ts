import { NextResponse } from "next/server";
import {
  Role,
  TgnAuditAction,
  TgnMemberStatus,
  TgnMemberType,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  getTgnContext,
} from "@/lib/tgn/authorization";
import {
  createAccountSetupToken,
  getAccountSetupUrl,
  sendTgnAccountSetupEmail,
} from "@/lib/tgn/account-setup";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const context = await getTgnContext();

    if (!context || context.access !== "FOUNDER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Founder access is required to create a Network Manager.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);

    if (name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter the Network Manager's full name.",
        },
        { status: 400 },
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A TechSkillHub account already exists with this email address.",
        },
        { status: 409 },
      );
    }

    const temporaryPassword = randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(
      temporaryPassword,
      12,
    );

    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            phone: phone || null,
            password: passwordHash,
            role: Role.ADMIN,
          },
        });

        const member = await tx.tgnMemberProfile.create({
          data: {
            userId: user.id,
            memberType: TgnMemberType.TEAM_LEADER,
            status: TgnMemberStatus.ONBOARDING,
            isNetworkManager: true,
            managerId: null,
            teamId: null,
            referralCode: null,
            joinedAt: null,
            activatedAt: null,
          },
        });

        await tx.tgnAuditEvent.create({
          data: {
            action: TgnAuditAction.MEMBER_CREATED,
            actorUserId: context.userId,
            memberId: member.id,
            metadata: {
              memberType: "NETWORK_MANAGER",
              email,
              isNetworkManager: true,
              createdByAccess: context.access,
            },
          },
        });

        return {
          userId: user.id,
          memberId: member.id,
        };
      },
    );

    const rawToken = await createAccountSetupToken(
      result.userId,
    );

    const setupUrl = getAccountSetupUrl(rawToken);

    await sendTgnAccountSetupEmail(
      email,
      name,
      "Network Manager",
      setupUrl,
    );

    return NextResponse.json({
      success: true,
      memberId: result.memberId,
      message:
        "Network Manager created and activation email sent.",
    });
  } catch (error) {
    console.error(
      "TGN Network Manager creation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create the Network Manager account.",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  Role,
  TgnApplicationStatus,
  TgnAuditAction,
  TgnMemberStatus,
  TgnMemberType,
  TgnTeamStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";
import {
  createAccountSetupToken,
  getAccountSetupUrl,
  sendTgnAccountSetupEmail,
} from "@/lib/tgn/account-setup";

export const dynamic = "force-dynamic";

function generateReferralCode(name: string) {
  const prefix =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase() || "TGN";

  return `TGN-${prefix}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function generateTeamCode() {
  return `TGN-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function roleLabel(memberType: TgnMemberType) {
  return memberType === TgnMemberType.TEAM_LEADER
    ? "Team Leader"
    : "Growth Executive";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    let body: { teamLeaderMemberId?: string } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const application = await prisma.tgnApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN application not found.",
        },
        { status: 404 },
      );
    }

    if (
      application.status !== TgnApplicationStatus.APPROVED &&
      application.status !== TgnApplicationStatus.ONBOARDING
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only approved or already-onboarding applications can be onboarded.",
        },
        { status: 409 },
      );
    }

    if (
      application.memberType !== TgnMemberType.TEAM_LEADER &&
      application.memberType !== TgnMemberType.EXECUTIVE
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid TGN member type.",
        },
        { status: 400 },
      );
    }

    let assignedTeamLeaderId: string | null = null;
    let assignedTeamId: string | null = null;

    if (application.memberType === TgnMemberType.EXECUTIVE) {
      const teamLeaderMemberId =
        application.sourceMemberId ?? body.teamLeaderMemberId;

      if (!teamLeaderMemberId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This Growth Executive application is not associated with a Team Leader invitation.",
          },
          { status: 400 },
        );
      }

      const teamLeader = await prisma.tgnMemberProfile.findUnique({
        where: {
          id: teamLeaderMemberId,
        },
        select: {
          id: true,
          memberType: true,
          status: true,
          team: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!teamLeader) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected Team Leader was not found.",
          },
          { status: 400 },
        );
      }

      if (teamLeader.memberType !== TgnMemberType.TEAM_LEADER) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected member is not a Team Leader.",
          },
          { status: 400 },
        );
      }

      if (
        teamLeader.status !== TgnMemberStatus.ONBOARDING &&
        teamLeader.status !== TgnMemberStatus.ORIENTATION &&
        teamLeader.status !== TgnMemberStatus.ACTIVE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The selected Team Leader is not currently available for team assignment.",
          },
          { status: 400 },
        );
      }

      if (!teamLeader.team) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The selected Team Leader does not have an active team yet.",
          },
          { status: 400 },
        );
      }

      assignedTeamLeaderId = teamLeader.id;
      assignedTeamId = teamLeader.team.id;
    }

    let user = application.user
      ? await prisma.user.findUnique({
          where: { id: application.user.id },
        })
      : await prisma.user.findUnique({
          where: { email: application.email },
        });

    const userRole =
      application.memberType === TgnMemberType.TEAM_LEADER
        ? Role.TGN_TEAM_LEADER
        : Role.TGN_EXECUTIVE;

    if (!user) {
      const temporaryPassword = randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);

      user = await prisma.user.create({
        data: {
          name: application.name,
          email: application.email,
          phone: application.phone,
          password: passwordHash,
          role: userRole,
        },
      });
    } else if (
      user.role !== userRole &&
      user.role !== Role.ADMIN
    ) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: userRole,
          name: application.name,
          phone: application.phone,
        },
      });
    }

    const existingMember = await prisma.tgnMemberProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        memberType: true,
      },
    });

    if (
      existingMember &&
      existingMember.memberType !== application.memberType
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The existing TGN member profile has a different member type.",
        },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        let member = await tx.tgnMemberProfile.findUnique({
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            memberType: true,
            status: true,
            teamId: true,
            managerId: true,
            joinedAt: true,
          },
        });

        let createdMember = false;
        let createdTeam: {
          id: string;
          name: string;
          code: string;
        } | null = null;

        if (!member) {
          let referralCode = generateReferralCode(application.name);

          for (let attempt = 0; attempt < 10; attempt += 1) {
            const existingReferral =
              await tx.tgnMemberProfile.findUnique({
                where: {
                  referralCode,
                },
                select: {
                  id: true,
                },
              });

            if (!existingReferral) break;

            referralCode = generateReferralCode(application.name);
          }

          member = await tx.tgnMemberProfile.create({
            data: {
              userId: user.id,
              memberType: application.memberType,
              status: TgnMemberStatus.ONBOARDING,
              referralCode,
            },
            select: {
              id: true,
              memberType: true,
              status: true,
              teamId: true,
              managerId: true,
              joinedAt: true,
            },
          });

          createdMember = true;
        } else {
          member = await tx.tgnMemberProfile.update({
            where: {
              id: member.id,
            },
            data: {
              status: TgnMemberStatus.ONBOARDING,
              memberType: application.memberType,
            },
            select: {
              id: true,
              memberType: true,
              status: true,
              teamId: true,
              managerId: true,
              joinedAt: true,
            },
          });
        }

        let teamId = member.teamId;
        let managerId = member.managerId;
        let assignmentChanged = false;

        if (application.memberType === TgnMemberType.TEAM_LEADER) {
          const existingLedTeam = await tx.tgnTeam.findFirst({
            where: {
              leaderMemberId: member.id,
            },
            select: {
              id: true,
            },
          });

          if (existingLedTeam) {
            teamId = existingLedTeam.id;
          } else {
            let teamCode = generateTeamCode();

            for (let attempt = 0; attempt < 10; attempt += 1) {
              const existingCode = await tx.tgnTeam.findUnique({
                where: {
                  code: teamCode,
                },
                select: {
                  id: true,
                },
              });

              if (!existingCode) break;

              teamCode = generateTeamCode();
            }

            const team = await tx.tgnTeam.create({
              data: {
                name: `${application.name.trim()} Team`,
                code: teamCode,
                description:
                  "TechSkillHub Growth Network team led by the onboarded Team Leader.",
                status: TgnTeamStatus.ACTIVE,
                leaderMemberId: member.id,
              },
              select: {
                id: true,
                name: true,
                code: true,
              },
            });

            teamId = team.id;
            createdTeam = team;
          }

          managerId = null;
        } else {
          teamId = assignedTeamId;
          managerId = assignedTeamLeaderId;

          assignmentChanged =
            member.teamId !== assignedTeamId ||
            member.managerId !== assignedTeamLeaderId;
        }

        const updatedMember = await tx.tgnMemberProfile.update({
          where: {
            id: member.id,
          },
          data: {
            status: TgnMemberStatus.ONBOARDING,
            teamId,
            managerId,
            joinedAt: member.joinedAt ?? new Date(),
          },
          select: {
            id: true,
          },
        });

        await tx.tgnApplication.update({
          where: {
            id: application.id,
          },
          data: {
            userId: user.id,
            status: TgnApplicationStatus.ONBOARDING,
          },
        });

        return {
          memberId: updatedMember.id,
          createdMember,
          createdTeam,
          assignmentChanged,
        };
      },
      {
        timeout: 15000,
      },
    );

    const onboardedMember = await prisma.tgnMemberProfile.findUnique({
      where: {
        id: result.memberId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            code: true,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!onboardedMember) {
      throw new Error("Unable to load the onboarded TGN member.");
    }

    try {
      if (result.createdMember) {
        await prisma.tgnAuditEvent.create({
          data: {
            action: TgnAuditAction.MEMBER_CREATED,
            applicationId: application.id,
            actorUserId: context.userId,
            memberId: result.memberId,
            metadata: {
              memberType: application.memberType,
              email: application.email,
            },
          },
        });
      }

      if (result.createdTeam) {
        await prisma.tgnAuditEvent.create({
          data: {
            action: TgnAuditAction.TEAM_CREATED,
            applicationId: application.id,
            actorUserId: context.userId,
            memberId: result.memberId,
            metadata: {
              teamId: result.createdTeam.id,
              teamCode: result.createdTeam.code,
              leaderMemberId: result.memberId,
            },
          },
        });
      }

      if (result.assignmentChanged) {
        await prisma.tgnAuditEvent.create({
          data: {
            action: TgnAuditAction.MEMBER_ASSIGNED,
            applicationId: application.id,
            actorUserId: context.userId,
            memberId: result.memberId,
            metadata: {
              teamId: assignedTeamId,
              teamLeaderMemberId: assignedTeamLeaderId,
              managerId: assignedTeamLeaderId,
            },
          },
        });
      }
    } catch (auditError) {
      console.error("TGN onboarding audit event error:", auditError);
    }

    let setupEmailSent = false;
    let setupEmailError: string | null = null;

    try {
      const setupToken = await createAccountSetupToken(user.id);
      const setupUrl = getAccountSetupUrl(setupToken);

      await sendTgnAccountSetupEmail(
        user.email,
        user.name,
        roleLabel(application.memberType),
        setupUrl,
      );

      setupEmailSent = true;
    } catch (emailError) {
      console.error("TGN account setup email error:", emailError);

      setupEmailError =
        emailError instanceof Error
          ? emailError.message
          : "Unable to send account setup email.";
    }

    return NextResponse.json(
      {
        success: true,
        message: setupEmailSent
          ? "TGN member onboarded successfully. Account setup email sent."
          : "TGN member onboarded successfully. Account setup email could not be sent.",
        setupEmailSent,
        ...(process.env.NODE_ENV !== "production" && setupEmailError
          ? { setupEmailError }
          : {}),
        member: {
          id: onboardedMember.id,
          memberType: onboardedMember.memberType,
          status: onboardedMember.status,
          referralCode: onboardedMember.referralCode,
          team: onboardedMember.team,
          manager: onboardedMember.manager,
          user: onboardedMember.user,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("TGN member onboarding error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to onboard TGN member. Please try again.",
      },
      { status: 500 },
    );
  }
}

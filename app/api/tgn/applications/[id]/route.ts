import { NextResponse } from "next/server";
import {
  TgnApplicationStatus,
  TgnAuditAction,
  TgnMemberStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getTgnContext, canManageNetwork } from "@/lib/tgn/authorization";
import {
  createAccountSetupToken,
  getAccountSetupUrl,
  sendTgnAccountSetupEmail,
} from "@/lib/tgn/account-setup";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function validStatus(value: unknown): value is TgnApplicationStatus {
  return (
    typeof value === "string" &&
    Object.values(TgnApplicationStatus).includes(
      value as TgnApplicationStatus,
    )
  );
}

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const result = value.trim();

  return result.length > 0 ? result : null;
}

function canTransition(
  current: TgnApplicationStatus,
  target: TgnApplicationStatus,
) {
  if (current === target) return true;

  const transitions: Record<
    TgnApplicationStatus,
    TgnApplicationStatus[]
  > = {
    SUBMITTED: [
      TgnApplicationStatus.UNDER_REVIEW,
      TgnApplicationStatus.SHORTLISTED,
      TgnApplicationStatus.INTERVIEW,
      TgnApplicationStatus.APPROVED,
      TgnApplicationStatus.REJECTED,
    ],

    UNDER_REVIEW: [
      TgnApplicationStatus.SHORTLISTED,
      TgnApplicationStatus.INTERVIEW,
      TgnApplicationStatus.APPROVED,
      TgnApplicationStatus.REJECTED,
    ],

    SHORTLISTED: [
      TgnApplicationStatus.INTERVIEW,
      TgnApplicationStatus.APPROVED,
      TgnApplicationStatus.REJECTED,
    ],

    INTERVIEW: [
      TgnApplicationStatus.APPROVED,
      TgnApplicationStatus.REJECTED,
    ],

    APPROVED: [
      TgnApplicationStatus.ONBOARDING,
      TgnApplicationStatus.ORIENTATION,
      TgnApplicationStatus.ACTIVE,
      TgnApplicationStatus.SUSPENDED,
    ],

    ONBOARDING: [
      TgnApplicationStatus.ORIENTATION,
      TgnApplicationStatus.ACTIVE,
      TgnApplicationStatus.SUSPENDED,
    ],

    ORIENTATION: [
      TgnApplicationStatus.ACTIVE,
      TgnApplicationStatus.SUSPENDED,
    ],

    ACTIVE: [
      TgnApplicationStatus.SUSPENDED,
    ],

    SUSPENDED: [
      TgnApplicationStatus.ONBOARDING,
      TgnApplicationStatus.ORIENTATION,
      TgnApplicationStatus.ACTIVE,
    ],

    REJECTED: [],
  };

  return transitions[current]?.includes(target) ?? false;
}

async function getApplication(id: string) {
  return prisma.tgnApplication.findUnique({
    where: { id },
    include: {
      sourceMember: {
        select: {
          id: true,
          memberType: true,
          status: true,
          referralCode: true,
          user: {
            select: {
              id: true,
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
      reviewedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      auditEvents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        select: {
          id: true,
          action: true,
          metadata: true,
          createdAt: true,
          actorUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          member: {
            select: {
              id: true,
              memberType: true,
              status: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const tgnContext = await getTgnContext();

    if (!canManageNetwork(tgnContext)) {
      return errorResponse(
        "TGN network management access is required.",
        403,
      );
    }

    const { id } = await context.params;

    const application = await getApplication(id);

    if (!application) {
      return errorResponse("TGN application not found.", 404);
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("TGN application GET error:", error);

    return errorResponse(
      "Unable to load the TGN application.",
      500,
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const tgnContext = await getTgnContext();

    if (!canManageNetwork(tgnContext)) {
      return errorResponse(
        "TGN network management access is required.",
        403,
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const application = await prisma.tgnApplication.findUnique({
      where: { id },
      select: {
        id: true,
        applicationNo: true,
        memberType: true,
        status: true,
        name: true,
        email: true,
        phone: true,
        sourceMemberId: true,
        userId: true,
      },
    });

    if (!application) {
      return errorResponse("TGN application not found.", 404);
    }

    if (body?.action === "UPDATE_EMAIL") {
      const nextEmail = clean(body?.email)?.toLowerCase() ?? null;

      if (!nextEmail || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(nextEmail)) {
        return errorResponse("Please enter a valid email address.");
      }

      const activeStatuses = [
        TgnApplicationStatus.SUBMITTED,
        TgnApplicationStatus.UNDER_REVIEW,
        TgnApplicationStatus.SHORTLISTED,
        TgnApplicationStatus.INTERVIEW,
        TgnApplicationStatus.APPROVED,
        TgnApplicationStatus.ONBOARDING,
        TgnApplicationStatus.ORIENTATION,
        TgnApplicationStatus.ACTIVE,
      ];

      const duplicateApplication = await prisma.tgnApplication.findFirst({
        where: {
          id: { not: id },
          email: {
            equals: nextEmail,
            mode: "insensitive",
          },
          status: {
            in: activeStatuses,
          },
        },
        select: {
          applicationNo: true,
          status: true,
        },
      });

      if (duplicateApplication) {
        return errorResponse(
          `That email is already linked to active TGN application ${duplicateApplication.applicationNo}.`,
          409,
        );
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: nextEmail,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (existingUser && existingUser.id !== application.userId) {
        return errorResponse(
          "That email address is already linked to another TechSkillHub account.",
          409,
        );
      }

      const updatedApplication = await prisma.$transaction(async (tx) => {
        const updatedRecord = await tx.tgnApplication.update({
          where: { id },
          data: {
            email: nextEmail,
          },
        });

        if (application.userId) {
          await tx.user.update({
            where: {
              id: application.userId,
            },
            data: {
              email: nextEmail,
              emailVerified: false,
            },
          });
        }

        await tx.tgnAuditEvent.create({
          data: {
            action: TgnAuditAction.APPLICATION_REVIEWED,
            applicationId: application.id,
            actorUserId: tgnContext.userId,
            memberId: null,
            metadata: {
              action: "EMAIL_UPDATED",
              previousEmail: application.email,
              newEmail: nextEmail,
            },
          },
        });

        return updatedRecord;
      });

      let activationEmailSent = false;

      if (application.userId) {
        try {
          const rawToken = await createAccountSetupToken(
            application.userId,
          );

          const setupUrl = getAccountSetupUrl(rawToken);

          const roleLabel =
            application.memberType === "TEAM_LEADER"
              ? "Team Leader"
              : "Growth Executive";

          await sendTgnAccountSetupEmail(
            nextEmail,
            application.name,
            roleLabel,
            setupUrl,
          );

          activationEmailSent = true;
        } catch (emailError) {
          console.error(
            "[TGN] Email correction activation send failed:",
            emailError,
          );
        }
      }

      return NextResponse.json({
        success: true,
        emailSent: activationEmailSent,
        message: activationEmailSent
          ? "Email updated successfully. A new account activation email was sent."
          : "Email updated successfully, but the activation email could not be sent. Use the same action again to retry.",
        application: updatedApplication,
      });
    }

    const targetStatus = body?.status;

    if (!validStatus(targetStatus)) {
      return errorResponse(
        "Please provide a valid application status.",
      );
    }

    if (!canTransition(application.status, targetStatus)) {
      return errorResponse(
        `Cannot move application from ${application.status} to ${targetStatus}.`,
        409,
      );
    }

    const reviewNotes = clean(body?.reviewNotes);
    const rejectionReason = clean(body?.rejectionReason);

    if (
      targetStatus === TgnApplicationStatus.REJECTED &&
      !rejectionReason
    ) {
      return errorResponse(
        "A rejection reason is required when rejecting an application.",
      );
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApplication =
        await tx.tgnApplication.update({
          where: { id },
          data: {
            status: targetStatus,
            reviewedById: tgnContext.userId,
            reviewedAt: now,
            reviewNotes:
              reviewNotes !== null
                ? reviewNotes
                : undefined,
            rejectionReason:
              targetStatus === TgnApplicationStatus.REJECTED
                ? rejectionReason
                : null,
            approvedAt:
              targetStatus === TgnApplicationStatus.APPROVED
                ? now
                : undefined,
          },
        });

      let memberId: string | null = null;

      if (
        targetStatus === TgnApplicationStatus.APPROVED &&
        application.userId
      ) {
        const existingProfile =
          await tx.tgnMemberProfile.findUnique({
            where: {
              userId: application.userId,
            },
            select: {
              id: true,
            },
          });

        if (existingProfile) {
          memberId = existingProfile.id;

          await tx.tgnMemberProfile.update({
            where: {
              id: existingProfile.id,
            },
            data: {
              status: TgnMemberStatus.ONBOARDING,
            },
          });
        }
      }

      const auditAction =
        targetStatus === TgnApplicationStatus.APPROVED
          ? TgnAuditAction.APPLICATION_APPROVED
          : targetStatus === TgnApplicationStatus.REJECTED
            ? TgnAuditAction.APPLICATION_REJECTED
            : TgnAuditAction.APPLICATION_REVIEWED;

      await tx.tgnAuditEvent.create({
        data: {
          action: auditAction,
          applicationId: application.id,
          actorUserId: tgnContext.userId,
          memberId,
          metadata: {
            applicationNo: application.applicationNo,
            previousStatus: application.status,
            newStatus: targetStatus,
            reviewNotes,
            rejectionReason:
              targetStatus === TgnApplicationStatus.REJECTED
                ? rejectionReason
                : null,
          },
        },
      });

      return updatedApplication;
    });

    return NextResponse.json({
      success: true,
      message: `Application moved to ${updated.status}.`,
      application: updated,
    });
  } catch (error) {
    console.error("TGN application PATCH error:", error);

    return errorResponse(
      "Unable to update the TGN application.",
      500,
    );
  }
}

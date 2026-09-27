import { NextResponse } from "next/server";
import { LeadActivityType, LeadStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getTgnContext } from "@/lib/tgn/authorization";
import { getTgnAccessibleMemberIds } from "@/lib/tgn/hierarchy";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function canAccessLead(
  leadId: string,
  context: NonNullable<Awaited<ReturnType<typeof getTgnContext>>>,
) {
  const accessibleMemberIds = await getTgnAccessibleMemberIds(context);

  if (accessibleMemberIds === null) {
    return true;
  }

  if (accessibleMemberIds.length === 0) {
    return false;
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      OR: [
        {
          tgnOwnerId: {
            in: accessibleMemberIds,
          },
        },
        {
          tgnSourceMemberId: {
            in: accessibleMemberIds,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(lead);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getTgnContext();

    if (!context) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN access is required.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!(await canAccessLead(id, context))) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this lead.",
        },
        { status: 403 },
      );
    }

    const lead = await prisma.lead.findUnique({
      where: {
        id,
      },
      include: {
        activities: {
          orderBy: {
            createdAt: "desc",
          },
          take: 100,
        },
        followUps: {
          orderBy: {
            scheduledAt: "asc",
          },
          take: 100,
        },
        counsellingSessions: {
          orderBy: {
            scheduledAt: "desc",
          },
          take: 20,
        },
        tgnOwner: {
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
        tgnSourceMember: {
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
        _count: {
          select: {
            admissions: true,
            applications: true,
            counsellingSessions: true,
            registrationPayments: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found.",
        },
        { status: 404 },
      );
    }

    const latestQualification = lead.activities.find((activity) => {
      if (!activity.metadata || typeof activity.metadata !== "object") {
        return false;
      }

      const metadata = activity.metadata as Record<string, unknown>;
      return metadata.kind === "TGN_QUALIFICATION";
    });

    return NextResponse.json({
      success: true,
      lead,
      qualification:
        latestQualification?.metadata &&
        typeof latestQualification.metadata === "object"
          ? (latestQualification.metadata as Record<string, unknown>).qualification ?? null
          : null,
    });
  } catch (error) {
    console.error("TGN member lead GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load the TGN lead.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getTgnContext();

    if (!context) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN access is required.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!(await canAccessLead(id, context))) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this lead.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const existingLead = await prisma.lead.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        currentStatus: true,
        interestedProgram: true,
        careerGoal: true,
        preferredContact: true,
        status: true,
        notes: true,
        tgnOwnerId: true,
        tgnSourceMemberId: true,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found.",
        },
        { status: 404 },
      );
    }

    const updateData: {
      fullName?: string;
      email?: string;
      phone?: string;
      currentStatus?: string;
      interestedProgram?: string;
      careerGoal?: string | null;
      preferredContact?: string;
      notes?: string | null;
      status?: LeadStatus;
      lastContactedAt?: Date;
    } = {};

    const changedFields: Record<string, string | null> = {};

    const fullName = clean(body.fullName);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const currentStatus = clean(body.currentStatus);
    const interestedProgram = clean(body.interestedProgram);
    const careerGoal = clean(body.careerGoal);
    const preferredContact = clean(body.preferredContact);
    const notes = clean(body.notes);
    const requestedStatus = clean(body.status).toUpperCase();

    if (fullName && fullName !== existingLead.fullName) {
      updateData.fullName = fullName;
      changedFields.fullName = fullName;
    }

    if (email && email !== existingLead.email) {
      updateData.email = email;
      changedFields.email = email;
    }

    if (phone && phone !== existingLead.phone) {
      updateData.phone = phone;
      changedFields.phone = phone;
    }

    if (
      currentStatus &&
      currentStatus !== existingLead.currentStatus
    ) {
      updateData.currentStatus = currentStatus;
      changedFields.currentStatus = currentStatus;
    }

    if (
      interestedProgram &&
      interestedProgram !== existingLead.interestedProgram
    ) {
      updateData.interestedProgram = interestedProgram;
      changedFields.interestedProgram = interestedProgram;
    }

    if (careerGoal !== existingLead.careerGoal) {
      updateData.careerGoal = careerGoal || null;
      changedFields.careerGoal = careerGoal || null;
    }

    if (
      preferredContact &&
      preferredContact !== existingLead.preferredContact
    ) {
      updateData.preferredContact = preferredContact;
      changedFields.preferredContact = preferredContact;
    }

    if (notes !== existingLead.notes) {
      updateData.notes = notes || null;
      changedFields.notes = notes || null;
    }

    if (requestedStatus) {
      if (
        !Object.values(LeadStatus).includes(
          requestedStatus as LeadStatus,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid lead status.",
          },
          { status: 400 },
        );
      }

      if (requestedStatus !== existingLead.status) {
        updateData.status = requestedStatus as LeadStatus;
      }
    }

    const contactAction = clean(body.contactAction).toUpperCase();

    const validContactActions = new Set([
      "CALL",
      "WHATSAPP",
      "EMAIL",
    ]);

    if (
      contactAction &&
      !validContactActions.has(contactAction)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact action.",
        },
        { status: 400 },
      );
    }

    const qualificationBody =
      body.qualification &&
      typeof body.qualification === "object" &&
      !Array.isArray(body.qualification)
        ? body.qualification
        : null;

    const qualification = qualificationBody
      ? {
          educationLevel: clean(
            qualificationBody.educationLevel,
          ),
          institution: clean(
            qualificationBody.institution,
          ),
          graduationYear: clean(
            qualificationBody.graduationYear,
          ),
          currentOccupation: clean(
            qualificationBody.currentOccupation,
          ),
          workExperience: clean(
            qualificationBody.workExperience,
          ),
          currentSkillLevel: clean(
            qualificationBody.currentSkillLevel,
          ),
          requirement: clean(
            qualificationBody.requirement,
          ),
          mainObjection: clean(
            qualificationBody.mainObjection,
          ),
          decisionTimeline: clean(
            qualificationBody.decisionTimeline,
          ),
          temperature: clean(
            qualificationBody.temperature,
          ).toUpperCase(),
          nextAction: clean(
            qualificationBody.nextAction,
          ),
        }
      : null;

    const hasQualification =
      qualification !== null &&
      Object.values(qualification).some(Boolean);

    const activityNote = clean(body.activityNote);

    const followUpBody =
      body.followUp &&
      typeof body.followUp === "object" &&
      !Array.isArray(body.followUp)
        ? body.followUp
        : null;

    let followUpInput: {
      scheduledAt: Date;
      note: string | null;
      assignedTo: string | null;
    } | null = null;

    if (followUpBody) {
      const scheduledAtValue = clean(
        followUpBody.scheduledAt,
      );

      const scheduledAt = new Date(scheduledAtValue);

      if (
        !scheduledAtValue ||
        Number.isNaN(scheduledAt.getTime())
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide a valid follow-up date and time.",
          },
          { status: 400 },
        );
      }

      const requestedAssignee = clean(
        followUpBody.assignedTo,
      );

      let assignedTo = requestedAssignee || context.memberId;

      if (requestedAssignee) {
        const accessibleMemberIds =
          await getTgnAccessibleMemberIds(context);

        if (
          accessibleMemberIds !== null &&
          !accessibleMemberIds.includes(requestedAssignee)
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "You cannot assign this follow-up to that member.",
            },
            { status: 403 },
          );
        }
      }

      followUpInput = {
        scheduledAt,
        note:
          clean(followUpBody.note) || null,
        assignedTo: assignedTo || null,
      };
    }

    const updated = await prisma.$transaction(
      async (tx) => {
        const lead = await tx.lead.update({
          where: {
            id,
          },
          data: {
            ...updateData,
            ...(contactAction
              ? {
                  lastContactedAt: new Date(),
                }
              : {}),
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            currentStatus: true,
            interestedProgram: true,
            careerGoal: true,
            preferredContact: true,
            status: true,
            notes: true,
            lastContactedAt: true,
            tgnOwnerId: true,
            tgnSourceMemberId: true,
            updatedAt: true,
          },
        });

        const activities = [];

        if (requestedStatus && requestedStatus !== existingLead.status) {
          activities.push({
            leadId: id,
            type: LeadActivityType.STATUS_CHANGED,
            title: `Lead status changed to ${requestedStatus}`,
            description: activityNote || `Status changed from ${existingLead.status} to ${requestedStatus}.`,
            metadata: {
              previousStatus: existingLead.status,
              status: requestedStatus,
              actorMemberId: context.memberId,
              actorAccess: context.access,
            },
            createdBy: context.memberId,
          });
        }

        if (Object.keys(changedFields).length > 0) {
          activities.push({
            leadId: id,
            type: LeadActivityType.UPDATED,
            title: "Lead details updated",
            description: activityNote || "Lead information was updated from the TGN workspace.",
            metadata: {
              changes: changedFields,
              actorMemberId: context.memberId,
              actorAccess: context.access,
            },
            createdBy: context.memberId,
          });
        }

        if (hasQualification && qualification) {
          activities.push({
            leadId: id,
            type: LeadActivityType.UPDATED,
            title: "TGN qualification updated",
            description:
              activityNote ||
              "Lead qualification information was updated.",
            metadata: {
              kind: "TGN_QUALIFICATION",
              qualification,
              actorMemberId: context.memberId,
              actorAccess: context.access,
            },
            createdBy: context.memberId,
          });
        }

        if (followUpInput) {
          const followUp = await tx.leadFollowUp.create({
            data: {
              leadId: id,
              scheduledAt: followUpInput.scheduledAt,
              note: followUpInput.note,
              assignedTo: followUpInput.assignedTo,
            },
          });

          activities.push({
            leadId: id,
            type: LeadActivityType.FOLLOW_UP_CREATED,
            title: "Follow-up scheduled",
            description:
              followUpInput.note ||
              "A new follow-up was scheduled for this lead.",
            metadata: {
              followUpId: followUp.id,
              scheduledAt:
                followUpInput.scheduledAt.toISOString(),
              assignedTo:
                followUpInput.assignedTo,
              actorMemberId: context.memberId,
              actorAccess: context.access,
            },
            createdBy: context.memberId,
          });
        }

        if (contactAction) {
          const activityType =
            contactAction === "CALL"
              ? LeadActivityType.CALL
              : contactAction === "WHATSAPP"
                ? LeadActivityType.WHATSAPP
                : LeadActivityType.EMAIL;

          activities.push({
            leadId: id,
            type: activityType,
            title: `${contactAction} contact`,
            description:
              activityNote ||
              `Lead contacted through ${contactAction.toLowerCase()}.`,
            metadata: {
              actorMemberId: context.memberId,
              actorAccess: context.access,
            },
            createdBy: context.memberId,
          });
        }

        if (activities.length > 0) {
          await tx.leadActivity.createMany({
            data: activities,
          });
        }

        return lead;
      },
    );

    return NextResponse.json({
      success: true,
      lead: updated,
      message: "TGN lead updated successfully.",
    });
  } catch (error) {
    console.error("TGN member lead PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update the TGN lead.",
      },
      { status: 500 },
    );
  }
}

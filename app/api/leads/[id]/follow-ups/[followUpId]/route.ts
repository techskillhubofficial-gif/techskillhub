import { NextResponse } from "next/server";
import {
  LeadActivityType,
  LeadFollowUpStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { UpdateLeadFollowUpSchema } from "@/lib/validations/lead";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
    followUpId: string;
  }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id, followUpId } = await context.params;

    const existingFollowUp = await prisma.leadFollowUp.findFirst({
      where: {
        id: followUpId,
        leadId: id,
      },
    });

    if (!existingFollowUp) {
      return NextResponse.json(
        {
          error: "Follow-up not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body = await request.json();

    const parsed = UpdateLeadFollowUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid follow-up data.",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data: Prisma.LeadFollowUpUpdateInput = {};

    if (parsed.data.status !== undefined) {
      data.status = parsed.data.status as LeadFollowUpStatus;
    }

    if (parsed.data.note !== undefined) {
      data.note = parsed.data.note || null;
    }

    if (parsed.data.scheduledAt !== undefined) {
      data.scheduledAt = new Date(parsed.data.scheduledAt);
    }

    if (parsed.data.assignedTo !== undefined) {
      data.assignedTo = parsed.data.assignedTo || null;
    }

    const updatedFollowUp = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.leadFollowUp.update({
          where: {
            id: followUpId,
          },
          data,
        });

        let activityType: LeadActivityType;
        let activityTitle: string;
        let activityDescription: string;

        if (
          parsed.data.status === LeadFollowUpStatus.COMPLETED
        ) {
          activityType =
            LeadActivityType.FOLLOW_UP_COMPLETED;
          activityTitle = "Follow-up completed";
          activityDescription =
            parsed.data.note ||
            "Scheduled follow-up was completed.";
        } else if (
          parsed.data.status === LeadFollowUpStatus.CANCELLED
        ) {
          activityType =
            LeadActivityType.FOLLOW_UP_CANCELLED;
          activityTitle = "Follow-up cancelled";
          activityDescription =
            parsed.data.note ||
            "Scheduled follow-up was cancelled.";
        } else if (
          parsed.data.status === LeadFollowUpStatus.PENDING
        ) {
          activityType =
            LeadActivityType.FOLLOW_UP_CREATED;
          activityTitle = "Follow-up updated";
          activityDescription =
            parsed.data.note ||
            "Scheduled follow-up was updated.";
        } else {
          activityType =
            LeadActivityType.FOLLOW_UP_CREATED;
          activityTitle = "Follow-up updated";
          activityDescription =
            parsed.data.note ||
            "Scheduled follow-up details were updated.";
        }

        await tx.leadActivity.create({
          data: {
            leadId: id,
            type: activityType,
            title: activityTitle,
            description: activityDescription,
},
        });

        return updated;
      },
    );

    return NextResponse.json({
      followUp: updatedFollowUp,
    });
  } catch (error) {
    console.error(
      "PATCH /api/leads/[id]/follow-ups/[followUpId] error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to update follow-up.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id, followUpId } = await context.params;

    const existingFollowUp = await prisma.leadFollowUp.findFirst({
      where: {
        id: followUpId,
        leadId: id,
      },
    });

    if (!existingFollowUp) {
      return NextResponse.json(
        {
          error: "Follow-up not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.leadFollowUp.delete({
        where: {
          id: followUpId,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: id,
          type: LeadActivityType.FOLLOW_UP_CANCELLED,
          title: "Follow-up deleted",
          description: "Scheduled follow-up was deleted.",
},
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/leads/[id]/follow-ups/[followUpId] error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to delete follow-up.",
      },
      {
        status: 500,
      },
    );
  }
}
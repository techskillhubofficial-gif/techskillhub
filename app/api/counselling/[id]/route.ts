import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACTIVE_STATUSES = new Set([
  "SCHEDULED",
  "RESCHEDULED",
]);

const ALLOWED_ACTIONS = new Set([
  "COMPLETE",
  "NO_SHOW",
  "CANCEL",
  "RESCHEDULE",
  "UPDATE",
]);

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      message: "Administrator access is required.",
    },
    { status: 401 },
  );
}

function parseScheduledAt(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const raw = value.trim();

  if (!raw.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(raw)) {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);

    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);

    return new Date(
      Date.UTC(year, month - 1, day, hour, minute) -
        5.5 * 60 * 60 * 1000,
    );
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return unauthorized();
    }

    const { id } = await context.params;

    const body = (await request.json()) as {
      action?: unknown;
      scheduledAt?: unknown;
      meetingLink?: unknown;
      notes?: unknown;
      outcome?: unknown;
      nextAction?: unknown;
    };

    const action =
      typeof body.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid counselling action.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.counsellingSession.findUnique({
      where: {
        id,
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Counselling session not found.",
        },
        { status: 404 },
      );
    }

    const isActive = ACTIVE_STATUSES.has(existing.status);

    if (
      ["COMPLETE", "NO_SHOW", "CANCEL", "RESCHEDULE"].includes(
        action,
      ) &&
      !isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only scheduled or rescheduled sessions can receive this action.",
        },
        { status: 409 },
      );
    }

    const data: {
      status?: string;
      scheduledAt?: Date;
      meetingLink?: string | null;
      notes?: string | null;
      outcome?: string | null;
      nextAction?: string | null;
    } = {};

    let activityTitle = "Counselling updated";
    let activityDescription = "Counselling details updated.";

    if (action === "COMPLETE") {
      data.status = "COMPLETED";
      data.outcome = cleanString(body.outcome);
      data.nextAction = cleanString(body.nextAction);
      data.notes = cleanString(body.notes);

      activityTitle = "Counselling completed";
      activityDescription = `Counselling completed for ${existing.lead.fullName}.`;
    }

    if (action === "NO_SHOW") {
      data.status = "NO_SHOW";
      data.outcome = cleanString(body.outcome);
      data.nextAction = cleanString(body.nextAction);
      data.notes = cleanString(body.notes);

      activityTitle = "Counselling marked no-show";
      activityDescription = `Counselling marked as no-show for ${existing.lead.fullName}.`;
    }

    if (action === "CANCEL") {
      data.status = "CANCELLED";
      data.notes = cleanString(body.notes);

      activityTitle = "Counselling cancelled";
      activityDescription = `Counselling cancelled for ${existing.lead.fullName}.`;
    }

    if (action === "RESCHEDULE") {
      const scheduledAt = parseScheduledAt(body.scheduledAt);

      if (!scheduledAt) {
        return NextResponse.json(
          {
            success: false,
            message: "Please select a valid new counselling date and time.",
          },
          { status: 400 },
        );
      }

      if (scheduledAt.getTime() <= Date.now()) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Rescheduled counselling must be in the future.",
          },
          { status: 400 },
        );
      }

      data.status = "RESCHEDULED";
      data.scheduledAt = scheduledAt;
      data.meetingLink = cleanString(body.meetingLink);
      data.notes = cleanString(body.notes);

      activityTitle = "Counselling rescheduled";
      activityDescription = `Counselling rescheduled for ${existing.lead.fullName}.`;
    }

    if (action === "UPDATE") {
      if (body.meetingLink !== undefined) {
        data.meetingLink = cleanString(body.meetingLink);
      }

      if (body.notes !== undefined) {
        data.notes = cleanString(body.notes);
      }

      if (body.outcome !== undefined) {
        data.outcome = cleanString(body.outcome);
      }

      if (body.nextAction !== undefined) {
        data.nextAction = cleanString(body.nextAction);
      }

      activityTitle = "Counselling details updated";
      activityDescription = `Counselling details updated for ${existing.lead.fullName}.`;
    }

    const updated = await prisma.$transaction(
      async (tx) => {
        const counsellingSession =
          await tx.counsellingSession.update({
            where: {
              id,
            },
            data,
          });

        await tx.leadActivity.create({
          data: {
            leadId: existing.leadId,
            type: "UPDATED",
            title: activityTitle,
            description: activityDescription,
            metadata: {
              counsellingSessionId: id,
              action,
              status: counsellingSession.status,
              scheduledAt:
                counsellingSession.scheduledAt.toISOString(),
            },
            createdBy: session.user.id,
          },
        });

        return counsellingSession;
      },
    );

    const counsellor = updated.counsellorId
      ? await prisma.user.findUnique({
          where: {
            id: updated.counsellorId,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : null;

    return NextResponse.json({
      success: true,
      message:
        action === "COMPLETE"
          ? "Counselling marked as completed."
          : action === "NO_SHOW"
            ? "Counselling marked as no-show."
            : action === "CANCEL"
              ? "Counselling cancelled."
              : action === "RESCHEDULE"
                ? "Counselling rescheduled."
                : "Counselling updated.",
      session: {
        ...updated,
        counsellor,
      },
    });
  } catch (error) {
    console.error("Counselling PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update counselling session.",
      },
      { status: 500 },
    );
  }
}

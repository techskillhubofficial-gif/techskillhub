import { NextResponse } from "next/server";
import { LeadActivityType, LeadFollowUpStatus,  } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { LeadFollowUpSchema } from "@/lib/validations/lead";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const lead = await prisma.lead.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        {
          error: "Lead not found.",
        },
        {
          status: 404,
        },
      );
    }

    const followUps = await prisma.leadFollowUp.findMany({
      where: {
        leadId: id,
      },
      orderBy: [
        {
          scheduledAt: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      followUps,
    });
  } catch (error) {
    console.error(
      "GET /api/leads/[id]/follow-ups error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to fetch follow-ups.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const lead = await prisma.lead.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        {
          error: "Lead not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body = await request.json();

    const parsed = LeadFollowUpSchema.safeParse(body);

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

    const followUp = await prisma.$transaction(
      async (tx) => {
        const created = await tx.leadFollowUp.create({
          data: {
            leadId: id,
            scheduledAt: new Date(
              parsed.data.scheduledAt,
            ),
            note: parsed.data.note || null,
            assignedTo: parsed.data.assignedTo || null,
            status: LeadFollowUpStatus.PENDING,
          },
        });

        await tx.leadActivity.create({
          data: {
            leadId: id,
            type: LeadActivityType.FOLLOW_UP_CREATED,
            title: "Follow-up scheduled",
            description:
              parsed.data.note ||
              `Follow-up scheduled for ${new Intl.DateTimeFormat(
                "en-IN",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                },
              ).format(
                new Date(parsed.data.scheduledAt),
              )}.`,
},
        });

        return created;
      },
    );

    return NextResponse.json(
      {
        followUp,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/leads/[id]/follow-ups error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to create follow-up.",
      },
      {
        status: 500,
      },
    );
  }
}
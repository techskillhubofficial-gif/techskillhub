import { NextResponse } from "next/server";
import {
  LeadActivityType,
  LeadStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  LeadActivitySchema,
  UpdateLeadSchema,
} from "@/lib/validations/lead";
import {
  getMatchedIdentifiers,
  normalizeLeadIdentifiers,
} from "@/lib/leads/normalization";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    Object.values(LeadStatus).includes(
      value as LeadStatus,
    )
  );
}

interface DuplicateLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  interestedProgram: string;
  createdAt: Date;
  emailMatched: boolean;
  phoneMatched: boolean;
}

async function findDuplicateLead({
  email,
  phone,
  excludeId,
}: {
  email: string;
  phone: string;
  excludeId: string;
}): Promise<DuplicateLead | null> {
  const normalized = normalizeLeadIdentifiers({
    email,
    phone,
  });

  if (!normalized.email && !normalized.phone) {
    return null;
  }

  const normalizedPhoneExpression = Prisma.sql`
    CASE
      WHEN length(
        regexp_replace("phone", '[^0-9]', '', 'g')
      ) = 10
        THEN '91' ||
          regexp_replace("phone", '[^0-9]', '', 'g')

      WHEN
        length(
          regexp_replace("phone", '[^0-9]', '', 'g')
        ) = 11
        AND regexp_replace(
          "phone",
          '[^0-9]',
          '',
          'g'
        ) LIKE '0%'
        THEN '91' ||
          substring(
            regexp_replace(
              "phone",
              '[^0-9]',
              '',
              'g'
            )
            FROM 2
          )

      ELSE regexp_replace(
        "phone",
        '[^0-9]',
        '',
        'g'
      )
    END
  `;

  const emailCondition = normalized.email
    ? Prisma.sql`
        LOWER(TRIM("email")) = ${normalized.email}
      `
    : Prisma.sql`FALSE`;

  const phoneCondition = normalized.phone
    ? Prisma.sql`
        ${normalizedPhoneExpression} = ${normalized.phone}
      `
    : Prisma.sql`FALSE`;

  const duplicates =
    await prisma.$queryRaw<DuplicateLead[]>(
      Prisma.sql`
        SELECT
          "id",
          "fullName",
          "email",
          "phone",
          "status",
          "interestedProgram",
          "createdAt",
          (${emailCondition})
            AS "emailMatched",
          (${phoneCondition})
            AS "phoneMatched"
        FROM "Lead"
        WHERE
          "id" <> ${excludeId}
          AND (
            ${emailCondition}
            OR
            ${phoneCondition}
          )
        ORDER BY "createdAt" DESC
        LIMIT 1
      `,
    );

  return duplicates[0] ?? null;
}

function duplicateResponse(
  duplicate: DuplicateLead,
) {
  const matchedBy =
    getMatchedIdentifiers({
      emailMatched:
        duplicate.emailMatched,
      phoneMatched:
        duplicate.phoneMatched,
    });

  return NextResponse.json(
    {
      success: false,
      message:
        "A possible duplicate lead already exists.",
      code: "DUPLICATE_LEAD",

      duplicate: {
        id: duplicate.id,
        fullName: duplicate.fullName,
        email: duplicate.email,
        phone: duplicate.phone,
        status: duplicate.status,
        interestedProgram:
          duplicate.interestedProgram,
        createdAt: duplicate.createdAt,
        matchedBy,
      },
    },
    {
      status: 409,
    },
  );
}

/**
 * GET /api/leads/[id]
 *
 * Returns:
 * - lead information
 * - complete activity timeline
 * - follow-ups
 * - activity/follow-up counts
 */
export async function GET(
  _req: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return jsonError(
        "Lead ID is required",
      );
    }

    const lead =
      await prisma.lead.findUnique({
        where: {
          id: id.trim(),
        },
        include: {
          activities: {
            orderBy: {
              createdAt: "desc",
            },
          },

          followUps: {
            orderBy: {
              scheduledAt: "asc",
            },
          },

          _count: {
            select: {
              activities: true,
              followUps: true,
            },
          },
        },
      });

    if (!lead) {
      return jsonError(
        "Lead not found",
        404,
      );
    }

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error(
      "GET Lead Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch lead",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/leads/[id]
 *
 * Updates an individual lead profile.
 *
 * Duplicate protection:
 * - Runs when email or phone changes.
 * - Excludes the current lead.
 * - Supports allowDuplicate=true when the CRM
 *   user explicitly chooses "Create/Save anyway".
 */
export async function PATCH(
  req: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return jsonError(
        "Lead ID is required",
      );
    }

    const leadId = id.trim();

    const existingLead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },
      });

    if (!existingLead) {
      return jsonError(
        "Lead not found",
        404,
      );
    }

    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError(
        "Invalid request body",
      );
    }

    const requestBody =
      body as Record<string, unknown>;

    const allowDuplicate =
      requestBody.allowDuplicate === true;

    const {
      allowDuplicate: _allowDuplicate,
      ...leadBody
    } = requestBody;

    const parsed =
      UpdateLeadSchema.safeParse(
        leadBody,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please check the lead details",
          errors:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (
      data.status !== undefined &&
      !isLeadStatus(data.status)
    ) {
      return jsonError(
        "Invalid lead status",
      );
    }

    /*
     * Only check for duplicates when an identity
     * field is actually being changed.
     */
    if (
      !allowDuplicate &&
      (
        data.email !== undefined ||
        data.phone !== undefined
      )
    ) {
      const duplicate =
        await findDuplicateLead({
          email:
            data.email ??
            existingLead.email,

          phone:
            data.phone ??
            existingLead.phone,

          excludeId: leadId,
        });

      if (duplicate) {
        return duplicateResponse(
          duplicate,
        );
      }
    }

    const updateData:
      Prisma.LeadUpdateInput = {};

    if (data.fullName !== undefined) {
      updateData.fullName =
        data.fullName;
    }

    if (data.email !== undefined) {
      updateData.email =
        data.email;
    }

    if (data.phone !== undefined) {
      updateData.phone =
        data.phone;
    }

    if (
      data.currentStatus !== undefined
    ) {
      updateData.currentStatus =
        data.currentStatus;
    }

    if (
      data.interestedProgram !==
      undefined
    ) {
      updateData.interestedProgram =
        data.interestedProgram;
    }

    if (data.careerGoal !== undefined) {
      updateData.careerGoal =
        normalizeOptionalString(
          data.careerGoal,
        );
    }

    if (
      data.preferredContact !==
      undefined
    ) {
      updateData.preferredContact =
        data.preferredContact;
    }

    if (data.source !== undefined) {
      updateData.source =
        normalizeOptionalString(
          data.source,
        );
    }

    if (data.notes !== undefined) {
      updateData.notes =
        normalizeOptionalString(
          data.notes,
        );
    }

    if (
      data.assignedTo !== undefined
    ) {
      updateData.assignedTo =
        normalizeOptionalString(
          data.assignedTo,
        );
    }

    if (
      data.closedReason !== undefined
    ) {
      updateData.closedReason =
        normalizeOptionalString(
          data.closedReason,
        );
    }

    if (data.status !== undefined) {
      updateData.status =
        data.status;

      if (
        data.status ===
        LeadStatus.CLOSED
      ) {
        updateData.closedReason =
          normalizeOptionalString(
            data.closedReason,
          ) ??
          existingLead.closedReason;
      }

      if (
        data.status !==
        LeadStatus.CLOSED
      ) {
        updateData.closedReason =
          null;
      }

      if (
        data.status ===
          LeadStatus.CONTACTED ||
        data.status ===
          LeadStatus.QUALIFIED ||
        data.status ===
          LeadStatus.ENROLLED
      ) {
        updateData.lastContactedAt =
          new Date();
      }
    }

    const activityEntries:
      Prisma.LeadActivityCreateWithoutLeadInput[] =
      [];

    if (
      data.status !== undefined &&
      data.status !== existingLead.status
    ) {
      activityEntries.push({
        type:
          LeadActivityType.STATUS_CHANGED,

        title:
          `Status changed to ${data.status}`,

        description:
          `Lead status changed from ${existingLead.status} to ${data.status}.`,
      });
    }

    if (
      data.notes !== undefined &&
      data.notes !== existingLead.notes
    ) {
      activityEntries.push({
        type: existingLead.notes
          ? LeadActivityType.NOTE_UPDATED
          : LeadActivityType.NOTE_ADDED,

        title: existingLead.notes
          ? "Lead note updated"
          : "Lead note added",

        description:
          data.notes ||
          "Lead note was cleared.",
      });
    }

    if (
      data.assignedTo !== undefined &&
      data.assignedTo !==
        existingLead.assignedTo
    ) {
      activityEntries.push({
        type:
          LeadActivityType.ASSIGNED,

        title: data.assignedTo
          ? "Lead assigned"
          : "Lead assignment removed",

        description: data.assignedTo
          ? `Lead assigned to ${data.assignedTo}.`
          : "Lead assignment was removed.",
      });
    }

    const changedCoreFields =
      data.fullName !== undefined ||
      data.email !== undefined ||
      data.phone !== undefined ||
      data.currentStatus !==
        undefined ||
      data.interestedProgram !==
        undefined ||
      data.careerGoal !== undefined ||
      data.preferredContact !==
        undefined ||
      data.source !== undefined ||
      data.closedReason !== undefined;

    if (changedCoreFields) {
      activityEntries.push({
        type:
          LeadActivityType.UPDATED,

        title:
          "Lead information updated",

        description:
          allowDuplicate &&
          (
            data.email !==
              undefined ||
            data.phone !==
              undefined
          )
            ? "Lead profile information was updated after a duplicate warning was overridden."
            : "Lead profile information was updated.",
      });
    }

    if (
      Object.keys(updateData).length ===
      0
    ) {
      return NextResponse.json({
        success: true,
        message: "No changes were made",
        lead: existingLead,
      });
    }

    const updatedLead =
      await prisma.lead.update({
        where: {
          id: leadId,
        },

        data: {
          ...updateData,

          ...(activityEntries.length >
          0
            ? {
                activities: {
                  create:
                    activityEntries,
                },
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Lead updated successfully",
      lead: updatedLead,
      duplicateOverride:
        allowDuplicate,
    });
  } catch (error) {
    console.error(
      "PATCH Lead Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update lead",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/leads/[id]
 */
export async function DELETE(
  _req: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return jsonError(
        "Lead ID is required",
      );
    }

    const leadId = id.trim();

    const existingLead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },
        select: {
          id: true,
        },
      });

    if (!existingLead) {
      return jsonError(
        "Lead not found",
        404,
      );
    }

    await prisma.lead.delete({
      where: {
        id: leadId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Lead deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE Lead Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete lead",
      },
      { status: 500 },
    );
  }
}
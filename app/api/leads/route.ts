import { NextResponse } from "next/server";
import {
  LeadActivityType,
  LeadStatus,
  Prisma,
  TgnMemberStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateLeadSchema,
  LeadStatusSchema,
  UpdateLeadSchema,
} from "@/lib/validations/lead";
import {
  getMatchedIdentifiers,
  normalizeLeadIdentifiers,
} from "@/lib/leads/normalization";

export const dynamic = "force-dynamic";

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

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    Object.values(LeadStatus).includes(value as LeadStatus)
  );
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function buildLeadSearchWhere(
  search: string,
  status: string,
): Prisma.LeadWhereInput {
  const normalizedSearch = search.trim();

  const where: Prisma.LeadWhereInput = {};

  if (normalizedSearch) {
    where.OR = [
      {
        fullName: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        interestedProgram: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        currentStatus: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        source: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        assignedTo: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
    ];
  }

  if (isLeadStatus(status)) {
    where.status = status;
  }

  return where;
}

async function getLeadStats() {
  const [counts, total] = await Promise.all([
    prisma.lead.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.lead.count(),
  ]);

  return {
    total,
    new:
      counts.find(
        (item) => item.status === LeadStatus.NEW,
      )?._count._all ?? 0,

    contacted:
      counts.find(
        (item) => item.status === LeadStatus.CONTACTED,
      )?._count._all ?? 0,

    qualified:
      counts.find(
        (item) => item.status === LeadStatus.QUALIFIED,
      )?._count._all ?? 0,

    enrolled:
      counts.find(
        (item) => item.status === LeadStatus.ENROLLED,
      )?._count._all ?? 0,

    closed:
      counts.find(
        (item) => item.status === LeadStatus.CLOSED,
      )?._count._all ?? 0,
  };
}

/**
 * Finds a possible duplicate using normalized email and phone values.
 *
 * Email:
 *   Case-insensitive + surrounding whitespace ignored.
 *
 * Phone:
 *   Formatting characters ignored.
 *   Common Indian 10/11/12 digit formats are normalized to 91XXXXXXXXXX.
 *
 * excludeId:
 *   Used when editing an existing lead so the lead does not match itself.
 */
async function findDuplicateLead({
  email,
  phone,
  excludeId,
}: {
  email: string;
  phone: string;
  excludeId?: string;
}): Promise<DuplicateLead | null> {
  const normalized = normalizeLeadIdentifiers({
    email,
    phone,
  });

  if (!normalized.email && !normalized.phone) {
    return null;
  }

  /*
   * PostgreSQL expression that converts common phone formats to the same
   * normalized Indian representation.
   *
   * Examples:
   *   9876543210      -> 919876543210
   *   09876543210     -> 919876543210
   *   919876543210    -> 919876543210
   *   +91 98765 43210 -> 919876543210
   */
  const normalizedPhoneExpression = Prisma.sql`
    CASE
      WHEN length(regexp_replace("phone", '[^0-9]', '', 'g')) = 10
        THEN '91' || regexp_replace("phone", '[^0-9]', '', 'g')
      WHEN
        length(regexp_replace("phone", '[^0-9]', '', 'g')) = 11
        AND regexp_replace("phone", '[^0-9]', '', 'g') LIKE '0%'
        THEN '91' || substring(
          regexp_replace("phone", '[^0-9]', '', 'g')
          FROM 2
        )
      ELSE regexp_replace("phone", '[^0-9]', '', 'g')
    END
  `;

  const emailCondition = normalized.email
    ? Prisma.sql`LOWER(TRIM("email")) = ${normalized.email}`
    : Prisma.sql`FALSE`;

  const phoneCondition = normalized.phone
    ? Prisma.sql`${normalizedPhoneExpression} = ${normalized.phone}`
    : Prisma.sql`FALSE`;

  const excludeCondition = excludeId
    ? Prisma.sql`AND "id" <> ${excludeId}`
    : Prisma.empty;

  const duplicates = await prisma.$queryRaw<DuplicateLead[]>(Prisma.sql`
    SELECT
      "id",
      "fullName",
      "email",
      "phone",
      "status",
      "interestedProgram",
      "createdAt",
      (${emailCondition}) AS "emailMatched",
      (${phoneCondition}) AS "phoneMatched"
    FROM "Lead"
    WHERE
      (
        ${emailCondition}
        OR
        ${phoneCondition}
      )
      ${excludeCondition}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `);

  return duplicates[0] ?? null;
}

function duplicateResponse(duplicate: DuplicateLead) {
  const matchedBy = getMatchedIdentifiers({
    emailMatched: duplicate.emailMatched,
    phoneMatched: duplicate.phoneMatched,
  });

  return NextResponse.json(
    {
      success: false,
      message: "A possible duplicate lead already exists.",
      code: "DUPLICATE_LEAD",
      duplicate: {
        id: duplicate.id,
        fullName: duplicate.fullName,
        email: duplicate.email,
        phone: duplicate.phone,
        status: duplicate.status,
        interestedProgram: duplicate.interestedProgram,
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
 * GET /api/leads
 *
 * Supports:
 * ?search=rahul
 * ?status=QUALIFIED
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "";

    if (status && !isLeadStatus(status)) {
      return jsonError("Invalid lead status");
    }

    const where = buildLeadSearchWhere(
      search,
      status,
    );

    const [leads, stats] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          followUps: {
            where: {
              status: "PENDING",
            },
            orderBy: {
              scheduledAt: "asc",
            },
            take: 1,
          },
          _count: {
            select: {
              activities: true,
              followUps: true,
            },
          },
        },
      }),

      getLeadStats(),
    ]);

    return NextResponse.json({
      success: true,
      leads,
      stats,
    });
  } catch (error) {
    console.error("GET Leads Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch leads",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/leads
 *
 * Creates a lead and its initial CRM activity.
 *
 * Duplicate protection:
 * - Returns 409 when email or phone matches an existing lead.
 * - The UI can explicitly retry with allowDuplicate=true.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError("Invalid request body");
    }

    const requestBody = body as Record<string, unknown>;

    const allowDuplicate =
      requestBody.allowDuplicate === true;

    const referralCodeFromBody =
      typeof requestBody.referralCode === "string"
        ? requestBody.referralCode.trim()
        : typeof requestBody.ref === "string"
          ? requestBody.ref.trim()
          : "";

    const referralCodeFromQuery =
      new URL(req.url).searchParams.get("ref")?.trim() ?? "";

    const referralCode =
      referralCodeFromBody || referralCodeFromQuery;

    const {
      allowDuplicate: _allowDuplicate,
      referralCode: _referralCode,
      ref: _ref,
      ...leadBody
    } = requestBody;

    const parsed =
      CreateLeadSchema.safeParse(leadBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the lead details",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const requestedSource =
      normalizeOptionalString(data.source);

    let tgnSourceMember:
      | {
          id: string;
          referralCode: string | null;
          memberType: string;
          status: TgnMemberStatus;
        }
      | null = null;

    if (referralCode) {
      tgnSourceMember =
        await prisma.tgnMemberProfile.findFirst({
          where: {
            referralCode: referralCode,
            status: TgnMemberStatus.ACTIVE,
          },
          select: {
            id: true,
            referralCode: true,
            memberType: true,
            status: true,
          },
        });

      if (!tgnSourceMember) {
        return jsonError(
          "Invalid or inactive TGN referral code",
        );
      }
    }

    if (
      requestedSource?.toUpperCase() === "TGN" &&
      !tgnSourceMember
    ) {
      return jsonError(
        "A valid TGN referral code is required for TGN leads",
      );
    }

    if (!allowDuplicate) {
      const duplicate = await findDuplicateLead({
        email: data.email,
        phone: data.phone,
      });

      if (duplicate) {
        return duplicateResponse(duplicate);
      }
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        currentStatus: data.currentStatus,
        interestedProgram: data.interestedProgram,
        careerGoal:
          normalizeOptionalString(data.careerGoal),
        preferredContact: data.preferredContact,
        source: tgnSourceMember
          ? "TGN"
          : requestedSource,
        notes:
          normalizeOptionalString(data.notes),
        assignedTo:
          normalizeOptionalString(data.assignedTo),

        ...(tgnSourceMember
          ? {
              tgnSourceMember: {
                connect: {
                  id: tgnSourceMember.id,
                },
              },
            }
          : {}),

        activities: {
          create: [
            {
              type: LeadActivityType.LEAD_CREATED,
              title: "Lead created",
              description:
                `${data.fullName} was added to the CRM.`,
            },
            ...(tgnSourceMember
              ? [
                  {
                    type: LeadActivityType.NOTE_ADDED,
                    title: "TGN referral attribution recorded",
                    description:
                      `Lead attributed to TGN ${tgnSourceMember.memberType.replaceAll("_", " ").toLowerCase()} via referral code ${tgnSourceMember.referralCode ?? referralCode}.`,
                  },
                ]
              : []),
          ],
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: allowDuplicate
          ? "Lead created successfully as a duplicate."
          : "Lead created successfully",
        lead,
        duplicateOverride: allowDuplicate,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Lead Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create lead",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/leads
 *
 * Updates an existing lead.
 *
 * Duplicate protection runs only when email or phone is being changed.
 * The current lead is excluded from the duplicate search.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError("Invalid request body");
    }

    const requestBody =
      body as Record<string, unknown>;

    if (
      typeof requestBody.id !== "string" ||
      !requestBody.id.trim()
    ) {
      return jsonError("Lead ID is required");
    }

    const leadId = requestBody.id.trim();

    const existingLead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },
      });

    if (!existingLead) {
      return jsonError("Lead not found", 404);
    }

    const updateBody = {
      fullName: requestBody.fullName,
      email: requestBody.email,
      phone: requestBody.phone,
      currentStatus:
        requestBody.currentStatus,
      interestedProgram:
        requestBody.interestedProgram,
      careerGoal:
        requestBody.careerGoal,
      preferredContact:
        requestBody.preferredContact,
      status: requestBody.status,
      source: requestBody.source,
      notes: requestBody.notes,
      assignedTo:
        requestBody.assignedTo,
      closedReason:
        requestBody.closedReason,
    };

    const parsed =
      UpdateLeadSchema.safeParse(updateBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the lead details",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (
      parsed.data.status !== undefined &&
      !LeadStatusSchema.safeParse(
        parsed.data.status,
      ).success
    ) {
      return jsonError("Invalid lead status");
    }

    const data = parsed.data;

    /*
     * Only perform duplicate detection when one of the
     * identity fields is actually being changed.
     */
    if (
      data.email !== undefined ||
      data.phone !== undefined
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
        return duplicateResponse(duplicate);
      }
    }

    const nextStatus = data.status;

    const updateData: Prisma.LeadUpdateInput = {};

    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    if (data.currentStatus !== undefined) {
      updateData.currentStatus =
        data.currentStatus;
    }

    if (
      data.interestedProgram !== undefined
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
      data.preferredContact !== undefined
    ) {
      updateData.preferredContact =
        data.preferredContact;
    }

    if (data.source !== undefined) {
      updateData.source =
        normalizeOptionalString(data.source);
    }

    if (data.notes !== undefined) {
      updateData.notes =
        normalizeOptionalString(data.notes);
    }

    if (data.assignedTo !== undefined) {
      updateData.assignedTo =
        normalizeOptionalString(
          data.assignedTo,
        );
    }

    if (data.closedReason !== undefined) {
      updateData.closedReason =
        normalizeOptionalString(
          data.closedReason,
        );
    }

    if (nextStatus !== undefined) {
      updateData.status = nextStatus;

      if (nextStatus === LeadStatus.CLOSED) {
        updateData.closedReason =
          normalizeOptionalString(
            data.closedReason,
          ) ??
          existingLead.closedReason;
      }

      if (nextStatus !== LeadStatus.CLOSED) {
        updateData.closedReason = null;
      }
    }

    const activityEntries:
      Prisma.LeadActivityCreateWithoutLeadInput[] =
      [];

    if (
      nextStatus !== undefined &&
      nextStatus !== existingLead.status
    ) {
      activityEntries.push({
        type:
          LeadActivityType.STATUS_CHANGED,
        title:
          `Status changed to ${nextStatus}`,
        description:
          `Lead status changed from ${existingLead.status} to ${nextStatus}.`,
      });

      if (
        nextStatus ===
          LeadStatus.CONTACTED ||
        nextStatus ===
          LeadStatus.QUALIFIED ||
        nextStatus ===
          LeadStatus.ENROLLED
      ) {
        updateData.lastContactedAt =
          new Date();
      }
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
      data.currentStatus !== undefined ||
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
          "Lead profile information was updated.",
      });
    }

    if (
      Object.keys(updateData).length === 0
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

          ...(activityEntries.length > 0
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
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("PATCH Lead Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update lead",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/leads?id=leadId
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id")?.trim();

    if (!id) {
      return jsonError(
        "Lead ID is required",
      );
    }

    const existingLead =
      await prisma.lead.findUnique({
        where: {
          id,
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
        id,
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
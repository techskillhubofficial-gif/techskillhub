import { NextResponse } from "next/server";
import {
  TgnApplicationStatus,
  TgnAuditAction,
  TgnMemberStatus,
  TgnMemberType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length > 0 ? result : null;
}

function validMemberType(value: unknown): value is TgnMemberType {
  return (
    value === TgnMemberType.TEAM_LEADER ||
    value === TgnMemberType.EXECUTIVE
  );
}

function validUrl(value: unknown): string | null {
  const result = clean(value);

  if (!result) return null;

  try {
    const url = new URL(result);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

function generateApplicationNo() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `TSH-TGN-${year}-${random}`;
}

async function uniqueApplicationNo() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const applicationNo = generateApplicationNo();

    const existing = await prisma.tgnApplication.findUnique({
      where: { applicationNo },
      select: { id: true },
    });

    if (!existing) {
      return applicationNo;
    }
  }

  throw new Error("Unable to generate a unique application number.");
}

export async function GET(request: Request) {
  try {
    const { getTgnContext, canManageNetwork } = await import(
      "@/lib/tgn/authorization"
    );

    const tgnContext = await getTgnContext();

    if (!canManageNetwork(tgnContext)) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN network management access is required.",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const memberTypeParam = searchParams.get("memberType");
    const search = clean(searchParams.get("search"));

    const status =
      statusParam &&
      Object.values(TgnApplicationStatus).includes(
        statusParam as TgnApplicationStatus,
      )
        ? (statusParam as TgnApplicationStatus)
        : undefined;

    const memberType =
      memberTypeParam &&
      validMemberType(memberTypeParam)
        ? (memberTypeParam as TgnMemberType)
        : undefined;

    const applications =
      await prisma.tgnApplication.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(memberType ? { memberType } : {}),
          ...(search
            ? {
                OR: [
                  {
                    applicationNo: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    phone: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
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
          _count: {
            select: {
              auditEvents: true,
            },
          },
        },
      });

    const counts = await prisma.tgnApplication.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      success: true,
      applications,
      counts: counts.reduce(
        (result, item) => {
          result[item.status] = item._count._all;
          return result;
        },
        {} as Record<string, number>,
      ),
    });
  } catch (error) {
    console.error("TGN applications GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load TGN applications.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const memberType = body?.memberType;

    if (!validMemberType(memberType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid TGN role.",
        },
        { status: 400 },
      );
    }

    const name = clean(body?.name);
    const email = clean(body?.email)?.toLowerCase() ?? null;
    const phone = clean(body?.phone);

    if (!name || name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your full name.",
        },
        { status: 400 },
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        { status: 400 },
      );
    }

    const responsibilitiesAccepted =
      body?.responsibilitiesAccepted === true;

    const declarationsAccepted =
      body?.declarationsAccepted === true;

    const marketingPolicyAccepted =
      body?.marketingPolicyAccepted === true;

    const termsAccepted =
      body?.termsAccepted === true;

    if (
      !responsibilitiesAccepted ||
      !declarationsAccepted ||
      !marketingPolicyAccepted ||
      !termsAccepted
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must accept all required responsibilities and declarations.",
        },
        { status: 400 },
      );
    }

    const existingActiveApplication =
      await prisma.tgnApplication.findFirst({
        where: {
          email,
          status: {
            in: [
              TgnApplicationStatus.SUBMITTED,
              TgnApplicationStatus.UNDER_REVIEW,
              TgnApplicationStatus.SHORTLISTED,
              TgnApplicationStatus.INTERVIEW,
              TgnApplicationStatus.APPROVED,
              TgnApplicationStatus.ONBOARDING,
              TgnApplicationStatus.ORIENTATION,
              TgnApplicationStatus.ACTIVE,
            ],
          },
        },
        select: {
          applicationNo: true,
          status: true,
        },
      });

    if (existingActiveApplication) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An active TGN application already exists for this email address.",
          applicationNo: existingActiveApplication.applicationNo,
          status: existingActiveApplication.status,
        },
        { status: 409 },
      );
    }

    const sourceCode = clean(body?.ref);

    let sourceMemberId: string | null = null;

    if (memberType === TgnMemberType.EXECUTIVE && !sourceCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Growth Executive applications require a valid Team Leader invitation link.",
        },
        { status: 400 },
      );
    }

    if (sourceCode) {
      const sourceMember = await prisma.tgnMemberProfile.findUnique({
        where: {
          referralCode: sourceCode,
        },
        select: {
          id: true,
          memberType: true,
          status: true,
        },
      });

      if (!sourceMember) {
        return NextResponse.json(
          {
            success: false,
            message: "The Team Leader invitation link is invalid or expired.",
          },
          { status: 400 },
        );
      }

      if (
        memberType === TgnMemberType.EXECUTIVE &&
        sourceMember.memberType !== TgnMemberType.TEAM_LEADER
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This invitation is not a valid Growth Executive recruitment link.",
          },
          { status: 400 },
        );
      }

      if (
        memberType === TgnMemberType.EXECUTIVE &&
        sourceMember.status !== TgnMemberStatus.ONBOARDING &&
        sourceMember.status !== TgnMemberStatus.ORIENTATION &&
        sourceMember.status !== TgnMemberStatus.ACTIVE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This Team Leader is not currently available to recruit Growth Executives.",
          },
          { status: 400 },
        );
      }

      sourceMemberId = sourceMember.id;
    }

    const applicationNo = await uniqueApplicationNo();

    const declarationSnapshot = {
      responsibilities: [
        "Recruit or participate in the assigned TGN team structure according to the selected role.",
        "Follow TechSkillHub campaigns, operational instructions, training and reporting processes.",
        "Use accurate and approved information when communicating with prospects.",
        "Do not make false, misleading or unauthorized claims.",
        "Maintain professional communication and protect confidential information.",
      ],
      declarations: [
        "The information submitted is accurate and complete.",
        "Submitting a lead does not guarantee admission or commission.",
        "Commission is applicable only when the required TechSkillHub conditions are fulfilled and verified.",
        "TechSkillHub may review, approve, reject, suspend or terminate participation according to its policies.",
      ],
      marketingPolicy: [
        "No spam, fake leads, fraud or misleading promotions.",
        "No unauthorized promises regarding courses, placements, income, discounts or admissions.",
      ],
      terms: [
        "The applicant agrees to follow the applicable TGN operating processes.",
      ],
      acceptedAt: new Date().toISOString(),
    };

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.tgnApplication.create({
        data: {
          applicationNo,
          memberType,
          status: TgnApplicationStatus.SUBMITTED,

          name,
          email,
          phone,

          city: clean(body?.city),
          state: clean(body?.state),

          education: clean(body?.education),
          occupation: clean(body?.occupation),
          organization: clean(body?.organization),
          experience: clean(body?.experience),
          availability: clean(body?.availability),
          workingMode: clean(body?.workingMode),

          leadershipExperience: clean(body?.leadershipExperience),
          previousTeamSize:
            typeof body?.previousTeamSize === "number" &&
            Number.isInteger(body.previousTeamSize) &&
            body.previousTeamSize >= 0
              ? body.previousTeamSize
              : null,

          expectedTeamSize:
            typeof body?.expectedTeamSize === "number" &&
            Number.isInteger(body.expectedTeamSize) &&
            body.expectedTeamSize >= 0
              ? body.expectedTeamSize
              : null,

          linkedinUrl: validUrl(body?.linkedinUrl),
          instagramUrl: validUrl(body?.instagramUrl),
          portfolioUrl: validUrl(body?.portfolioUrl),

          responsibilitiesAccepted,
          declarationsAccepted,
          marketingPolicyAccepted,
          termsAccepted,

          declarationSnapshot,

          sourceMemberId,
        },
      });

      await tx.tgnAuditEvent.create({
        data: {
          action: TgnAuditAction.APPLICATION_SUBMITTED,
          applicationId: created.id,
          memberId: sourceMemberId,
          metadata: {
            sourceCode,
            memberType,
          },
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your TGN application has been submitted successfully.",
        application: {
          id: application.id,
          applicationNo: application.applicationNo,
          memberType: application.memberType,
          status: application.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("TGN application submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit the TGN application.",
      },
      { status: 500 },
    );
  }
}

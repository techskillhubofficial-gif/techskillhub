import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getTgnContext } from "@/lib/tgn/authorization";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request: Request) {
  try {
    const context = await getTgnContext();

    if (
      !context ||
      !context.memberId ||
      (context.access !== "TEAM_LEADER" &&
        context.access !== "EXECUTIVE")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "TGN member access is required.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const fullName = clean(body.fullName);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const interestedProgram = clean(
      body.interestedProgram,
    );
    const currentStatus =
      clean(body.currentStatus) || "New lead";
    const careerGoal = clean(body.careerGoal);
    const notes = clean(body.notes);
    const preferredContact =
      clean(body.preferredContact) || "WHATSAPP";

    if (fullName.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter the lead's full name.",
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

    if (phone.length < 7) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        { status: 400 },
      );
    }

    if (!interestedProgram) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter the interested program.",
        },
        { status: 400 },
      );
    }

    const duplicate = await prisma.lead.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
          {
            phone,
          },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          code: "DUPLICATE_LEAD",
          message:
            "A lead with this email or phone number already exists.",
          duplicate,
        },
        { status: 409 },
      );
    }

    const lead = await prisma.lead.create({
      data: {
        fullName,
        email,
        phone,
        currentStatus,
        interestedProgram,
        careerGoal: careerGoal || null,
        preferredContact,
        status: LeadStatus.NEW,
        source: "TGN",
        notes: notes || null,
        tgnOwnerId: context.memberId,
        tgnSourceMemberId: context.memberId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        interestedProgram: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      lead,
      message: "Lead added to the TechSkillHub CRM.",
    });
  } catch (error) {
    console.error("TGN member lead POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create the lead.",
      },
      { status: 500 },
    );
  }
}

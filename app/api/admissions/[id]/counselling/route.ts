import { NextResponse } from "next/server";
import { LeadActivityType, Role } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminTgnScope } from "@/lib/tgn/admin-scope";
import { sendCounsellingScheduledEmail } from "@/lib/counselling-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  // The counselling UI uses <input type="datetime-local">.
  // Interpret timezone-less values as India Standard Time so a
  // browser value like 15:00 stays 15:00 IST on the server.
  if (!raw.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(raw)) {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);

    if (!match) {
      return null;
    }

    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
    ] = match.map(Number);

    const utcMilliseconds =
      Date.UTC(year, month - 1, day, hour, minute) -
      5.5 * 60 * 60 * 1000;

    return new Date(utcMilliseconds);
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const adminScope = await getAdminTgnScope();

    if (!adminScope.isAuthorized) {
      return unauthorized();
    }

    const { id } = await context.params;

    const admission = await prisma.admission.findFirst({
      where: {
        id,
        ...(adminScope.isTgnScoped
          ? {
              lead: {
                is: adminScope.leadWhere,
              },
            }
          : {}),
      },
      select: {
        id: true,
        leadId: true,
      },
    });

    if (!admission?.leadId) {
      return NextResponse.json({
        success: true,
        scheduleAvailable: false,
        administrators: [],
        sessions: [],
        message:
          "This admission is not connected to a CRM lead yet.",
      });
    }

    const [administrators, sessions] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: Role.ADMIN,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
      prisma.counsellingSession.findMany({
        where: {
          leadId: admission.leadId,
        },
        orderBy: {
          scheduledAt: "desc",
        },
        select: {
          id: true,
          scheduledAt: true,
          durationMinutes: true,
          mode: true,
          meetingLink: true,
          status: true,
          notes: true,
          outcome: true,
          nextAction: true,
          counsellorId: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      scheduleAvailable: true,
      administrators,
      sessions: sessions.map((item) => ({
        ...item,
        counsellor:
          administrators.find(
            (administrator) => administrator.id === item.counsellorId,
          ) ?? null,
      })),
    });
  } catch (error) {
    console.error("Counselling GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load counselling data.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const adminScope = await getAdminTgnScope();

    if (!adminScope.isAuthorized) {
      return unauthorized();
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return unauthorized();
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      counsellorId?: unknown;
      scheduledAt?: unknown;
      durationMinutes?: unknown;
      mode?: unknown;
      meetingLink?: unknown;
      notes?: unknown;
    };

    if (
      typeof body.counsellorId !== "string" ||
      body.counsellorId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an administrator.",
        },
        { status: 400 },
      );
    }

    const scheduledAt = parseScheduledAt(body.scheduledAt);

    if (!scheduledAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid counselling date and time.",
        },
        { status: 400 },
      );
    }

    if (scheduledAt.getTime() <= Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: "Counselling must be scheduled for a future time.",
        },
        { status: 400 },
      );
    }

    const durationMinutes =
      typeof body.durationMinutes === "number"
        ? body.durationMinutes
        : Number(body.durationMinutes ?? 30);

    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 240
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration must be between 1 and 240 minutes.",
        },
        { status: 400 },
      );
    }

    const mode =
      body.mode === "IN_PERSON" ? "IN_PERSON" : "ONLINE";

    const meetingLink =
      typeof body.meetingLink === "string"
        ? body.meetingLink.trim() || null
        : null;

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim() || null
        : null;

    if (mode === "ONLINE" && !meetingLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Please add the meeting link for an online session.",
        },
        { status: 400 },
      );
    }

    const [admission, administrator] = await Promise.all([
      prisma.admission.findFirst({
        where: {
          id,
          ...(adminScope.isTgnScoped
            ? {
                lead: {
                  is: adminScope.leadWhere,
                },
              }
            : {}),
        },
        select: {
          id: true,
          admissionNo: true,
          studentName: true,
          studentEmail: true,
          studentPhone: true,
          program: true,
          leadId: true,
          lead: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              interestedProgram: true,
            },
          },
        },
      }),
      prisma.user.findFirst({
        where: {
          id: body.counsellorId.trim(),
          role: Role.ADMIN,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

    if (!admission) {
      return NextResponse.json(
        {
          success: false,
          message: "Admission not found.",
        },
        { status: 404 },
      );
    }

    if (!admission.leadId || !admission.lead) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This admission is not connected to a CRM lead yet.",
        },
        { status: 400 },
      );
    }

    if (!administrator) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected administrator was not found.",
        },
        { status: 400 },
      );
    }

    const counsellingSession =
      await prisma.counsellingSession.create({
        data: {
          leadId: admission.leadId,
          counsellorId: administrator.id,
          scheduledAt,
          durationMinutes: Math.round(durationMinutes),
          mode,
          meetingLink,
          status: "SCHEDULED",
          notes,
        },
      });

    await prisma.leadActivity.create({
      data: {
        leadId: admission.leadId,
        type: LeadActivityType.UPDATED,
        title: "Counselling scheduled",
        description: `Counselling scheduled with ${administrator.name || administrator.email}.`,
        metadata: {
          counsellingSessionId: counsellingSession.id,
          admissionId: admission.id,
          admissionNo: admission.admissionNo,
          counsellorId: administrator.id,
          counsellorEmail: administrator.email,
          scheduledAt: scheduledAt.toISOString(),
          mode,
          durationMinutes: Math.round(durationMinutes),
        },
        createdBy: session.user.id,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      "https://techskillhub.online";

    const admissionUrl = `${baseUrl}/dashboard/admissions`;

    let emailSent = false;

    try {
      await sendCounsellingScheduledEmail({
        recipientEmail: administrator.email,
        recipientName: administrator.name || "Administrator",
        leadName:
          admission.lead.fullName ||
          admission.studentName ||
          "Student",
        leadEmail:
          admission.lead.email ||
          admission.studentEmail,
        leadPhone:
          admission.lead.phone ||
          admission.studentPhone,
        program:
          admission.lead.interestedProgram ||
          admission.program,
        scheduledAt,
        durationMinutes: Math.round(durationMinutes),
        mode,
        meetingLink,
        notes,
        scheduledBy: session.user.name || session.user.email || "Administrator",
        admissionUrl,
      });

      emailSent = true;
    } catch (emailError) {
      console.error(
        "Counselling notification email failed:",
        emailError,
      );
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Counselling scheduled and email notification sent."
        : "Counselling scheduled. Email notification could not be sent.",
      session: {
        ...counsellingSession,
        counsellor: administrator,
      },
    });
  } catch (error) {
    console.error("Counselling POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to schedule counselling.",
      },
      { status: 500 },
    );
  }
}

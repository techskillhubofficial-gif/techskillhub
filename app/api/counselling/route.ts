import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const upcomingOnly = searchParams.get("upcoming") === "true";
    const requestedLimit = Number(searchParams.get("limit") || "");
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 200)
        : 100;

    const now = new Date();

    const sessions = await prisma.counsellingSession.findMany({
      where: {
        ...(upcomingOnly
          ? {
              scheduledAt: {
                gte: now,
              },
              status: {
                in: ["SCHEDULED", "RESCHEDULED"],
              },
            }
          : {}),
      },
      orderBy: {
        scheduledAt: upcomingOnly ? "asc" : "desc",
      },
      take: limit,
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
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            interestedProgram: true,
            status: true,
            admissions: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              select: {
                id: true,
                admissionNo: true,
                studentName: true,
                program: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const counsellorIds = Array.from(
      new Set(
        sessions
          .map((item) => item.counsellorId)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const administrators =
      counsellorIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: counsellorIds,
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          })
        : [];

    const counsellorMap = new Map(
      administrators.map((administrator) => [
        administrator.id,
        administrator,
      ]),
    );

    return NextResponse.json({
      success: true,
      notificationEmail:
        process.env.COUNSELLING_NOTIFICATION_EMAIL?.trim() || null,
      sessions: sessions.map((item) => ({
        ...item,
        counsellor: item.counsellorId
          ? counsellorMap.get(item.counsellorId) ?? null
          : null,
      })),
    });
  } catch (error) {
    console.error("Counselling GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load counselling sessions.",
      },
      { status: 500 },
    );
  }
}

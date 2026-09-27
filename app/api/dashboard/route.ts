import { NextResponse } from "next/server";
import {
  AdmissionStatus,
  LeadStatus,
  LeadFollowUpStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { getAdminTgnScope } from "@/lib/tgn/admin-scope";

export const dynamic = "force-dynamic";

const DASHBOARD_MONTHS = 9;

// TechSkillHub currently operates around India Standard Time.
const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function getIndiaDateParts(date: Date) {
  const shifted = new Date(
    date.getTime() + INDIA_OFFSET_MS,
  );

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  };
}

function getIndiaDayBoundaries(date = new Date()) {
  const parts = getIndiaDateParts(date);

  const start = new Date(
    Date.UTC(
      parts.year,
      parts.month,
      parts.day,
    ) - INDIA_OFFSET_MS,
  );

  const end = new Date(
    start.getTime() + 24 * 60 * 60 * 1000,
  );

  return {
    start,
    end,
  };
}

function getMonthStart(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1,
    ),
  );
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);
}

function calculatePercentageChange(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    if (current === 0) {
      return 0;
    }

    return 100;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(
      1,
    ),
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "TS";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getActivityTypeLabel(type: string) {
  const labels: Record<string, string> = {
    LEAD_CREATED: "Lead",
    UPDATED: "Lead",
    STATUS_CHANGED: "Pipeline",
    NOTE_ADDED: "Note",
    NOTE_UPDATED: "Note",
    ASSIGNED: "Assignment",
    CALL: "Contact",
    WHATSAPP: "Contact",
    EMAIL: "Contact",
    FOLLOW_UP_CREATED: "Follow-up",
    FOLLOW_UP_COMPLETED: "Follow-up",
    FOLLOW_UP_CANCELLED: "Follow-up",
  };

  return labels[type] ?? "Activity";
}

function getRelativeTime(date: Date) {
  const diffMs =
    Date.now() - date.getTime();

  const diffMinutes = Math.floor(
    diffMs / (1000 * 60),
  );

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(
    diffMinutes / 60,
  );

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(
    diffHours / 24,
  );

  if (diffDays === 1) {
    return "yesterday";
  }

  return `${diffDays} days ago`;
}

export async function GET() {
  try {
    const adminScope = await getAdminTgnScope();
    const dashboardLeadScope = adminScope.isTgnScoped
      ? adminScope.leadWhere
      : {};

    const now = new Date();

    /*
     * ---------------------------------------------------------
     * DATE WINDOWS
     * ---------------------------------------------------------
     */

    const currentMonthStart =
      getMonthStart(now);

    const previousMonthStart =
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() - 1,
          1,
        ),
      );

    const nineMonthStart =
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() -
            (DASHBOARD_MONTHS - 1),
          1,
        ),
      );

    const {
      start: todayStart,
      end: todayEnd,
    } = getIndiaDayBoundaries(now);

    /*
     * ---------------------------------------------------------
     * DATABASE QUERIES
     * ---------------------------------------------------------
     *
     * Everything is read in parallel to keep the dashboard
     * response fast.
     */

    const [
      statusCounts,
      totalLeads,
      currentMonthNew,
      previousMonthNew,
      currentMonthEnrolled,
      previousMonthEnrolled,
      growthLeads,
      recentActivities,
      todayFollowUps,
      pendingFollowUps,
      overdueFollowUps,
      qualifiedFollowUps,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.groupBy({
        where: dashboardLeadScope,
        by: ["status"],
        _count: {
          _all: true,
        },
      }),

      prisma.lead.count({ where: dashboardLeadScope }),

      prisma.lead.count({
        where: {
          ...dashboardLeadScope,
          createdAt: {
            gte: currentMonthStart,
            lt: new Date(
              Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                1,
              ),
            ),
          },
        },
      }),

      prisma.lead.count({
        where: {
          ...dashboardLeadScope,
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart,
          },
        },
      }),

      prisma.lead.count({
        where: {
          ...dashboardLeadScope,
          status: LeadStatus.ENROLLED,
          createdAt: {
            gte: currentMonthStart,
          },
        },
      }),

      prisma.lead.count({
        where: {
          ...dashboardLeadScope,
          status: LeadStatus.ENROLLED,
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart,
          },
        },
      }),

      prisma.lead.findMany({
        where: {
          ...dashboardLeadScope,
          createdAt: {
            gte: nineMonthStart,
          },
        },
        select: {
          createdAt: true,
          status: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.leadActivity.findMany({
        where: {
          lead: {
            is: dashboardLeadScope,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
        include: {
          lead: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),

      prisma.leadFollowUp.findMany({
        where: {
          lead: {
            is: dashboardLeadScope,
          },
          status: LeadFollowUpStatus.PENDING,
          scheduledAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
        take: 8,
        include: {
          lead: {
            select: {
              id: true,
              fullName: true,
              interestedProgram: true,
            },
          },
        },
      }),

      prisma.leadFollowUp.count({
        where: {
          lead: {
            is: dashboardLeadScope,
          },
          status: LeadFollowUpStatus.PENDING,
        },
      }),

      prisma.leadFollowUp.count({
        where: {
          lead: {
            is: dashboardLeadScope,
          },
          status: LeadFollowUpStatus.PENDING,
          scheduledAt: {
            lt: todayStart,
          },
        },
      }),

      prisma.lead.count({
        where: {
          ...dashboardLeadScope,
          status: LeadStatus.QUALIFIED,
          followUps: {
            some: {
              status: LeadFollowUpStatus.PENDING,
            },
          },
        },
      }),

      prisma.lead.findMany({
        where: dashboardLeadScope,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          currentStatus: true,
          interestedProgram: true,
          status: true,
          preferredContact: true,
          source: true,
          assignedTo: true,
          createdAt: true,
        },
      }),
    ]);

    const [
      applicationsPending,
      admissionsPending,
      paymentVerification,
      documentsPending,
    ] = await Promise.all([
      prisma.admissionApplication.count({
        where: {
          status: {
            in: [
              "SUBMITTED",
              "UNDER_REVIEW",
              "CHANGES_REQUESTED",
            ],
          },
        },
      }),

      prisma.admission.count({
        where: {
          status: AdmissionStatus.PENDING,
        },
      }),

      prisma.admission.count({
        where: {
          status: AdmissionStatus.PAYMENT_VERIFICATION,
        },
      }),

      prisma.admission.count({
        where: {
          status: AdmissionStatus.DOCUMENTS_PENDING,
        },
      }),
    ]);

    /*
     * ---------------------------------------------------------
     * STATUS STATISTICS
     * ---------------------------------------------------------
     */

    const getStatusCount = (
      status: LeadStatus,
    ) =>
      statusCounts.find(
        (item) => item.status === status,
      )?._count._all ?? 0;

    const stats = {
      total: totalLeads,
      new: getStatusCount(LeadStatus.NEW),
      contacted: getStatusCount(
        LeadStatus.CONTACTED,
      ),
      qualified: getStatusCount(
        LeadStatus.QUALIFIED,
      ),
      enrolled: getStatusCount(
        LeadStatus.ENROLLED,
      ),
      closed: getStatusCount(
        LeadStatus.CLOSED,
      ),
    };

    const admissionOperations = {
      applicationsPending,
      admissionsPending,
      paymentVerification,
      documentsPending,
    };

    /*
     * ---------------------------------------------------------
     * MONTHLY GROWTH
     * ---------------------------------------------------------
     */

    const growthMap = new Map<
      string,
      {
        name: string;
        leads: number;
        admissions: number;
      }
    >();

    for (
      let index = 0;
      index < DASHBOARD_MONTHS;
      index += 1
    ) {
      const month = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() -
            (DASHBOARD_MONTHS - 1 - index),
          1,
        ),
      );

      growthMap.set(getMonthKey(month), {
        name: getMonthLabel(month),
        leads: 0,
        admissions: 0,
      });
    }

    for (const lead of growthLeads) {
      const monthKey = getMonthKey(
        lead.createdAt,
      );

      const bucket =
        growthMap.get(monthKey);

      if (!bucket) {
        continue;
      }

      bucket.leads += 1;

      if (lead.status === LeadStatus.ENROLLED) {
        bucket.admissions += 1;
      }
    }

    const growth = Array.from(
      growthMap.values(),
    );

    /*
     * ---------------------------------------------------------
     * RECENT ACTIVITY
     * ---------------------------------------------------------
     */

    const activities =
      recentActivities.map((activity) => ({
        id: activity.id,
        initials: getInitials(
          activity.lead.fullName,
        ),
        name: activity.lead.fullName,
        title: activity.title,
        description:
          activity.description ?? "",
        type: getActivityTypeLabel(
          activity.type,
        ),
        activityType: activity.type,
        time: getRelativeTime(
          activity.createdAt,
        ),
        createdAt:
          activity.createdAt.toISOString(),
      }));

    /*
     * ---------------------------------------------------------
     * TODAY'S SCHEDULE
     * ---------------------------------------------------------
     */

    const schedule =
      todayFollowUps.map((followUp) => ({
        id: followUp.id,
        leadId: followUp.lead.id,
        time: followUp.scheduledAt.toISOString(),
        person: followUp.lead.fullName,
        title:
          followUp.note ||
          `Follow-up · ${followUp.lead.interestedProgram}`,
        type: "Follow-up",
        status: followUp.status,
        assignedTo:
          followUp.assignedTo,
      }));

    /*
     * ---------------------------------------------------------
     * FOLLOW-UP INTELLIGENCE
     * ---------------------------------------------------------
     */

    const followUpSummary = {
      pending: pendingFollowUps,
      dueToday: todayFollowUps.length,
      overdue: overdueFollowUps,
      qualifiedOpportunities:
        qualifiedFollowUps,
    };

    /*
     * ---------------------------------------------------------
     * PERIOD COMPARISON
     * ---------------------------------------------------------
     */

    const period = {
      currentMonth: {
        newLeads: currentMonthNew,
        enrollments: currentMonthEnrolled,
      },

      previousMonth: {
        newLeads: previousMonthNew,
        enrollments: previousMonthEnrolled,
      },

      changes: {
        newLeads: calculatePercentageChange(
          currentMonthNew,
          previousMonthNew,
        ),

        enrollments:
          calculatePercentageChange(
            currentMonthEnrolled,
            previousMonthEnrolled,
          ),
      },
    };

    /*
     * ---------------------------------------------------------
     * FINAL RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      generatedAt: now.toISOString(),

      stats,

      admissionOperations,

      viewer: {
        isNetworkManager:
          adminScope.isNetworkManager,
      },

      period,

      growth,

      activities,

      schedule,

      followUpSummary,

      recentLeads,
    });
  } catch (error) {
    console.error(
      "GET Dashboard Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load dashboard data",
        ...(process.env.NODE_ENV !== "production"
          ? {
              debug:
                error instanceof Error
                  ? error.message
                  : String(error),
            }
          : {}),
      },
      {
        status: 500,
      },
    );
  }
}
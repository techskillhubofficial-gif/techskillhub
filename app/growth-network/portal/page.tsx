import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTgnContext } from "@/lib/tgn/authorization";
import TgnPortalShell from "./TgnPortalShell";

const BASE_URL = "https://techskillhub.online";

export default async function TgnMemberPortalPage() {
  const session = await getServerSession(authOptions);
  const context = await getTgnContext();

  if (!session?.user || !context) {
    redirect("/login");
  }

  if (
    context.access !== "TEAM_LEADER" &&
    context.access !== "EXECUTIVE"
  ) {
    redirect("/dashboard/growth-network");
  }

  if (!context.memberId) {
    redirect("/login");
  }

  const member = await prisma.tgnMemberProfile.findUnique({
    where: {
      id: context.memberId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },

      team: {
        select: {
          name: true,
          code: true,

          _count: {
            select: {
              members: true,
            },
          },

          leader: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },

          members: {
            orderBy: {
              createdAt: "asc",
            },
            take: 100,
            select: {
              id: true,
              memberType: true,
              status: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },

      directReports: {
        where: {
          memberType: "EXECUTIVE",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 100,
        select: {
          id: true,
          status: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!member) {
    redirect("/login");
  }

  const isTeamLeader = context.access === "TEAM_LEADER";

  const accessibleMemberIds = [
    context.memberId,
    ...member.directReports.map((person) => person.id),
  ];

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  );

  const [
    leads,
    admissions,
    commissions,
    applications,
    activities,
    last30DayLeads,
    last30DayAdmissions,
  ] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          {
            tgnOwnerId: {
              in: accessibleMemberIds,
            },
          },
          {
            tgnSourceMemberId: {
              in: accessibleMemberIds,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        interestedProgram: true,
        createdAt: true,
        lastContactedAt: true,
        tgnOwnerId: true,
        tgnSourceMemberId: true,
      },
    }),

    prisma.admission.findMany({
      where: {
        lead: {
          OR: [
            {
              tgnOwnerId: {
                in: accessibleMemberIds,
              },
            },
            {
              tgnSourceMemberId: {
                in: accessibleMemberIds,
              },
            },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        id: true,
        admissionNo: true,
        studentName: true,
        studentEmail: true,
        program: true,
        status: true,
        approvedAt: true,
        createdAt: true,
        leadId: true,
      },
    }),

    prisma.tgnCommission.findMany({
      where: {
        memberId: {
          in: accessibleMemberIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        id: true,
        amount: true,
        status: true,
        leadId: true,
        admissionId: true,
        createdAt: true,
        approvedAt: true,
        paidAt: true,
      },
    }),

    isTeamLeader
      ? prisma.tgnApplication.findMany({
          where: {
            sourceMemberId: context.memberId,
            memberType: "EXECUTIVE",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 100,
          select: {
            id: true,
            applicationNo: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),

    prisma.tgnAuditEvent.findMany({
      where: {
        memberId: {
          in: accessibleMemberIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        member: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.lead.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        OR: [
          {
            tgnOwnerId: {
              in: accessibleMemberIds,
            },
          },
          {
            tgnSourceMemberId: {
              in: accessibleMemberIds,
            },
          },
        ],
      },
    }),

    prisma.admission.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        lead: {
          OR: [
            {
              tgnOwnerId: {
                in: accessibleMemberIds,
              },
            },
            {
              tgnSourceMemberId: {
                in: accessibleMemberIds,
              },
            },
          ],
        },
      },
    }),
  ]);

  const leadPipeline = leads.reduce<Record<string, number>>(
    (result, lead) => {
      result[lead.status] = (result[lead.status] ?? 0) + 1;
      return result;
    },
    {},
  );

  const admissionPipeline = admissions.reduce<Record<string, number>>(
    (result, admission) => {
      result[admission.status] =
        (result[admission.status] ?? 0) + 1;

      return result;
    },
    {},
  );

  const recruitmentPipeline = applications.reduce<
    Record<string, number>
  >((result, application) => {
    result[application.status] =
      (result[application.status] ?? 0) + 1;

    return result;
  }, {});

  const commissionTotals = commissions.reduce(
    (result, commission) => {
      const amount = Number(commission.amount);

      if (commission.status === "PENDING") {
        result.pending += amount;
      }

      if (commission.status === "ELIGIBLE") {
        result.eligible += amount;
      }

      if (commission.status === "APPROVED") {
        result.approved += amount;
      }

      if (commission.status === "PAID") {
        result.paid += amount;
      }

      return result;
    },
    {
      pending: 0,
      eligible: 0,
      approved: 0,
      paid: 0,
    },
  );

  const firstName =
    member.user.name?.trim().split(/\s+/)[0] || "Member";

  const recruitmentUrl = member.referralCode
    ? `${BASE_URL}/growth-network/join?role=EXECUTIVE&ref=${encodeURIComponent(
        member.referralCode,
      )}`
    : null;

  return (
    <TgnPortalShell
      data={{
        name: member.user.name || "TGN Member",
        firstName,
        email: member.user.email || "",
        role: isTeamLeader ? "TEAM_LEADER" : "EXECUTIVE",
        memberType: member.memberType,
        status: member.status,
        referralCode: member.referralCode,
        recruitmentUrl,

        team: member.team
          ? {
              name: member.team.name,
              code: member.team.code,
              memberCount: member.team._count.members,
              leaderName:
                member.team.leader?.user.name ||
                "Team Leader",
              leaderEmail:
                member.team.leader?.user.email || "",

              members: member.team.members.map((person) => ({
                id: person.id,
                name: person.user.name || "TGN Member",
                email: person.user.email || "",
                memberType: person.memberType,
                status: person.status,
              })),
            }
          : null,

        directReports: member.directReports.map((person) => ({
          id: person.id,
          name: person.user.name || "Growth Executive",
          email: person.user.email || "",
          status: person.status,
        })),

        metrics: {
          leads: leads.length,
          admissions: admissions.length,
          directExecutives: member.directReports.length,
          applications: applications.length,
          last30DayLeads,
          last30DayAdmissions,
        },

        pipelines: {
          leads: leadPipeline,
          admissions: admissionPipeline,
          recruitment: recruitmentPipeline,
        },

        commissions: commissionTotals,

        recentLeads: leads.slice(0, 12).map((lead) => ({
          id: lead.id,
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          interestedProgram: lead.interestedProgram,
          createdAt: lead.createdAt.toISOString(),
          lastContactedAt:
            lead.lastContactedAt?.toISOString() ?? null,
        })),

        recentAdmissions: admissions
          .slice(0, 10)
          .map((admission) => ({
            id: admission.id,
            admissionNo: admission.admissionNo,
            studentName: admission.studentName,
            studentEmail: admission.studentEmail,
            program: admission.program,
            status: admission.status,
            approvedAt:
              admission.approvedAt?.toISOString() ?? null,
            createdAt: admission.createdAt.toISOString(),
            leadId: admission.leadId,
          })),

        recentApplications: applications
          .slice(0, 10)
          .map((application) => ({
            id: application.id,
            applicationNo: application.applicationNo,
            name: application.name,
            email: application.email,
            phone: application.phone,
            status: application.status,
            createdAt:
              application.createdAt.toISOString(),
          })),

        activities: activities.map((activity) => ({
          id: activity.id,
          action: activity.action,
          createdAt: activity.createdAt.toISOString(),
          memberName:
            activity.member?.user.name ||
            "TGN Member",
        })),
      }}
    />
  );
}

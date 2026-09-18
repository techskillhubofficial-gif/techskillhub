import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  ExternalLink,
  Mail,
  Network,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTgnContext } from "@/lib/tgn/authorization";

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
    where: { id: context.memberId },
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
        },
      },
      directReports: {
        where: {
          memberType: "EXECUTIVE",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 50,
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

  const firstName =
    member.user.name?.trim().split(/\s+/)[0] || "Member";

  const recruitmentUrl = member.referralCode
    ? `${BASE_URL}/growth-network/join?role=EXECUTIVE&ref=${encodeURIComponent(
        member.referralCode,
      )}`
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <Link
            href="/growth-network/portal"
            className="relative h-11 w-40"
          >
            <Image
              src="/logo/Full-logo.png"
              alt="TechSkillHub"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          <div className="text-right">
            <p className="text-sm font-semibold">{member.user.name}</p>
            <p className="text-xs text-slate-500">
              {isTeamLeader ? "Team Leader" : "Growth Executive"}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <section className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                TechSkillHub Growth Network
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Welcome, {firstName}.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {isTeamLeader
                  ? "Manage your team recruitment and participate in practical growth activities."
                  : "Build practical experience, contribute to growth activities and develop your professional network."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Team
            </p>
            <p className="mt-1 font-bold">
              {member.team?.name || "Assigned Team"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Network className="h-5 w-5 text-indigo-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Team Members
            </p>
            <p className="mt-1 text-2xl font-bold">
              {member.team?._count.members ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Mail className="h-5 w-5 text-emerald-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account
            </p>
            <p className="mt-1 break-all text-sm font-semibold">
              {member.user.email}
            </p>
          </div>
        </section>

        {isTeamLeader && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <UserPlus className="mt-1 h-5 w-5 text-blue-600" />

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Recruitment
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Build Your Growth Team
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Invite people to apply as Growth Executives using your
                  dedicated recruitment link.
                </p>

                {recruitmentUrl && (
                  <>
                    <div className="mt-4 break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-600">
                      {recruitmentUrl}
                    </div>

                    <a
                      href={recruitmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Open Recruitment Page
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            {isTeamLeader ? "My Team" : "My Assignment"}
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {isTeamLeader ? "Growth Executives" : "Assigned Team"}
          </h2>

          {isTeamLeader ? (
            member.directReports.length > 0 ? (
              <div className="mt-5 divide-y divide-slate-100">
                {member.directReports.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {person.user.name || "Growth Executive"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {person.user.email}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {person.status.replaceAll("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <UserPlus className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No Growth Executives yet.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Use your recruitment link above to start building your team.
                </p>
              </div>
            )
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold">
                {member.team?.name || "Assigned TGN Team"}
              </p>

              {member.team?.leader?.user && (
                <p className="mt-2 text-xs text-slate-500">
                  Team Leader:{" "}
                  {member.team.leader.user.name || "Team Leader"}
                </p>
              )}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/growth-network/join"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            TGN Information
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

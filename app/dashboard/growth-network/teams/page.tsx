"use client";

import {
  Check,
  Clipboard,
  ExternalLink,
  MessageCircle,
  Network,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

type Member = {
  id: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type Recruitment = {
  memberId: string;
  leaderName: string;
  referralCode: string;
  recruitmentUrl: string;
  team: {
    id: string;
    name: string;
    code: string;
    status: string;
    _count: {
      members: number;
    };
  } | null;
  members: Member[];
  activeMembers: number;
  pendingMembers: number;
};

type Team = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  leader: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  _count: {
    members: number;
  };
};

type TeamsResponse = {
  success: boolean;
  teams?: Team[];
  message?: string;
};

type RecruitmentResponse = {
  success: boolean;
  recruitment?: Recruitment;
  message?: string;
};

function statusLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function GrowthNetworkTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [recruitment, setRecruitment] =
    useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecruitment, setLoadingRecruitment] = useState(true);
  const [error, setError] = useState("");
  const [recruitmentError, setRecruitmentError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadTeams() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tgn/teams", {
        cache: "no-store",
      });

      const result = (await response.json()) as TeamsResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to load teams.");
      }

      setTeams(result.teams ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load teams.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRecruitment() {
    setLoadingRecruitment(true);
    setRecruitmentError("");

    try {
      const response = await fetch("/api/tgn/team/recruitment", {
        cache: "no-store",
      });

      const result =
        (await response.json()) as RecruitmentResponse;

      if (!response.ok || !result.success || !result.recruitment) {
        throw new Error(
          result.message ??
            "Team recruitment is not available for this account.",
        );
      }

      setRecruitment(result.recruitment);
    } catch (err) {
      setRecruitmentError(
        err instanceof Error
          ? err.message
          : "Unable to load recruitment information.",
      );
    } finally {
      setLoadingRecruitment(false);
    }
  }

  async function load() {
    await Promise.all([loadTeams(), loadRecruitment()]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function copyRecruitmentLink() {
    if (!recruitment?.recruitmentUrl) return;

    try {
      await navigator.clipboard.writeText(
        recruitment.recruitmentUrl,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setRecruitmentError(
        "Unable to copy the recruitment link. Please copy it manually.",
      );
    }
  }

  function shareOnWhatsApp() {
    if (!recruitment?.recruitmentUrl) return;

    const message = [
      "Hi! I'm building my team with the TechSkillHub Growth Network.",
      "",
      "We're currently looking for Growth Executives who want to build practical experience, develop professional skills and contribute to real growth activities.",
      "",
      `Apply here: ${recruitment.recruitmentUrl}`,
    ].join("\n");

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              TechSkillHub Growth Network
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">
              Teams
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Build, coordinate and grow the TGN team structure.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || loadingRecruitment}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading || loadingRecruitment
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="space-y-6 p-6 lg:p-8">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {recruitmentError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {recruitmentError}
          </div>
        ) : null}

        {recruitment ? (
          <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-blue-50/60 px-6 py-5">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Build your team
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                      Recruit Growth Executives
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                      Share your personal recruitment link. Candidates
                      applying through it are connected to your Team
                      Leader referral and can enter your team after the
                      normal application and onboarding process.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => void copyRecruitmentLink()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy Link"}
                  </button>

                  <button
                    type="button"
                    onClick={shareOnWhatsApp}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Team
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {recruitment.team?.name ?? "Team not assigned"}
                </p>
                {recruitment.team?.code ? (
                  <p className="mt-1 text-xs font-semibold text-blue-600">
                    {recruitment.team.code}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Active Executives
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {recruitment.activeMembers}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  In Onboarding / Orientation
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {recruitment.pendingMembers}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-xs font-medium text-slate-500">
                Your recruitment link
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                  {recruitment.recruitmentUrl}
                </code>

                <a
                  href={recruitment.recruitmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>
        ) : loadingRecruitment ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading team recruitment...
          </div>
        ) : null}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Team Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View Team Leaders and their current team structure.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full py-12 text-center text-sm text-slate-500">
                Loading teams...
              </div>
            ) : teams.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Network className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">
                  No teams created yet
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Teams are created during Team Leader onboarding.
                </p>
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Network className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {statusLabel(team.status)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-950">
                    {team.name}
                  </h3>

                  <p className="mt-1 text-xs font-bold tracking-wide text-blue-600">
                    {team.code}
                  </p>

                  {team.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {team.description}
                    </p>
                  ) : null}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">
                        Team Leader
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {team.leader.user.name ??
                          team.leader.user.email}
                      </p>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-800">
                        {team._count.members}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {recruitment ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Your Growth Executives
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Executives connected to your Team Leader profile.
                </p>
              </div>
            </div>

            {recruitment.members.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <UserPlus className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">
                  Your team is ready to grow
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Share your recruitment link with suitable candidates.
                  Their applications will remain subject to the normal
                  TechSkillHub review and onboarding process.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {recruitment.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {member.user.name ?? member.user.email}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {member.user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {statusLabel(member.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}

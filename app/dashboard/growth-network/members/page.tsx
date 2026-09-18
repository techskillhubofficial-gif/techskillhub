"use client";

import {
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

type Member = {
  id: string;
  memberType: "TEAM_LEADER" | "EXECUTIVE";
  status: string;
  referralCode: string | null;
  isNetworkManager: boolean;
  manager: { id: string; user: { name: string | null; email: string } } | null;
  team: { id: string; name: string; code: string } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
};

export default function GrowthNetworkMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tgn/members?search=${encodeURIComponent(search)}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to load members.");
      }

      setMembers(result.members ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load members.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
        <h1 className="text-2xl font-semibold text-slate-950">
          TGN Members
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage Team Leaders, Executives and network relationships.
        </p>
      </header>

      <main className="space-y-5 p-6 lg:p-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-12 text-center text-sm text-slate-500">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">
                No TGN members yet
              </p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    {member.isNetworkManager ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <UserRound className="h-5 w-5" />
                    )}
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {member.status}
                  </span>
                </div>

                <h2 className="mt-4 font-semibold text-slate-950">
                  {member.user.name ?? "Unnamed member"}
                </h2>

                <p className="text-sm text-slate-500">
                  {member.user.email}
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role</span>
                    <span className="font-medium text-slate-700">
                      {member.memberType === "TEAM_LEADER"
                        ? "Team Leader"
                        : "Executive"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Referral</span>
                    <span className="font-medium text-blue-600">
                      {member.referralCode ?? "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Team</span>
                    <span className="font-medium text-slate-700">
                      {member.team?.name ?? "Unassigned"}
                    </span>
                  </div>

                  {member.manager ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Manager</span>
                      <span className="font-medium text-slate-700">
                        {member.manager.user.name ??
                          member.manager.user.email}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

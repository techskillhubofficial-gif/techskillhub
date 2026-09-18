"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type Application = {
  id: string;
  applicationNo: string;
  memberType: "TEAM_LEADER" | "EXECUTIVE";
  status: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  organization: string | null;
  experience: string | null;
  availability: string | null;
  workingMode: string | null;
  leadershipExperience: string | null;
  previousTeamSize: string | null;
  expectedTeamSize: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  portfolioUrl: string | null;
  responsibilitiesAccepted: boolean;
  declarationsAccepted: boolean;
  marketingPolicyAccepted: boolean;
  termsAccepted: boolean;
  reviewNotes: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  sourceMember: {
    id: string;
    referralCode: string | null;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  reviewedBy: {
    name: string | null;
    email: string;
  } | null;
  auditEvents: {
    id: string;
    action: string;
    createdAt: string;
    actorUser: {
      name: string | null;
      email: string;
    } | null;
  }[];
};

type TeamLeader = {
  id: string;
  memberType: "TEAM_LEADER";
  status: string;
  user: {
    name: string | null;
    email: string;
  };
  team: {
    id: string;
    name: string;
  } | null;
};

const reviewActions = [
  {
    status: "UNDER_REVIEW",
    label: "Start Review",
    icon: Clock3,
  },
  {
    status: "SHORTLISTED",
    label: "Shortlist",
    icon: CheckCircle2,
  },
  {
    status: "INTERVIEW",
    label: "Move to Interview",
    icon: Users,
  },
  {
    status: "APPROVED",
    label: "Approve",
    icon: ShieldCheck,
  },
  {
    status: "REJECTED",
    label: "Reject",
    icon: XCircle,
  },
];

export default function TgnApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [selectedLeader, setSelectedLeader] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadApplication() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/tgn/applications/${params.id}`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load application.",
        );
      }

      setApplication(data.application);
      setEmailDraft(data.application.email ?? "");
      setReviewNotes(data.application.reviewNotes ?? "");
      setRejectionReason(data.application.rejectionReason ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load application.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTeamLeaders() {
    if (application?.memberType !== "EXECUTIVE") {
      return;
    }

    try {
      const response = await fetch(
        "/api/tgn/members?memberType=TEAM_LEADER&status=ACTIVE",
        { cache: "no-store" },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTeamLeaders(data.members ?? []);
      }
    } catch {
      // Non-blocking; onboarding will explain if no leader is available.
    }
  }

  useEffect(() => {
    if (params.id) {
      void loadApplication();
    }
  }, [params.id]);

  useEffect(() => {
    void loadTeamLeaders();
  }, [application?.memberType]);

  async function updateEmail() {
    if (!application) {
      return;
    }

    const nextEmail = emailDraft.trim().toLowerCase();

    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setEmailUpdating(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/tgn/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "UPDATE_EMAIL",
            email: nextEmail,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update applicant email.",
        );
      }

      setApplication(data.application);
      setEmailDraft(data.application.email);
      setEditingEmail(false);
      setMessage(data.message || "Applicant email updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update applicant email.",
      );
    } finally {
      setEmailUpdating(false);
    }
  }

  async function updateStatus(status: string) {
    if (!application) {
      return;
    }

    if (
      status === "REJECTED" &&
      !rejectionReason.trim()
    ) {
      setError("Enter a rejection reason before rejecting.");
      return;
    }

    try {
      setWorking(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/tgn/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            reviewNotes: reviewNotes.trim() || undefined,
            rejectionReason:
              status === "REJECTED"
                ? rejectionReason.trim()
                : undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update application.",
        );
      }

      setApplication(data.application);
      setMessage(`Application moved to ${status.replaceAll("_", " ")}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update application.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function onboard() {
    if (!application) {
      return;
    }

    if (
      application.memberType === "EXECUTIVE" &&
      !selectedLeader
    ) {
      setError("Select an active Team Leader for this Executive.");
      return;
    }

    try {
      setOnboarding(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/tgn/applications/${application.id}/onboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            application.memberType === "EXECUTIVE"
              ? { teamLeaderMemberId: selectedLeader }
              : {},
          ),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to onboard member.",
        );
      }

      setMessage(
        data.setupEmailSent
          ? "Member onboarded successfully. Account setup email sent."
          : "Member onboarded successfully. Account setup email could not be sent.",
      );

      await loadApplication();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to onboard member.",
      );
    } finally {
      setOnboarding(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard/growth-network/applications"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Application not found."}
          </div>
        </div>
      </main>
    );
  }

  const canReview = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
  ].includes(application.status);

  const canOnboard = ["APPROVED", "ONBOARDING"].includes(
    application.status,
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/dashboard/growth-network/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {application.applicationNo}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {application.name}
            </h1>

            <p className="mt-2 text-slate-500">
              {application.memberType === "TEAM_LEADER"
                ? "Team Leader Application"
                : "Growth Executive Application"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {application.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Applicant Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Info
                  icon={UserRound}
                  label="Full Name"
                  value={application.name}
                />

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>

                      {!editingEmail ? (
                        <p className="mt-2 break-all text-sm font-medium text-slate-900">
                          {application.email}
                        </p>
                      ) : (
                        <div className="mt-3">
                          <input
                            type="email"
                            value={emailDraft}
                            onChange={(event) =>
                              setEmailDraft(event.target.value)
                            }
                            autoComplete="email"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter correct email address"
                          />

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            This updates the applicant record and their TechSkillHub login account. The previous activation link will be invalidated and a new activation email will be sent.
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEmailDraft(application.email);
                                setEditingEmail(false);
                                setError("");
                              }}
                              disabled={emailUpdating}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={updateEmail}
                              disabled={emailUpdating}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {emailUpdating
                                ? "Saving..."
                                : "Save & Send Activation"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!editingEmail && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmailDraft(application.email);
                          setEditingEmail(true);
                          setError("");
                          setMessage("");
                        }}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <Info
                  icon={Phone}
                  label="Phone"
                  value={application.phone}
                />

                <Info
                  icon={MapPin}
                  label="Location"
                  value={
                    [application.city, application.state]
                      .filter(Boolean)
                      .join(", ") || "Not provided"
                  }
                />

                <Info
                  label="Education"
                  value={application.education}
                />

                <Info
                  label="Occupation"
                  value={application.occupation}
                />

                <Info
                  label="Organization"
                  value={application.organization}
                />

                <Info
                  label="Experience"
                  value={application.experience}
                />

                <Info
                  label="Availability"
                  value={application.availability}
                />

                <Info
                  label="Working Mode"
                  value={application.workingMode}
                />

                <Info
                  label="Leadership Experience"
                  value={application.leadershipExperience}
                />

                <Info
                  label="Previous Team Size"
                  value={application.previousTeamSize}
                />

                <Info
                  label="Expected Team Size"
                  value={application.expectedTeamSize}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Referral Source
              </h2>

              {application.sourceMember ? (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {application.sourceMember.user.name ||
                      application.sourceMember.user.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {application.sourceMember.user.email}
                  </p>
                  {application.sourceMember.referralCode && (
                    <p className="mt-2 text-xs font-medium text-blue-600">
                      Referral: {application.sourceMember.referralCode}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No TGN referral source recorded.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Declarations & Responsibilities
              </h2>

              <div className="mt-5 space-y-3">
                <Declaration
                  label="Responsibilities accepted"
                  accepted={application.responsibilitiesAccepted}
                />
                <Declaration
                  label="Declarations accepted"
                  accepted={application.declarationsAccepted}
                />
                <Declaration
                  label="Marketing policy accepted"
                  accepted={application.marketingPolicyAccepted}
                />
                <Declaration
                  label="Terms accepted"
                  accepted={application.termsAccepted}
                />
              </div>
            </section>

            {(application.linkedinUrl ||
              application.instagramUrl ||
              application.portfolioUrl) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Professional Links
                </h2>

                <div className="mt-4 space-y-2 text-sm">
                  {application.linkedinUrl && (
                    <p className="break-all text-blue-600">
                      LinkedIn: {application.linkedinUrl}
                    </p>
                  )}
                  {application.instagramUrl && (
                    <p className="break-all text-blue-600">
                      Instagram: {application.instagramUrl}
                    </p>
                  )}
                  {application.portfolioUrl && (
                    <p className="break-all text-blue-600">
                      Portfolio: {application.portfolioUrl}
                    </p>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Application Timeline
              </h2>

              <div className="mt-5 space-y-4">
                <TimelineItem
                  label="Application submitted"
                  date={application.createdAt}
                />

                {application.reviewedAt && (
                  <TimelineItem
                    label="Application reviewed"
                    date={application.reviewedAt}
                    actor={application.reviewedBy?.name || application.reviewedBy?.email}
                  />
                )}

                {application.approvedAt && (
                  <TimelineItem
                    label="Application approved"
                    date={application.approvedAt}
                  />
                )}

                {(application.auditEvents ?? []).map((event) => (
                  <TimelineItem
                    key={event.id}
                    label={event.action.replaceAll("_", " ")}
                    date={event.createdAt}
                    actor={event.actorUser?.name || event.actorUser?.email}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {canReview && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-950">
                  Review Application
                </h2>

                <label className="mt-5 block text-sm font-medium text-slate-700">
                  Review notes
                </label>

                <textarea
                  value={reviewNotes}
                  onChange={(event) =>
                    setReviewNotes(event.target.value)
                  }
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Internal review notes..."
                />

                <div className="mt-5 space-y-2">
                  {reviewActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.status}
                        type="button"
                        disabled={working}
                        onClick={() => updateStatus(action.status)}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          action.status === "REJECTED"
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : action.status === "APPROVED"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {working ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                <label className="mt-5 block text-sm font-medium text-slate-700">
                  Rejection reason
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  placeholder="Required when rejecting..."
                />
              </section>
            )}

            {canOnboard && (
              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <h2 className="text-base font-semibold text-slate-950">
                  Member Onboarding
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create the TGN member account and establish the correct
                  reporting structure.
                </p>

                {application.memberType === "EXECUTIVE" && (
                  <div className="mt-5">
                    <label className="text-sm font-medium text-slate-700">
                      Team Leader
                    </label>

                    <select
                      value={selectedLeader}
                      onChange={(event) =>
                        setSelectedLeader(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">
                        Select Team Leader
                      </option>

                      {teamLeaders.map((leader) => (
                        <option key={leader.id} value={leader.id}>
                          {leader.user.name || leader.user.email}
                          {leader.team ? ` — ${leader.team.name}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  disabled={
                    onboarding ||
                    (application.memberType === "EXECUTIVE" &&
                      !selectedLeader)
                  }
                  onClick={onboard}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {onboarding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Onboard Member
                </button>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">
                Current Status
              </h2>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Workflow
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {application.status.replaceAll("_", " ")}
                </p>
              </div>

              {application.reviewNotes && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Review Notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {application.reviewNotes}
                  </p>
                </div>
              )}

              {application.rejectionReason && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-red-500">
                    Rejection Reason
                  </p>
                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof UserRound;
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {value || "Not provided"}
      </div>
    </div>
  );
}

function Declaration({
  label,
  accepted,
}: {
  label: string;
  accepted: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      {accepted ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
    </div>
  );
}

function TimelineItem({
  label,
  date,
  actor,
}: {
  label: string;
  date: string;
  actor?: string | null;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
      <div>
        <p className="text-sm font-medium capitalize text-slate-800">
          {label.toLowerCase()}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {new Date(date).toLocaleString("en-IN")}
          {actor ? ` · ${actor}` : ""}
        </p>
      </div>
    </div>
  );
}

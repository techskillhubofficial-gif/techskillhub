"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type TgnRole =
  | "FOUNDER"
  | "NETWORK_MANAGER"
  | "TEAM_LEADER"
  | "EXECUTIVE";

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string;
  metadata: unknown;
  createdAt: string;
  createdBy: string | null;
};

type FollowUp = {
  id: string;
  scheduledAt: string;
  completedAt: string | null;
  status: string;
  note: string | null;
  assignedTo: string | null;
};

type CounsellingSession = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  status: string;
  notes: string | null;
  outcome: string | null;
  nextAction: string | null;
};

type LeadDetail = {
  lead: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    currentStatus: string;
    interestedProgram: string;
    careerGoal: string | null;
    preferredContact: string;
    status: string;
    notes: string | null;
    lastContactedAt: string | null;
    updatedAt: string;
    tgnOwnerId: string | null;
    tgnSourceMemberId: string | null;
    activities: Activity[];
    followUps: FollowUp[];
    counsellingSessions: CounsellingSession[];
    tgnOwner: {
      id: string;
      memberType: string;
      status: string;
      user: {
        name: string | null;
        email: string;
      };
    } | null;
    tgnSourceMember: {
      id: string;
      memberType: string;
      status: string;
      user: {
        name: string | null;
        email: string;
      };
    } | null;
  };
  qualification: Record<string, string> | null;
};

const STATUS_OPTIONS = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ENROLLED",
  "CLOSED",
];

const QUALIFICATION_FIELDS = [
  ["educationLevel", "Education level"],
  ["institution", "College / University"],
  ["graduationYear", "Graduation year"],
  ["currentOccupation", "Current occupation"],
  ["workExperience", "Work experience"],
  ["currentSkillLevel", "Current skill level"],
  ["requirement", "Requirement"],
  ["mainObjection", "Main objection"],
  ["decisionTimeline", "Decision timeline"],
  ["temperature", "Lead temperature"],
  ["nextAction", "Next action"],
] as const;

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function metadataRecord(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return null;
}

function statusClass(status: string) {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "CONTACTED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "QUALIFIED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "ENROLLED":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

export default function TgnLeadWorkspace({
  leadId,
  role,
  onClose,
}: {
  leadId: string;
  role: TgnRole;
  onClose: () => void;
}) {
  const [data, setData] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [status, setStatus] = useState("");
  const [activityNote, setActivityNote] = useState("");

  const [qualification, setQualification] =
    useState<Record<string, string>>({});

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");

  const canQualify = role !== "EXECUTIVE";

  async function loadLead(options?: {
    showLoading?: boolean;
  }) {
    const showLoading = options?.showLoading ?? true;

    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `/api/tgn/member-leads/${leadId}`,
        {
          cache: "no-store",
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to load the lead.",
        );
      }

      setData(result);
      setStatus(result.lead.status);
      setQualification(result.qualification ?? {});
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the lead.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadLead();
  }, [leadId]);

  async function updateLead(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/tgn/member-leads/${leadId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            "Unable to update the lead.",
        );
      }

      setNotice("Lead updated successfully.");
      await loadLead({
        showLoading: false,
      });
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update the lead.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function logContact(
    contactAction: "CALL" | "WHATSAPP" | "EMAIL",
  ) {
    await updateLead({
      contactAction,
      activityNote:
        activityNote.trim() ||
        `Contacted the lead through ${contactAction.toLowerCase()}.`,
    });

    setActivityNote("");
  }

  async function saveQualification() {
    await updateLead({
      status,
      qualification,
      activityNote:
        activityNote.trim() ||
        "Lead qualification updated from the TGN workspace.",
    });

    setActivityNote("");
  }

  async function scheduleFollowUp() {
    if (!followUpDate) {
      setError("Choose a follow-up date and time.");
      return;
    }

    const scheduledAt = new Date(
      followUpDate,
    ).toISOString();

    await updateLead({
      followUp: {
        scheduledAt,
        note:
          followUpNote.trim() ||
          "Scheduled follow-up from the TGN workspace.",
      },
    });

    setFollowUpDate("");
    setFollowUpNote("");
  }

  async function markReadyForCounselling() {
    const nextQualification = {
      ...qualification,
      nextAction:
        qualification.nextAction ||
        "Schedule counselling session",
    };

    setQualification(nextQualification);

    await updateLead({
      status: "QUALIFIED",
      qualification: nextQualification,
      activityNote:
        activityNote.trim() ||
        "Lead marked as ready for counselling.",
    });

    setActivityNote("");
  }

  const qualificationRows = useMemo(
    () =>
      QUALIFICATION_FIELDS.map(([key, label]) => ({
        key,
        label,
        value: qualification[key] || "",
      })),
    [qualification],
  );

  if (loading) {
    return (
      <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock3 className="h-4 w-4 animate-pulse" />
          Loading lead workspace...
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mt-5 rounded-[26px] border border-red-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load lead
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {error || "The lead could not be loaded."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  const { lead } = data;
  const latestActivities = lead.activities.slice(0, 20);

  return (
    <section className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50/60 shadow-sm">
      <div className="border-b border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Lead Workspace
              </p>

              <span
                className={[
                  "inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ring-1",
                  statusClass(lead.status),
                ].join(" ")}
              >
                {humanize(lead.status)}
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {lead.fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {lead.interestedProgram || "Program not specified"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>

            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>

            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.05fr_1.35fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Student profile
              </h3>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info label="Phone" value={lead.phone} />
              <Info label="Email" value={lead.email} />
              <Info
                label="Current status"
                value={lead.currentStatus}
              />
              <Info
                label="Career goal"
                value={lead.careerGoal || "Not recorded"}
              />
              <Info
                label="Preferred contact"
                value={humanize(lead.preferredContact)}
              />
              <Info
                label="Last contact"
                value={formatDate(lead.lastContactedAt)}
              />
            </div>

            {lead.notes ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Lead notes
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {lead.notes}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Attribution
              </h3>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <PersonCard
                label="Source member"
                person={lead.tgnSourceMember}
              />
              <PersonCard
                label="Current owner"
                person={lead.tgnOwner}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Follow-up
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <textarea
                rows={3}
                value={followUpNote}
                onChange={(event) =>
                  setFollowUpNote(event.target.value)
                }
                placeholder="Reason, context and next action..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                disabled={saving}
                onClick={() => void scheduleFollowUp()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <CalendarClock className="h-4 w-4" />
                Schedule follow-up
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {lead.followUps.length > 0 ? (
                lead.followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {formatDate(followUp.scheduledAt)}
                      </p>

                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {humanize(followUp.status)}
                      </span>
                    </div>

                    {followUp.note ? (
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {followUp.note}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No follow-ups scheduled yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Qualification
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Qualification & next action
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Capture the conversation in one place for the next person in the workflow.
                </p>
              </div>

              {canQualify ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void markReadyForCounselling()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Ready for counselling
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Lead status
                </span>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanize(option)}
                    </option>
                  ))}
                </select>
              </label>

              {qualificationRows.map(
                ({ key, label, value }) => (
                  <label
                    key={key}
                    className={key === "requirement" || key === "mainObjection" || key === "nextAction" ? "sm:col-span-2" : ""}
                  >
                    <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                      {label}
                    </span>

                    {key === "temperature" ? (
                      <select
                        value={value}
                        onChange={(event) =>
                          setQualification((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        disabled={!canQualify}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none disabled:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Not set</option>
                        <option value="HOT">Hot</option>
                        <option value="WARM">Warm</option>
                        <option value="COLD">Cold</option>
                      </select>
                    ) : (
                      <input
                        value={value}
                        disabled={!canQualify}
                        onChange={(event) =>
                          setQualification((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none disabled:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    )}
                  </label>
                ),
              )}
            </div>

            <textarea
              rows={3}
              value={activityNote}
              onChange={(event) =>
                setActivityNote(event.target.value)
              }
              placeholder="What was discussed? Capture the real conversation here..."
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void logContact("CALL")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Phone className="h-4 w-4" />
                Log call
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void logContact("WHATSAPP")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" />
                Log WhatsApp
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void logContact("EMAIL")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                Log email
              </button>

              {canQualify ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveQualification()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save qualification
                </button>
              ) : null}
            </div>

            {error ? (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {notice ? (
              <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {notice}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Conversation history
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Activity timeline
                </h3>
              </div>

              <ExternalLink className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-5 space-y-4">
              {latestActivities.length > 0 ? (
                latestActivities.map((activity) => {
                  const metadata = metadataRecord(
                    activity.metadata,
                  );

                  const qualificationActivity =
                    metadata?.kind ===
                    "TGN_QUALIFICATION";

                  return (
                    <div
                      key={activity.id}
                      className="relative border-l border-slate-200 pl-4"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {activity.title}
                        </p>

                        <span className="text-[10px] font-medium text-slate-400">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>

                      {activity.description ? (
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {activity.description}
                        </p>
                      ) : null}

                      {qualificationActivity ? (
                        <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                          Qualification update
                        </span>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">
                  No activity has been recorded yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Counselling
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Counselling readiness
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Once the Team Leader completes qualification and marks the lead ready, the Network Manager can review the same history and schedule the counselling session.
            </p>

            {lead.counsellingSessions.length > 0 ? (
              <div className="mt-4 space-y-3">
                {lead.counsellingSessions.map(
                  (session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {formatDate(session.scheduledAt)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {session.mode} · {session.durationMinutes} min ·{" "}
                        {humanize(session.status)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No counselling session has been scheduled yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function PersonCard({
  label,
  person,
}: {
  label: string;
  person: LeadDetail["lead"]["tgnOwner"];
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      {person ? (
        <>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {person.user.name || "TGN Member"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {person.user.email}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {humanize(person.memberType)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          Not assigned
        </p>
      )}
    </div>
  );
}

"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export type FollowUpStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export interface LeadFollowUpItem {
  id: string;
  scheduledAt: string | Date;
  status: FollowUpStatus;
  note?: string | null;
  assignedTo?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface LeadFollowUpProps {
  leadId: string;
  followUps: LeadFollowUpItem[];
  loading?: boolean;
  onChanged?: () => void;
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusConfig(status: FollowUpStatus) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        icon: XCircle,
        className:
          "bg-red-50 text-red-700 ring-red-200",
      };

    case "PENDING":
    default:
      return {
        label: "Pending",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700 ring-amber-200",
      };
  }
}

export default function LeadFollowUp({
  leadId,
  followUps,
  loading = false,
  onChanged,
}: LeadFollowUpProps) {
  const [showForm, setShowForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function createFollowUp() {
    if (!scheduledAt) {
      setError("Please select a follow-up date and time.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/leads/${leadId}/follow-ups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduledAt: new Date(scheduledAt).toISOString(),
            note: note.trim() || undefined,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to create follow-up.",
        );
      }

      setScheduledAt("");
      setNote("");
      setShowForm(false);
      onChanged?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create follow-up.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateFollowUp(
    followUpId: string,
    status: FollowUpStatus,
  ) {
    setUpdatingId(followUpId);
    setError("");

    try {
      const response = await fetch(
        `/api/leads/${leadId}/follow-ups/${followUpId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update follow-up.",
        );
      }

      onChanged?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update follow-up.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Follow-ups
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Schedule and manage your next actions for this lead.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />

          {showForm ? "Close" : "Add follow-up"}
        </button>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-700">
                Date & time
              </span>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) =>
                  setScheduledAt(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block sm:col-span-1">
              <span className="mb-1.5 block text-xs font-medium text-slate-700">
                Note
              </span>

              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What needs to be discussed?"
                maxLength={2000}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={createFollowUp}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CalendarClock className="h-3.5 w-3.5" />
              )}

              {submitting ? "Saving..." : "Schedule follow-up"}
            </button>
          </div>
        </div>
      ) : null}

      {error && !showForm ? (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-48 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-64 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
          <CalendarClock className="mx-auto h-5 w-5 text-slate-400" />

          <p className="mt-3 text-sm font-medium text-slate-700">
            No follow-ups scheduled
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Add a follow-up to make sure this lead never gets missed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((followUp) => {
            const status = getStatusConfig(followUp.status);
            const StatusIcon = status.icon;
            const isUpdating = updatingId === followUp.id;

            return (
              <div
                key={followUp.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <CalendarClock className="h-4 w-4 text-slate-400" />

                        {formatDate(followUp.scheduledAt)}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${status.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />

                        {status.label}
                      </span>
                    </div>

                    {followUp.note ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {followUp.note}
                      </p>
                    ) : null}

                    {followUp.assignedTo ? (
                      <p className="mt-2 text-xs text-slate-400">
                        Assigned to: {followUp.assignedTo}
                      </p>
                    ) : null}
                  </div>

                  {followUp.status === "PENDING" ? (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          updateFollowUp(
                            followUp.id,
                            "COMPLETED",
                          )
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}

                        Complete
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          updateFollowUp(
                            followUp.id,
                            "CANCELLED",
                          )
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />

                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
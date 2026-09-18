"use client";

import {
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  Edit3,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import LeadActivityTimeline, {
  type LeadActivityItem,
} from "./LeadActivityTimeline";

import LeadEditor, {
  type LeadEditorData,
} from "./LeadEditor";

import LeadFollowUp, {
  type LeadFollowUpItem,
} from "./LeadFollowUp";

interface LeadDrawerProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

interface LeadDetails extends LeadEditorData {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  activities: LeadActivityItem[];
  followUps: LeadFollowUpItem[];
}

type DrawerView = "details" | "edit";

const statusStyles: Record<
  LeadEditorData["status"],
  string
> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  CONTACTED:
    "bg-violet-50 text-violet-700 ring-violet-200",
  QUALIFIED:
    "bg-amber-50 text-amber-700 ring-amber-200",
  ENROLLED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CLOSED:
    "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatDate(
  value?: string | Date | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatStatus(
  status: LeadEditorData["status"],
) {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

/**
 * Normalizes Indian phone numbers for WhatsApp.
 *
 * Examples:
 * 9876543210      -> 919876543210
 * 09876543210     -> 919876543210
 * +919876543210   -> 919876543210
 * 919876543210    -> 919876543210
 *
 * For numbers that are already in another
 * international format, the digits are preserved.
 */
function normalizeWhatsAppPhone(
  phone: string,
) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Indian number entered with a leading 0.
  if (digits.startsWith("0")) {
    const withoutLeadingZero =
      digits.replace(/^0+/, "");

    if (
      withoutLeadingZero.length === 10
    ) {
      return `91${withoutLeadingZero}`;
    }

    return `91${withoutLeadingZero}`;
  }

  // Standard 10-digit Indian mobile number.
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Already contains India's country code.
  if (
    digits.startsWith("91") &&
    digits.length >= 12
  ) {
    return digits;
  }

  // Preserve an already international number.
  return digits;
}

function getContactHref(
  preferredContact: LeadEditorData["preferredContact"],
  phone: string,
  email: string,
) {
  if (preferredContact === "EMAIL") {
    return `mailto:${email}`;
  }

  if (preferredContact === "PHONE") {
    return `tel:${phone}`;
  }

  const whatsappPhone =
    normalizeWhatsAppPhone(phone);

  if (!whatsappPhone) {
    return "";
  }

  return `https://api.whatsapp.com/send?phone=${whatsappPhone}`;
}

export default function LeadDrawer({
  leadId,
  open,
  onClose,
  onChanged,
}: LeadDrawerProps) {
  const [lead, setLead] =
    useState<LeadDetails | null>(null);

  const [view, setView] =
    useState<DrawerView>("details");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadLead() {
    if (!leadId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/leads/${leadId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to load lead.",
        );
      }

      const loadedLead =
        data?.lead ?? data;

      setLead({
        ...loadedLead,
        activities:
          loadedLead?.activities ?? [],
        followUps:
          loadedLead?.followUps ?? [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load lead.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !leadId) {
      return;
    }

    setView("details");
    void loadLead();
  }, [open, leadId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  function handleSaved(
    savedLead: LeadEditorData,
  ) {
    setLead((current) => {
      if (!current) {
        return {
          ...savedLead,
          activities: [],
          followUps: [],
        };
      }

      return {
        ...current,
        ...savedLead,
      };
    });

    setView("details");
    onChanged?.();

    void loadLead();
  }

  function handleChildChanged() {
    void loadLead();
    onChanged?.();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close lead drawer"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[720px] flex-col border-l border-slate-200 bg-[#F8FAFC] shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {view === "edit" ? (
              <button
                type="button"
                onClick={() =>
                  setView("details")
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="Back to lead details"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <UserRound className="h-4 w-4" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                {view === "edit"
                  ? "Edit lead"
                  : "Lead details"}
              </p>

              <h2 className="truncate text-base font-semibold text-slate-950">
                {view === "edit"
                  ? "Update lead"
                  : lead?.fullName ||
                    "Lead"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === "details" &&
            lead ? (
              <button
                type="button"
                onClick={() =>
                  setView("edit")
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && !lead ? (
            <div className="flex min-h-[520px] items-center justify-center px-6">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading lead...
              </div>
            </div>
          ) : error && !lead ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                <RefreshCw className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                Unable to load lead
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadLead()
                }
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : view === "edit" &&
            lead ? (
            <div className="p-5">
              <LeadEditor
                lead={lead}
                onSaved={handleSaved}
                onCancel={() =>
                  setView("details")
                }
              />
            </div>
          ) : lead ? (
            <div className="space-y-5 p-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-950">
                          {lead.fullName}
                        </h3>

                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {
                            lead.interestedProgram
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      statusStyles[
                        lead.status
                      ]
                    }`}
                  >
                    {formatStatus(
                      lead.status,
                    )}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition hover:bg-slate-50"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                    <span className="min-w-0 truncate text-sm text-slate-700">
                      {lead.email}
                    </span>
                  </a>

                  <a
                    href={`tel:${lead.phone}`}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />

                    <span className="min-w-0 truncate text-sm text-slate-700">
                      {lead.phone}
                    </span>
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={getContactHref(
                      "PHONE",
                      lead.phone,
                      lead.email,
                    )}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>

                  <a
                    href={getContactHref(
                      "WHATSAPP",
                      lead.phone,
                      lead.email,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={
                      !normalizeWhatsAppPhone(
                        lead.phone,
                      )
                    }
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition ${
                      normalizeWhatsAppPhone(
                        lead.phone,
                      )
                        ? "hover:bg-slate-50"
                        : "pointer-events-none opacity-50"
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                    <ArrowUpRight className="h-3 w-3 text-slate-400" />
                  </a>

                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const element =
                        document.getElementById(
                          "lead-follow-ups",
                        );

                      element?.scrollIntoView(
                        {
                          behavior: "smooth",
                          block: "start",
                        },
                      );
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Follow-up
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Current status
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {lead.currentStatus ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Preferred contact
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {
                        lead.preferredContact
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Lead source
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {lead.source ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Assigned to
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {lead.assignedTo ||
                        "Unassigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Career goal
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {lead.careerGoal ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Created
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDate(
                        lead.createdAt,
                      )}
                    </p>
                  </div>
                </div>

                {lead.notes ? (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {lead.notes}
                    </p>
                  </div>
                ) : null}

                {lead.closedReason ? (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Closed reason
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {lead.closedReason}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <LeadActivityTimeline
                  activities={
                    lead.activities
                  }
                  loading={loading}
                />
              </section>

              <section
                id="lead-follow-ups"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <LeadFollowUp
                  leadId={
                    lead.id as string
                  }
                  followUps={
                    lead.followUps
                  }
                  loading={loading}
                  onChanged={
                    handleChildChanged
                  }
                />
              </section>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
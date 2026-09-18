"use client";

import {
  ArrowUpRight,
  ChevronDown,
  Eye,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "ENROLLED"
  | "CLOSED";

export interface LeadTableItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentStatus: string;
  interestedProgram: string;
  status: LeadStatus;
  preferredContact: "WHATSAPP" | "PHONE" | "EMAIL";
  source?: string | null;
  assignedTo?: string | null;
  createdAt?: string | Date;
}

interface LeadTableProps {
  leads: LeadTableItem[];
  loading?: boolean;
  onView?: (leadId: string) => void;
  onEdit?: (lead: LeadTableItem) => void;
  onDelete?: (lead: LeadTableItem) => void;
  onStatusChange?: (
    lead: LeadTableItem,
    status: LeadStatus,
  ) => void;
}

const statusStyles: Record<LeadStatus, string> = {
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

const statusOptions: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ENROLLED",
  "CLOSED",
];

function formatStatus(status: LeadStatus) {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function formatDate(value?: string | Date) {
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

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "#";
  }

  let internationalNumber = digits;

  // Indian 10-digit mobile number.
  if (digits.length === 10) {
    internationalNumber = `91${digits}`;
  }

  // Indian number entered with a leading 0.
  else if (
    digits.length === 11 &&
    digits.startsWith("0")
  ) {
    internationalNumber = `91${digits.slice(1)}`;
  }

  // Already normalized Indian number.
  else if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    internationalNumber = digits;
  }

  return `https://api.whatsapp.com/send?phone=${internationalNumber}`;
}
export default function LeadTable({
  leads,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: LeadTableProps) {
  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden border-b border-slate-200 px-5 py-3 md:grid md:grid-cols-[1.6fr_1.4fr_1fr_1fr_0.9fr_40px] md:gap-4">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-3 animate-pulse rounded bg-slate-100"
              />
            ),
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="grid gap-3 p-4 md:grid-cols-[1.6fr_1.4fr_1fr_1fr_0.9fr_40px] md:items-center md:gap-4"
              >
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />

                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />

                <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />

                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <Eye className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No leads found
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
          Try changing your search or filters, or add
          a new lead to start building your pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1.6fr_1.4fr_1fr_1fr_0.9fr_40px] gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Lead
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Program
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Source
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Status
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Created
          </p>

          <span />
        </div>

        <div className="divide-y divide-slate-100">
          {leads.map((lead, index) => {
            const openUpward =
              index >= Math.max(0, leads.length - 2);

            return (
              <LeadRow
                key={lead.id}
                lead={lead}
                menuOpen={openMenu === lead.id}
                menuPlacement={
                  openUpward ? "up" : "down"
                }
                onMenuToggle={() =>
                  setOpenMenu(
                    openMenu === lead.id
                      ? null
                      : lead.id,
                  )
                }
                onView={() => {
                  setOpenMenu(null);
                  onView?.(lead.id);
                }}
                onEdit={() => {
                  setOpenMenu(null);
                  onEdit?.(lead);
                }}
                onDelete={() => {
                  setOpenMenu(null);
                  onDelete?.(lead);
                }}
                onStatusChange={(status) => {
                  setOpenMenu(null);
                  onStatusChange?.(
                    lead,
                    status,
                  );
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-slate-100 md:hidden">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  onView?.(lead.id)
                }
                className="min-w-0 text-left"
              >
                <p className="truncate text-sm font-semibold text-slate-900">
                  {lead.fullName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {lead.email}
                </p>
              </button>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                  statusStyles[lead.status]
                }`}
              >
                {formatStatus(lead.status)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Program
                </p>

                <p className="mt-1 truncate text-xs font-medium text-slate-700">
                  {lead.interestedProgram}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Source
                </p>

                <p className="mt-1 truncate text-xs font-medium text-slate-700">
                  {lead.source || "—"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>

              <a
                href={getWhatsAppUrl(
                  lead.phone,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>

              <a
                href={`mailto:${lead.email}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>

              <button
                type="button"
                onClick={() =>
                  onView?.(lead.id)
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 text-xs font-semibold text-white"
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Added {formatDate(lead.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LeadRowProps {
  lead: LeadTableItem;
  menuOpen: boolean;
  menuPlacement: "up" | "down";
  onMenuToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (
    status: LeadStatus,
  ) => void;
}

function LeadRow({
  lead,
  menuOpen,
  menuPlacement,
  onMenuToggle,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: LeadRowProps) {
  return (
    <div className="grid grid-cols-[1.6fr_1.4fr_1fr_1fr_0.9fr_40px] items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70">
      <button
        type="button"
        onClick={onView}
        className="min-w-0 text-left"
      >
        <p className="truncate text-sm font-semibold text-slate-900">
          {lead.fullName}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {lead.email}
        </p>

        <p className="mt-1 truncate text-[11px] text-slate-400">
          {lead.phone}
        </p>
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">
          {lead.interestedProgram}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {lead.currentStatus}
        </p>
      </div>

      <p className="truncate text-sm text-slate-600">
        {lead.source || "—"}
      </p>

      <div>
        <select
          value={lead.status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as LeadStatus,
            )
          }
          className={`h-8 max-w-full cursor-pointer appearance-none rounded-full border-0 px-2.5 pr-7 text-[11px] font-semibold outline-none ring-1 ${
            statusStyles[lead.status]
          }`}
          aria-label={`Change status for ${lead.fullName}`}
        >
          {statusOptions.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {formatStatus(status)}
              </option>
            ),
          )}
        </select>
      </div>

      <p className="text-xs text-slate-500">
        {formatDate(lead.createdAt)}
      </p>

      <div className="relative flex justify-end">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Actions for ${lead.fullName}`}
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen ? (
          <div
            className={[
              "absolute right-0 z-30 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]",
              menuPlacement === "up"
                ? "bottom-10"
                : "top-10",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={onView}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5 text-slate-400" />

              View details

              <ArrowUpRight className="ml-auto h-3 w-3 text-slate-300" />
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit lead
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />

              Delete lead
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
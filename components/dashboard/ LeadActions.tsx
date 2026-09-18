"use client";

import {
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "ENROLLED"
  | "CLOSED";

export interface LeadEditorData {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  currentStatus: string;
  interestedProgram: string;
  careerGoal?: string | null;
  preferredContact: "WHATSAPP" | "PHONE" | "EMAIL";
  status: LeadStatus;
  source?: string | null;
  notes?: string | null;
  assignedTo?: string | null;
  closedReason?: string | null;
}

interface LeadEditorProps {
  lead?: LeadEditorData | null;
  onSaved?: (lead: LeadEditorData) => void;
  onCancel?: () => void;
}

const statusOptions: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ENROLLED",
  "CLOSED",
];

const contactOptions = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE", label: "Phone" },
  { value: "EMAIL", label: "Email" },
] as const;

const inputClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const selectClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const textareaClassName =
  "min-h-[100px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
        {required ? (
          <span className="ml-1 text-red-500">*</span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function getInitialData(
  lead?: LeadEditorData | null,
): LeadEditorData {
  return {
    id: lead?.id,
    fullName: lead?.fullName ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    currentStatus: lead?.currentStatus ?? "",
    interestedProgram: lead?.interestedProgram ?? "",
    careerGoal: lead?.careerGoal ?? "",
    preferredContact: lead?.preferredContact ?? "WHATSAPP",
    status: lead?.status ?? "NEW",
    source: lead?.source ?? "",
    notes: lead?.notes ?? "",
    assignedTo: lead?.assignedTo ?? "",
    closedReason: lead?.closedReason ?? "",
  };
}

export default function LeadEditor({
  lead,
  onSaved,
  onCancel,
}: LeadEditorProps) {
  const [form, setForm] = useState<LeadEditorData>(
    () => getInitialData(lead),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(lead?.id);

  function updateField<K extends keyof LeadEditorData>(
    field: K,
    value: LeadEditorData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (form.fullName.trim().length < 3) {
      setError("Please enter the lead's full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    if (!form.currentStatus.trim()) {
      setError("Please enter the current status.");
      return;
    }

    if (!form.interestedProgram.trim()) {
      setError("Please enter the interested program.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        currentStatus: form.currentStatus.trim(),
        interestedProgram: form.interestedProgram.trim(),
        careerGoal: form.careerGoal?.trim() || undefined,
        preferredContact: form.preferredContact,
        status: form.status,
        source: form.source?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        assignedTo: form.assignedTo?.trim() || undefined,
        closedReason:
          form.status === "CLOSED"
            ? form.closedReason?.trim() || undefined
            : undefined,
      };

      const response = await fetch(
        isEditing
          ? `/api/leads/${form.id}`
          : "/api/leads",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to ${isEditing ? "update" : "create"} lead.`,
        );
      }

      const savedLead = data?.lead ?? data;

      onSaved?.({
        ...form,
        ...savedLead,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "create"} lead.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {isEditing ? "Edit lead" : "Add new lead"}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {isEditing
            ? "Update the lead information and CRM details."
            : "Create a new lead and add it to the TechSkillHub CRM."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) =>
              updateField("fullName", event.target.value)
            }
            placeholder="e.g. Rahul Sharma"
            className={inputClassName}
            maxLength={150}
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            placeholder="rahul@example.com"
            className={inputClassName}
          />
        </Field>

        <Field label="Phone" required>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) =>
              updateField("phone", event.target.value)
            }
            placeholder="+91 98765 43210"
            className={inputClassName}
            maxLength={15}
          />
        </Field>

        <Field label="Current status" required>
          <input
            type="text"
            value={form.currentStatus}
            onChange={(event) =>
              updateField(
                "currentStatus",
                event.target.value,
              )
            }
            placeholder="e.g. Student / Working Professional"
            className={inputClassName}
            maxLength={100}
          />
        </Field>

        <Field label="Interested program" required>
          <input
            type="text"
            value={form.interestedProgram}
            onChange={(event) =>
              updateField(
                "interestedProgram",
                event.target.value,
              )
            }
            placeholder="e.g. CodeForge"
            className={inputClassName}
            maxLength={150}
          />
        </Field>

        <Field label="Lead status">
          <select
            value={form.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value as LeadStatus,
              )
            }
            className={selectClassName}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) +
                  status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Preferred contact">
          <select
            value={form.preferredContact}
            onChange={(event) =>
              updateField(
                "preferredContact",
                event.target.value as LeadEditorData["preferredContact"],
              )
            }
            className={selectClassName}
          >
            {contactOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Lead source">
          <input
            type="text"
            value={form.source ?? ""}
            onChange={(event) =>
              updateField("source", event.target.value)
            }
            placeholder="e.g. Instagram, Referral, Website"
            className={inputClassName}
            maxLength={100}
          />
        </Field>

        <Field label="Assigned to">
          <input
            type="text"
            value={form.assignedTo ?? ""}
            onChange={(event) =>
              updateField(
                "assignedTo",
                event.target.value,
              )
            }
            placeholder="Counsellor / team member"
            className={inputClassName}
            maxLength={150}
          />
        </Field>

        <Field label="Career goal">
          <input
            type="text"
            value={form.careerGoal ?? ""}
            onChange={(event) =>
              updateField(
                "careerGoal",
                event.target.value,
              )
            }
            placeholder="What does the lead want to achieve?"
            className={inputClassName}
            maxLength={500}
          />
        </Field>
      </div>

      {form.status === "CLOSED" ? (
        <Field label="Closed reason">
          <input
            type="text"
            value={form.closedReason ?? ""}
            onChange={(event) =>
              updateField(
                "closedReason",
                event.target.value,
              )
            }
            placeholder="Why was this lead closed?"
            className={inputClassName}
            maxLength={500}
          />
        </Field>
      ) : null}

      <Field label="Notes">
        <textarea
          value={form.notes ?? ""}
          onChange={(event) =>
            updateField("notes", event.target.value)
          }
          placeholder="Add useful context about this lead..."
          className={textareaClassName}
          maxLength={5000}
        />
      </Field>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium leading-5 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}

          {saving
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create lead"}
        </button>
      </div>
    </form>
  );
}
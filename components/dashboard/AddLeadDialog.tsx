"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Mail,
  Phone,
  UserPlus,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { flagshipPrograms } from "@/lib/data/programs";

interface AddLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  currentStatus: string;
  interestedProgram: string;
  careerGoal: string;
  preferredContact:
    | "WHATSAPP"
    | "PHONE"
    | "EMAIL";
}

interface DuplicateLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  interestedProgram: string;
  createdAt?: string;
  matchedBy?: Array<
    "email" | "phone"
  >;
}

interface DuplicateState {
  lead: DuplicateLead;
  matchedBy: Array<
    "email" | "phone"
  >;
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  currentStatus: "",
  interestedProgram: "",
  careerGoal: "",
  preferredContact: "WHATSAPP",
};

const currentStatusOptions = [
  "12th Student",
  "College Student",
  "Graduate",
  "Working Professional",
  "Career Switcher",
  "Freelancer",
  "Entrepreneur",
  "Other",
];

function formatStatus(status: string) {
  if (!status) {
    return "—";
  }

  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function formatMatchedBy(
  matchedBy: Array<
    "email" | "phone"
  >,
) {
  if (
    matchedBy.includes("email") &&
    matchedBy.includes("phone")
  ) {
    return "email address and phone number";
  }

  if (matchedBy.includes("email")) {
    return "email address";
  }

  if (matchedBy.includes("phone")) {
    return "phone number";
  }

  return "contact details";
}

export default function AddLeadDialog({
  open,
  onClose,
  onCreated,
}: AddLeadDialogProps) {
  const [form, setForm] =
    useState<FormState>(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [duplicate, setDuplicate] =
    useState<DuplicateState | null>(
      null,
    );

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError("");
      setDuplicate(null);
      setSubmitting(false);
    }
  }, [open]);

  function updateField<
    K extends keyof FormState,
  >(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!form.fullName.trim()) {
      setError(
        "Please enter the lead's full name.",
      );
      return false;
    }

    if (!form.email.trim()) {
      setError(
        "Please enter the lead's email address.",
      );
      return false;
    }

    if (!form.phone.trim()) {
      setError(
        "Please enter the lead's phone number.",
      );
      return false;
    }

    if (!form.currentStatus) {
      setError(
        "Please select the current status.",
      );
      return false;
    }

    if (!form.interestedProgram) {
      setError(
        "Please select an interested program.",
      );
      return false;
    }

    return true;
  }

  async function createLead(
    allowDuplicate = false,
  ) {
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/leads",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fullName:
              form.fullName.trim(),

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),

            currentStatus:
              form.currentStatus,

            interestedProgram:
              form.interestedProgram,

            careerGoal:
              form.careerGoal.trim() ||
              undefined,

            preferredContact:
              form.preferredContact,

            ...(allowDuplicate
              ? {
                  allowDuplicate: true,
                }
              : {}),
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      /*
       * The API deliberately returns 409 for
       * possible duplicate leads.
       */
      if (
        response.status === 409 &&
        data?.code ===
          "DUPLICATE_LEAD" &&
        data?.duplicate
      ) {
        const duplicateLead =
          data.duplicate as DuplicateLead;

        setDuplicate({
          lead: duplicateLead,
          matchedBy:
            duplicateLead.matchedBy ??
            [],
        });

        return;
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        const firstValidationError =
          data?.errors?.fieldErrors
            ? Object.values(
                data.errors.fieldErrors,
              )
                .flat()
                .find(Boolean)
            : null;

        throw new Error(
          firstValidationError ||
            data?.message ||
            "Unable to create lead.",
        );
      }

      setDuplicate(null);
      onCreated();
    } catch (submitError) {
      console.error(
        "Create lead error:",
        submitError,
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create lead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setDuplicate(null);

    if (!validateForm()) {
      return;
    }

    await createLead(false);
  }

  async function handleCreateAnyway() {
    if (submitting) {
      return;
    }

    setDuplicate(null);

    await createLead(true);
  }

  function handleOpenExisting() {
    if (!duplicate?.lead.id) {
      return;
    }

    /*
     * The existing Leads page already owns the
     * drawer state. Passing the ID through the
     * URL keeps this component independent and
     * avoids introducing a global event bus.
     *
     * The page can consume this parameter in the
     * next workspace synchronization step.
     */
    const url =
      `/dashboard/leads?lead=${encodeURIComponent(
        duplicate.lead.id,
      )}`;

    window.location.assign(url);
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              !submitting &&
              handleClose()
            }
            className="fixed inset-0 z-[60] bg-slate-950/35 backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 16,
                scale: 0.98,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
              className="w-full max-w-[620px] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.20)]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                      CRM · LEADS
                    </p>

                    <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950">
                      Add new lead
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {duplicate ? (
                  <motion.div
                    key="duplicate"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    className="px-6 py-6"
                  >
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <AlertTriangle className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-950">
                            Duplicate lead
                            detected
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            A lead already
                            exists with the
                            same{" "}
                            <span className="font-semibold text-slate-800">
                              {formatMatchedBy(
                                duplicate.matchedBy,
                              )}
                            </span>
                            .
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-amber-200/80 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-950">
                              {
                                duplicate
                                  .lead
                                  .fullName
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {
                                duplicate
                                  .lead
                                  .email
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                duplicate
                                  .lead
                                  .phone
                              }
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            {formatStatus(
                              duplicate
                                .lead
                                .status,
                            )}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Program
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                              {
                                duplicate
                                  .lead
                                  .interestedProgram
                              }
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              CRM status
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700">
                              {formatStatus(
                                duplicate
                                  .lead
                                  .status,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-[11px] leading-5 text-slate-500">
                        Review the existing
                        lead before creating
                        another record. If this
                        is intentionally a
                        separate lead, you can
                        continue anyway.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{
                      opacity: 0,
                      x: -12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 12,
                    }}
                    onSubmit={handleSubmit}
                  >
                    <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                      {error && (
                        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
                          {error}
                        </div>
                      )}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Full name"
                          required
                          icon={
                            <UserPlus className="h-4 w-4" />
                          }
                        >
                          <input
                            value={
                              form.fullName
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "fullName",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="e.g. Aarav Patel"
                            autoComplete="name"
                            className={
                              inputClass
                            }
                          />
                        </Field>

                        <Field
                          label="Phone"
                          required
                          icon={
                            <Phone className="h-4 w-4" />
                          }
                        >
                          <input
                            value={
                              form.phone
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "phone",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="e.g. 9876543210"
                            autoComplete="tel"
                            inputMode="tel"
                            maxLength={15}
                            className={
                              inputClass
                            }
                          />
                        </Field>

                        <Field
                          label="Email"
                          required
                          icon={
                            <Mail className="h-4 w-4" />
                          }
                        >
                          <input
                            type="email"
                            value={
                              form.email
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "email",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="name@example.com"
                            autoComplete="email"
                            className={
                              inputClass
                            }
                          />
                        </Field>

                        <Field
                          label="Current status"
                          required
                        >
                          <select
                            value={
                              form.currentStatus
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "currentStatus",
                                event.target
                                  .value,
                              )
                            }
                            className={
                              inputClass
                            }
                          >
                            <option value="">
                              Select status
                            </option>

                            {currentStatusOptions.map(
                              (
                                status,
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </Field>

                        <Field
                          label="Interested program"
                          required
                          className="sm:col-span-2"
                        >
                          <select
                            value={
                              form.interestedProgram
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "interestedProgram",
                                event.target
                                  .value,
                              )
                            }
                            className={
                              inputClass
                            }
                          >
                            <option value="">
                              Select program
                            </option>

                            {flagshipPrograms.map(
                              (
                                program,
                              ) => (
                                <option
                                  key={
                                    program.slug
                                  }
                                  value={
                                    program.shortTitle
                                  }
                                >
                                  {
                                    program.shortTitle
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </Field>

                        <Field
                          label="Career goal"
                          className="sm:col-span-2"
                        >
                          <input
                            value={
                              form.careerGoal
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "careerGoal",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="e.g. Become a full-stack developer"
                            className={
                              inputClass
                            }
                          />
                        </Field>

                        <Field
                          label="Preferred contact"
                          required
                          className="sm:col-span-2"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                value:
                                  "WHATSAPP",
                                label:
                                  "WhatsApp",
                              },
                              {
                                value:
                                  "PHONE",
                                label:
                                  "Phone",
                              },
                              {
                                value:
                                  "EMAIL",
                                label:
                                  "Email",
                              },
                            ].map(
                              (
                                option,
                              ) => {
                                const active =
                                  form.preferredContact ===
                                  option.value;

                                return (
                                  <button
                                    key={
                                      option.value
                                    }
                                    type="button"
                                    onClick={() =>
                                      updateField(
                                        "preferredContact",
                                        option.value as FormState["preferredContact"],
                                      )
                                    }
                                    className={[
                                      "h-11 rounded-xl border text-xs font-semibold transition",
                                      active
                                        ? "border-blue-200 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    {
                                      option.label
                                    }
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </Field>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={
                          handleClose
                        }
                        disabled={
                          submitting
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={
                          submitting
                        }
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-xs font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Create lead
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {duplicate && (
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setDuplicate(
                        null,
                      );
                      setError("");
                    }}
                    disabled={submitting}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Back to form
                  </button>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        handleOpenExisting
                      }
                      disabled={
                        submitting
                      }
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Open existing
                      <ArrowUpRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCreateAnyway
                      }
                      disabled={
                        submitting
                      }
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create anyway"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5";

function Field({
  label,
  required,
  icon,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={[
        "block",
        className,
      ].join(" ")}
    >
      <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {icon}
        {label}
        {required && (
          <span className="text-blue-600">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
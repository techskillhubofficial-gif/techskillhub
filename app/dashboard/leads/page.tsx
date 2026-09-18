"use client";

import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Users,
  UserPlus,
  PhoneCall,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DeleteDialog from "@/components/dashboard/DeleteDialog";
import LeadDrawer from "@/components/dashboard/LeadDrawer";
import LeadTable, {
  type LeadTableItem,
} from "@/components/dashboard/LeadTable";
import AddLeadDialog from "@/components/dashboard/AddLeadDialog";

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  enrolled: number;
  closed: number;
}

interface LeadsResponse {
  leads: LeadTableItem[];
  stats: LeadStats;
}

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "ENROLLED"
  | "CLOSED";

export default function LeadsPage() {
  const [leads, setLeads] = useState<
    LeadTableItem[]
  >([]);

  const [stats, setStats] =
    useState<LeadStats>({
      total: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      enrolled: 0,
      closed: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [addLeadOpen, setAddLeadOpen] =
    useState(false);

  const [selectedLeadId, setSelectedLeadId] =
    useState<string | null>(null);

  const [deleteLead, setDeleteLead] =
    useState<LeadTableItem | null>(null);

  const [deletingLeadId, setDeletingLeadId] =
    useState<string | null>(null);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
    ) => {
      setToast({
        type,
        message,
      });
    },
    [],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);

  const fetchLeads = useCallback(
    async () => {
      setLoading(true);
      setPageError(null);

      try {
        const response = await fetch(
          "/api/leads",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as
            | LeadsResponse
            | {
                error?: string;
              };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Unable to load leads.",
          );
        }

        if (
          !("leads" in data) ||
          !("stats" in data)
        ) {
          throw new Error(
            "Invalid leads response.",
          );
        }

        setLeads(data.leads);
        setStats(data.stats);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load leads.";

        setPageError(message);

        showToast("error", message);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads, refreshKey]);

  const handleLeadCreated =
    useCallback(() => {
      setAddLeadOpen(false);
      setRefreshKey(
        (current) => current + 1,
      );

      showToast(
        "success",
        "Lead added successfully.",
      );
    }, [showToast]);

  const handleStatusChange = useCallback(
    async (
      lead: LeadTableItem,
      status: LeadStatus,
    ) => {
      if (
        statusUpdatingId === lead.id ||
        lead.status === status
      ) {
        return;
      }

      setStatusUpdatingId(lead.id);

      try {
        const response = await fetch(
          `/api/leads/${lead.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
            }),
          },
        );

        const data =
          (await response.json()) as {
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Unable to update lead status.",
          );
        }

        setLeads((current) =>
          current.map((item) =>
            item.id === lead.id
              ? {
                  ...item,
                  status,
                }
              : item,
          ),
        );

        setStats((current) => {
          const next = {
            ...current,
          };

          const oldKey =
            lead.status.toLowerCase() as keyof LeadStats;

          const newKey =
            status.toLowerCase() as keyof LeadStats;

          if (
            oldKey !== "total" &&
            oldKey in next &&
            typeof next[oldKey] ===
              "number"
          ) {
            next[oldKey] = Math.max(
              0,
              next[oldKey] - 1,
            );
          }

          if (
            newKey !== "total" &&
            newKey in next &&
            typeof next[newKey] ===
              "number"
          ) {
            next[newKey] += 1;
          }

          return next;
        });

        showToast(
          "success",
          `${lead.fullName}'s status was updated.`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update lead status.";

        showToast("error", message);
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [showToast, statusUpdatingId],
  );

  const handleDeleteRequest =
    useCallback(
      (lead: LeadTableItem) => {
        if (deletingLeadId) {
          return;
        }

        setDeleteLead(lead);
      },
      [deletingLeadId],
    );

  const handleDeleteConfirm =
    useCallback(async () => {
      if (
        !deleteLead ||
        deletingLeadId
      ) {
        return;
      }

      const leadToDelete = deleteLead;

      setDeletingLeadId(
        leadToDelete.id,
      );

      try {
        const response = await fetch(
          `/api/leads/${leadToDelete.id}`,
          {
            method: "DELETE",
          },
        );

        const data =
          (await response.json()) as {
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Unable to delete lead.",
          );
        }

        setDeleteLead(null);

        if (
          selectedLeadId ===
          leadToDelete.id
        ) {
          setSelectedLeadId(null);
        }

        setRefreshKey(
          (current) => current + 1,
        );

        showToast(
          "success",
          `${leadToDelete.fullName} was permanently deleted.`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete lead.";

        showToast("error", message);
      } finally {
        setDeletingLeadId(null);
      }
    }, [
      deleteLead,
      deletingLeadId,
      selectedLeadId,
      showToast,
    ]);

  const handleDrawerChanged =
    useCallback(() => {
      setRefreshKey(
        (current) => current + 1,
      );
    }, []);

  const hasLeads = leads.length > 0;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Leads"
        description="Manage prospects, follow-ups, and the admissions pipeline."
      />

      {/* Toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -12,
              scale: 0.98,
            }}
            className="fixed right-5 top-5 z-[150] w-[min(390px,calc(100vw-40px))]"
          >
            <div
              className={[
                "flex items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-xl",
                toast.type === "success"
                  ? "border-emerald-100"
                  : "border-red-100",
              ].join(" ")}
            >
              {toast.type ===
              "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              )}

              <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-slate-700">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  setToast(null)
                }
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Error banner */}
      <AnimatePresence>
        {pageError && !hasLeads ? (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  We couldn't load your
                  leads.
                </p>

                <p className="mt-0.5 text-xs text-red-600">
                  {pageError}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setRefreshKey(
                  (current) =>
                    current + 1,
                )
              }
              className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            >
              Try again
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Total Leads",
            value: stats.total,
            icon: Users,
          },
          {
            label: "New",
            value: stats.new,
            icon: UserPlus,
          },
          {
            label: "Contacted",
            value: stats.contacted,
            icon: PhoneCall,
          },
          {
            label: "Qualified",
            value: stats.qualified,
            icon: GraduationCap,
          },
          {
            label: "Enrolled",
            value: stats.enrolled,
            icon: CheckCircle2,
          },
          {
            label: "Closed",
            value: stats.closed,
            icon: X,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {loading
                      ? "—"
                      : stat.value}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main CRM workspace */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-950">
              Lead pipeline
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage your latest
              prospects.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setAddLeadOpen(true)
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add lead
          </button>
        </div>

        {loading && !hasLeads ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading leads...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching your CRM data.
            </p>
          </div>
        ) : !hasLeads ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No leads yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Start building your admissions
              pipeline by adding your first
              lead.
            </p>

            <button
              type="button"
              onClick={() =>
                setAddLeadOpen(true)
              }
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add your first lead
            </button>
          </div>
        ) : (
          <div className="relative">
            <LeadTable
              leads={leads}
              loading={loading}
              onView={(leadId) =>
                setSelectedLeadId(leadId)
              }
              onEdit={(lead) =>
                setSelectedLeadId(lead.id)
              }
              onDelete={
                handleDeleteRequest
              }
              onStatusChange={
                handleStatusChange
              }
            />

            {statusUpdatingId ? (
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-lg">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating lead...
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Delete confirmation */}
      <DeleteDialog
        open={Boolean(deleteLead)}
        title="Delete lead permanently?"
        description="This will permanently remove the lead from your CRM, including its associated activity history and follow-ups. This action cannot be undone."
        itemName={deleteLead?.fullName}
        loading={Boolean(deletingLeadId)}
        onClose={() => {
          if (!deletingLeadId) {
            setDeleteLead(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />

      {/* Add lead */}
      <AddLeadDialog
        open={addLeadOpen}
        onClose={() =>
          setAddLeadOpen(false)
        }
        onCreated={handleLeadCreated}
      />

      {/* Lead drawer */}
      <LeadDrawer
  open={Boolean(selectedLeadId)}
  leadId={selectedLeadId}
  onClose={() =>
    setSelectedLeadId(null)
  }
  onChanged={handleDrawerChanged}
/>
    </div>
  );
}
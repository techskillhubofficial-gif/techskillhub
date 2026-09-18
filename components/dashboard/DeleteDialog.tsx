"use client";

import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

interface DeleteDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({
  open,
  title = "Delete lead?",
  description = "This action cannot be undone. The lead and its associated CRM activity will be permanently removed.",
  itemName,
  loading = false,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const [confirmText, setConfirmText] =
    useState("");

  useEffect(() => {
    if (!open) {
      setConfirmText("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || loading) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "Enter" &&
        confirmText === "DELETE"
      ) {
        onConfirm();
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
  }, [
    open,
    loading,
    confirmText,
    onClose,
    onConfirm,
  ]);

  if (!open) {
    return null;
  }

  const canDelete =
    confirmText === "DELETE" &&
    !loading;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <button
        type="button"
        aria-label="Close delete confirmation"
        onClick={() => {
          if (!loading) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]"
      />

      <div className="relative w-full max-w-[430px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!loading) {
                  onClose();
                }
              }}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5">
            <h2
              id="delete-dialog-title"
              className="text-lg font-bold tracking-tight text-slate-950"
            >
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>

            {itemName ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Lead
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {itemName}
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              <label
                htmlFor="delete-confirmation"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Type{" "}
                <span className="font-bold text-red-600">
                  DELETE
                </span>{" "}
                to confirm
              </label>

              <input
                id="delete-confirmation"
                type="text"
                value={confirmText}
                onChange={(event) =>
                  setConfirmText(
                    event.target.value,
                  )
                }
                disabled={loading}
                autoComplete="off"
                autoFocus
                placeholder="DELETE"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-red-300 focus:ring-4 focus:ring-red-500/5 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
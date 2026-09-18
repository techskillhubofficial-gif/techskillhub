import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Communication
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Messages
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage student and lead communications from one place.
        </p>
      </div>

      <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <MessageSquare className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Messaging workspace
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your messaging workspace is ready for the communication
            system integration.
          </p>
        </div>
      </div>
    </div>
  );
}
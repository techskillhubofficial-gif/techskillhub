import { Inbox } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-20">
      <Inbox
        className="text-slate-400"
        size={60}
      />

      <h2 className="mt-6 text-2xl font-bold">
        No Leads Yet
      </h2>

      <p className="mt-2 text-slate-500">
        Consultation requests will appear here.
      </p>
    </div>
  );
}
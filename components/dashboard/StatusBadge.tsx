type StatusBadgeProps = {
    status: string;
  };
  
  export default function StatusBadge({
    status,
  }: StatusBadgeProps) {
    const styles: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-700",
      CONTACTED: "bg-yellow-100 text-yellow-700",
      QUALIFIED: "bg-purple-100 text-purple-700",
      ENROLLED: "bg-green-100 text-green-700",
      CLOSED: "bg-gray-200 text-gray-700",
    };
  
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  }
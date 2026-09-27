import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      {title && (
        <>
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
}
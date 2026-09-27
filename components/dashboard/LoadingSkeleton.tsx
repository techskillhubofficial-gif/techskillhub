export default function LoadingSkeleton() {
    return (
      <div className="animate-pulse space-y-6">

        <div className="h-8 w-72 rounded bg-slate-200"/>

        <div className="grid grid-cols-4 gap-6">

          {[1,2,3,4].map((i)=>(
            <div
              key={i}
              className="h-40 rounded-3xl bg-slate-200"
            />
          ))}

        </div>

        <div className="h-[420px] rounded-3xl bg-slate-200"/>

      </div>
    );
  }

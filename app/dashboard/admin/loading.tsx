import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-1/3 rounded-xl" />
          <Skeleton className="h-5 w-1/4 rounded-xl" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_2fr]">
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-10 w-2/3 rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-10 rounded-full w-full" />
              <Skeleton className="h-10 rounded-full w-5/6" />
              <Skeleton className="h-10 rounded-full w-4/6" />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-10 w-1/2 rounded-xl" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-4">
                  <Skeleton className="col-span-1 h-10 rounded-md" />
                  <Skeleton className="col-span-3 h-10 rounded-md" />
                  <Skeleton className="col-span-3 h-10 rounded-md" />
                  <Skeleton className="col-span-2 h-10 rounded-md" />
                  <Skeleton className="col-span-3 h-10 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

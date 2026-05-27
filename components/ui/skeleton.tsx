import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function AdminSkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-10 w-1/3 rounded-xl" />
      <Skeleton className="h-5 w-1/4 rounded-xl" />
    </div>
  );
}

function AdminTableSkeleton({
  rowCount = 5,
  className,
}: {
  rowCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <div key={index} className="grid grid-cols-12 gap-4 items-center">
          <Skeleton className="col-span-1 h-10 rounded-md" />
          <Skeleton className="col-span-3 h-10 rounded-md" />
          <Skeleton className="col-span-3 h-10 rounded-md" />
          <Skeleton className="col-span-2 h-10 rounded-md" />
          <Skeleton className="col-span-2 h-10 rounded-md" />
          <Skeleton className="col-span-1 h-10 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function AdminCardListSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-border bg-card p-6"
        >
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/2 rounded-xl" />
            <Skeleton className="h-5 w-1/3 rounded-xl" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  AdminSkeletonHeader,
  AdminTableSkeleton,
  AdminCardListSkeleton,
};

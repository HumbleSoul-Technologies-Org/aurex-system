import React from "react";
import { Skeleton } from "./skeleton";

export default function MessagesSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <header className="mb-4">
        <Skeleton className="h-8 w-1/3 rounded-lg" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        <div className="flex flex-col min-h-[60vh] border rounded-md overflow-hidden bg-white p-3">
          <Skeleton className="h-10 w-full rounded-md mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-12 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col border rounded-md overflow-hidden bg-white p-4">
          <Skeleton className="h-8 w-1/2 rounded-md mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3 rounded-md" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

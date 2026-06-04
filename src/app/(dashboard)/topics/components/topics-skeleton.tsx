'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TopicsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overall progress skeleton */}
      <div className="border rounded-xl p-6 space-y-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>

      {/* Subject cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24 ml-auto" />
                </div>
                <div className="pl-7 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

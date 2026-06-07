'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TopicsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overall progress skeleton */}
      <div className="rounded-2xl p-6 space-y-4 glass">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 skeleton-shimmer" />
            <Skeleton className="h-4 w-56 skeleton-shimmer" />
          </div>
          <Skeleton className="h-8 w-16 skeleton-shimmer" />
        </div>
        <Skeleton className="h-3 w-full skeleton-shimmer" />
      </div>

      {/* Subject cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl glass overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-border/30 glass-strong">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl skeleton-shimmer" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 skeleton-shimmer" />
                  <Skeleton className="h-3 w-48 skeleton-shimmer" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full skeleton-shimmer" />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="rounded-xl glass p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 skeleton-shimmer" />
                  <Skeleton className="h-4 w-48 skeleton-shimmer" />
                  <Skeleton className="h-3 w-24 ml-auto skeleton-shimmer" />
                </div>
                <div className="pl-7 space-y-2">
                  <Skeleton className="h-10 w-full skeleton-shimmer" />
                  <Skeleton className="h-10 w-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

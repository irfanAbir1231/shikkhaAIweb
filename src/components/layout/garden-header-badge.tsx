'use client';

import Link from 'next/link';
import { useFocusGardenStore } from '@/lib/stores/focus-garden-store';
import { TreeDeciduous, Skull } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function GardenHeaderBadge() {
  const profile = useFocusGardenStore((s) => s.profile);
  const liveCount = profile.plants.filter((p) => !p.withered).length;
  const deadCount = profile.plants.filter((p) => p.withered).length;
  const totalCount = profile.plants.length;

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href="/focus-session"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            {/* Live trees */}
            <span className="flex items-center gap-1">
              <TreeDeciduous className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {liveCount}
              </span>
            </span>

            {/* Divider */}
            {deadCount > 0 && (
              <span className="w-px h-4 bg-emerald-200 dark:bg-emerald-800" />
            )}

            {/* Dead trees */}
            {deadCount > 0 && (
              <span className="flex items-center gap-1">
                <Skull className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                  {deadCount}
                </span>
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {liveCount} live tree{liveCount !== 1 ? 's' : ''}
            {deadCount > 0 && (
              <>, {deadCount} withered tree{deadCount !== 1 ? 's' : ''}</>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

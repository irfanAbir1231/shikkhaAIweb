'use client';

import Link from 'next/link';
import { useFocusGardenStore } from '@/lib/stores/focus-garden-store';
import { TreeDeciduous } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function GardenHeaderBadge() {
  const profile = useFocusGardenStore((s) => s.profile);
  const count = profile.plants.length;

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href="/focus-session"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <TreeDeciduous className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {count}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{count} tree{count !== 1 ? 's' : ''} in your garden</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

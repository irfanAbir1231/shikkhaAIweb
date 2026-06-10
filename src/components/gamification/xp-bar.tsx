'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  label?: string;
  className?: string;
}

export function XPBar({ current, max, level, label, className }: XPBarProps) {
  const pct = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">
          {label || `Level ${level}`}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {current} / {max} XP
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted relative">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Shimmer effect */}
        <div className="absolute inset-0 skeleton-shimmer opacity-50" />
      </div>
    </div>
  );
}

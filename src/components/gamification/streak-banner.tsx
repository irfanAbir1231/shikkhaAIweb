'use client';

import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBannerProps {
  streak: number;
  bestStreak: number;
  className?: string;
}

export function StreakBanner({ streak, bestStreak, className }: StreakBannerProps) {
  if (streak < 2) return null;

  const isRecord = streak >= bestStreak && bestStreak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4',
        'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10',
        'border-amber-500/20',
        className
      )}
    >
      {/* Animated flame background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <div className="relative flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex size-12 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/20"
        >
          <Flame className="size-6 text-amber-500" />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-amber-400">
              {streak}-Day Streak!
            </h3>
            {isRecord && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                <TrendingUp className="size-3" />
                Personal Best
              </span>
            )}
          </div>
          <p className="text-sm text-amber-300/70">
            {streak >= 7
              ? "Incredible! You're on fire! Keep the momentum going."
              : streak >= 3
                ? "Great consistency! You're building a strong habit."
                : "Nice start! Keep studying daily to build your streak."}
          </p>
        </div>

        {/* Streak dots */}
        <div className="hidden sm:flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                i < streak
                  ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

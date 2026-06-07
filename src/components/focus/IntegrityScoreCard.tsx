'use client';

import type { IntegrityScore } from '@/lib/types/focus-session';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrityScoreCardProps {
  score: IntegrityScore | null;
}

export function IntegrityScoreCard({ score }: IntegrityScoreCardProps) {
  if (!score) return null;

  const Icon = score.flagged ? ShieldAlert : score.scorePercent >= 90 ? ShieldCheck : Shield;
  const colorClass = score.flagged
    ? 'text-red-500 border-red-500/20 bg-red-500/5'
    : score.scorePercent >= 90
    ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
    : score.scorePercent >= 75
    ? 'text-amber-500 border-amber-500/20 bg-amber-500/5'
    : 'text-orange-500 border-orange-500/20 bg-orange-500/5';

  return (
    <div className={cn('rounded-xl border p-4 space-y-3 glass', colorClass)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="font-semibold text-sm">Integrity Score</span>
        </div>
        <span className="text-2xl font-bold tabular-nums">{score.scorePercent}%</span>
      </div>

      <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-current transition-all duration-500 rounded-full"
          style={{ width: `${score.scorePercent}%` }}
        />
      </div>

      <div className="flex justify-between text-xs opacity-80">
        <span>Violations: {score.totalViolations}</span>
        <span>Unresolved: {score.unresolvedViolations}</span>
        <span>Max Streak: {score.maxConsecutiveViolations}</span>
      </div>

      {score.flagged && (
        <p className="text-xs font-medium text-red-600 bg-red-500/10 rounded-lg px-2 py-1 border border-red-400/20">
          This attempt has been flagged as unreliable due to frequent tab switches.
        </p>
      )}
    </div>
  );
}

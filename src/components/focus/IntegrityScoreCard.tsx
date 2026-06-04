'use client';

import type { IntegrityScore } from '@/lib/types/focus-session';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface IntegrityScoreCardProps {
  score: IntegrityScore | null;
}

export function IntegrityScoreCard({ score }: IntegrityScoreCardProps) {
  if (!score) return null;

  const Icon = score.flagged ? ShieldAlert : score.scorePercent >= 90 ? ShieldCheck : Shield;
  const colorClass = score.flagged
    ? 'text-red-500 bg-red-50 border-red-200'
    : score.scorePercent >= 90
    ? 'text-emerald-500 bg-emerald-50 border-emerald-200'
    : score.scorePercent >= 75
    ? 'text-amber-500 bg-amber-50 border-amber-200'
    : 'text-orange-500 bg-orange-50 border-orange-200';

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${colorClass}`}>
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
        <p className="text-xs font-medium text-red-600 bg-red-100 rounded px-2 py-1">
          This attempt has been flagged as unreliable due to frequent tab switches.
        </p>
      )}
    </div>
  );
}

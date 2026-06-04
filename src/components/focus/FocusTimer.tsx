'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square, RotateCcw } from 'lucide-react';

interface FocusTimerProps {
  timeRemainingMs: number;
  isRunning: boolean;
  isPaused: boolean;
  totalDurationMs: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function FocusTimer({
  timeRemainingMs,
  isRunning,
  isPaused,
  totalDurationMs,
  onPause,
  onResume,
  onStop,
  onReset,
}: FocusTimerProps) {
  const progressPercent = useMemo(() => {
    if (totalDurationMs <= 0) return 0;
    const elapsed = totalDurationMs - timeRemainingMs;
    return Math.min(100, Math.max(0, (elapsed / totalDurationMs) * 100));
  }, [timeRemainingMs, totalDurationMs]);

  if (!isRunning && timeRemainingMs === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl font-mono font-bold text-muted-foreground">00:00</div>
        <p className="text-sm text-muted-foreground">Set a duration and start your session</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Progress ring */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${progressPercent * 2.83} 283`}
            className="text-emerald-500 transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold tabular-nums">
            {formatTime(timeRemainingMs)}
          </span>
          {isPaused && (
            <span className="text-sm text-amber-500 font-medium mt-1">Paused</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isPaused ? (
          <Button size="lg" onClick={onResume} className="gap-2">
            <Play className="w-5 h-5" />
            Resume
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={onPause} className="gap-2">
            <Pause className="w-5 h-5" />
            Pause
          </Button>
        )}
        <Button size="lg" variant="destructive" onClick={onStop} className="gap-2">
          <Square className="w-5 h-5" />
          End Session
        </Button>
        <Button size="icon" variant="ghost" onClick={onReset} className="gap-2">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

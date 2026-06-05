'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MasteryTopic } from '@/lib/types/analytics';
import { CheckCircle, AlertCircle, Circle, Play, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicListTileProps {
  topic: MasteryTopic;
  subject: string;
  chapterName: string;
}

export function TopicListTile({ topic, subject, chapterName }: TopicListTileProps) {
  const availabilityStatus = topic.availability_status;
  const hasAvailability = availabilityStatus !== undefined;

  const isLocked = availabilityStatus === 'locked';
  const isQueued = availabilityStatus === 'queued';
  const isAvailable = availabilityStatus === 'available' || !hasAvailability;

  const isCompleted = topic.is_completed && isAvailable;
  const isAttempted = topic.is_attempted && !topic.is_completed && isAvailable;
  const isUnattempted = !topic.is_attempted && isAvailable;

  const scoreText =
    topic.last_score !== null ? `${Math.round(topic.last_score)}%` : null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
        isCompleted && 'border-green-200 bg-green-50/60 dark:border-green-900/40 dark:bg-green-950/20',
        isAttempted && 'border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20',
        isUnattempted && 'border-border bg-muted/40 hover:bg-muted/70',
        isLocked && 'border-border bg-muted/10 opacity-70',
        isQueued && 'border-amber-100 bg-amber-50/10 dark:border-amber-900/20'
      )}
    >
      {/* Left: status icon + topic info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Status Icon */}
        {isCompleted && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        )}
        {isAttempted && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        )}
        {isUnattempted && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <Circle className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        {isLocked && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted opacity-70">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {isQueued && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100/50 dark:bg-amber-900/20">
            <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
          </div>
        )}

        {/* Topic name + status label */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{topic.name}</p>
            {topic.page_start !== undefined && topic.page_end !== undefined && (
              <span className="text-xs text-muted-foreground shrink-0 font-normal">
                (p. {topic.page_start}–{topic.page_end})
              </span>
            )}
          </div>
          <p
            className={cn(
              'text-xs',
              isCompleted && 'text-green-700 dark:text-green-400',
              isAttempted && 'text-amber-700 dark:text-amber-400',
              isUnattempted && 'text-muted-foreground',
              isLocked && 'text-muted-foreground/60',
              isQueued && 'text-amber-600 dark:text-amber-400'
            )}
          >
            {isCompleted && 'Completed'}
            {isAttempted && 'In Progress'}
            {isUnattempted && 'Not started'}
            {isLocked && 'Locked (Ingestion required)'}
            {isQueued && 'Processing section...'}
          </p>
        </div>
      </div>

      {/* Right: score badge + action */}
      <div className="flex items-center gap-3 shrink-0">
        {scoreText && (
          <Badge
            variant="outline"
            className={cn(
              'tabular-nums',
              isCompleted && 'border-green-300 text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
              isAttempted && 'border-amber-300 text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
            )}
          >
            {scoreText}
          </Badge>
        )}

        {isLocked && (
          <Button size="sm" variant="ghost" disabled className="gap-1.5 opacity-50 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </Button>
        )}

        {isQueued && (
          <Button size="sm" variant="outline" disabled className="gap-1.5 bg-amber-50/10 text-amber-600 border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Queued
          </Button>
        )}

        {isAvailable && (
          isUnattempted ? (
            <Link
              href={`/exam/config?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapterName)}&topic=${encodeURIComponent(topic.name)}`}
            >
              <Button size="sm" className="gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Practice
              </Button>
            </Link>
          ) : (
            <Link
              href={`/exam/config?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapterName)}&topic=${encodeURIComponent(topic.name)}`}
            >
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                Retry
              </Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
}

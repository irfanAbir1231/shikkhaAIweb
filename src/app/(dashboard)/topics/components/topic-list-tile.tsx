'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MasteryTopic } from '@/lib/types/analytics';
import { CheckCircle, AlertCircle, Circle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicListTileProps {
  topic: MasteryTopic;
  subject: string;
  chapterName: string;
}

export function TopicListTile({ topic, subject, chapterName }: TopicListTileProps) {
  const isCompleted = topic.is_completed;
  const isAttempted = topic.is_attempted && !topic.is_completed;
  const isUnattempted = !topic.is_attempted;

  const scoreText =
    topic.last_score !== null ? `${Math.round(topic.last_score)}%` : null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
        isCompleted && 'border-green-200 bg-green-50/60 dark:border-green-900/40 dark:bg-green-950/20',
        isAttempted && 'border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20',
        isUnattempted && 'border-border bg-muted/40 hover:bg-muted/70'
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

        {/* Topic name + status label */}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{topic.name}</p>
          <p
            className={cn(
              'text-xs',
              isCompleted && 'text-green-700 dark:text-green-400',
              isAttempted && 'text-amber-700 dark:text-amber-400',
              isUnattempted && 'text-muted-foreground'
            )}
          >
            {isCompleted && 'Completed'}
            {isAttempted && 'In Progress'}
            {isUnattempted && 'Not started'}
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

        {isUnattempted ? (
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
        )}
      </div>
    </div>
  );
}

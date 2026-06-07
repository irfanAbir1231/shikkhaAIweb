'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { masteryTextClass, nodeAriaLabel } from './shared';

export interface MapTopic {
  id: string;
  name: string;
  mastery: number;
  isWeak?: boolean;
  subject?: string;
}

interface TopicProgressMapProps {
  topics: MapTopic[];
  className?: string;
  columns?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** OKLCH interpolation for heatmap cell backgrounds. */
function heatmapBg(mastery: number): string {
  if (mastery >= 80) {
    // success green
    return 'oklch(0.72 0.16 162 / 0.35)';
  }
  if (mastery >= 50) {
    // warning amber
    return 'oklch(0.82 0.16 80 / 0.30)';
  }
  if (mastery >= 20) {
    // destructive red
    return 'oklch(0.64 0.21 25 / 0.25)';
  }
  // unattempted / very low
  return 'oklch(0.27 0.02 268 / 0.40)';
}

function heatmapBorder(mastery: number): string {
  if (mastery >= 80) return 'oklch(0.72 0.16 162 / 0.55)';
  if (mastery >= 50) return 'oklch(0.82 0.16 80 / 0.50)';
  if (mastery >= 20) return 'oklch(0.64 0.21 25 / 0.45)';
  return 'oklch(0.35 0.02 268 / 0.35)';
}

function Cell({
  topic,
  index,
}: {
  topic: MapTopic;
  index: number;
}) {
  const reduce = useReducedMotion();

  return (
    <Tooltip>
      <TooltipTrigger>
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduce ? 0 : 0.35,
            delay: index * 0.015,
            ease: EASE,
          }}
          className={cn(
            'relative flex aspect-square items-center justify-center rounded-md border text-[10px] font-semibold leading-none cursor-default transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            topic.mastery >= 50 ? 'text-foreground' : 'text-muted-foreground'
          )}
          style={{
            backgroundColor: heatmapBg(topic.mastery),
            borderColor: heatmapBorder(topic.mastery),
          }}
          role="gridcell"
          aria-label={nodeAriaLabel(topic.name, topic.mastery)}
          tabIndex={0}
        >
          {/* Inner dot for very high mastery */}
          {topic.mastery >= 90 && (
            <span className="absolute top-0.5 right-0.5 block size-1 rounded-full bg-success" />
          )}
          {/* Weak indicator */}
          {topic.isWeak && (
            <span className="absolute -top-0.5 -left-0.5 block size-1.5 rounded-full bg-destructive ring-1 ring-background animate-pulse-glow" />
          )}
          <span className="truncate px-0.5 text-center">
            {topic.name.length > 8
              ? topic.name.slice(0, 7) + '…'
              : topic.name}
          </span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="font-medium">{topic.name}</span>
        <span className={cn('ml-1.5 tabular-nums', masteryTextClass(topic.mastery))}>
          {Math.round(topic.mastery)}%
        </span>
        {topic.isWeak && (
          <span className="ml-1.5 text-destructive">(Weak)</span>
        )}
        {topic.subject && (
          <span className="ml-1.5 text-muted-foreground">• {topic.subject}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function TopicProgressMap({
  topics,
  className,
  columns = 8,
}: TopicProgressMapProps) {
  if (topics.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-8 text-center',
          className
        )}
      >
        <div className="mb-2 grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="size-4 rounded-sm bg-muted"
            />
          ))}
        </div>
        <p className="text-sm font-medium">No topic data yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Practice topics to fill your progress map.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delay={150}>
      <div
        className={cn('space-y-3', className)}
        role="img"
        aria-label={`Topic progress heatmap with ${topics.length} topics`}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.min(columns, topics.length)}, minmax(0, 1fr))`,
          }}
          role="grid"
        >
          {topics.map((topic, i) => (
            <Cell key={topic.id} topic={topic} index={i} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span
              className="block size-2.5 rounded-sm border"
              style={{
                backgroundColor: heatmapBg(90),
                borderColor: heatmapBorder(90),
              }}
            />
            <span>80%+</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="block size-2.5 rounded-sm border"
              style={{
                backgroundColor: heatmapBg(65),
                borderColor: heatmapBorder(65),
              }}
            />
            <span>50-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="block size-2.5 rounded-sm border"
              style={{
                backgroundColor: heatmapBg(35),
                borderColor: heatmapBorder(35),
              }}
            />
            <span>20-49%</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="block size-2.5 rounded-sm border"
              style={{
                backgroundColor: heatmapBg(0),
                borderColor: heatmapBorder(0),
              }}
            />
            <span>&lt;20%</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

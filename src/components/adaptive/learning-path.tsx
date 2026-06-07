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
import { CheckCircle2, Lock, Circle, Target } from 'lucide-react';

export interface PathStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'locked';
  mastery?: number;
}

interface LearningPathProps {
  steps: PathStep[];
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function StepNode({
  step,
  index,
  isLast,
}: {
  step: PathStep;
  index: number;
  isLast: boolean;
}) {
  const reduce = useReducedMotion();

  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';
  const isLocked = step.status === 'locked';

  const label = `${step.name}${step.mastery !== undefined ? `, ${Math.round(step.mastery)}% mastery` : ''}${isCompleted ? ', completed' : isCurrent ? ', current focus' : isLocked ? ', locked' : ''}`;

  return (
    <Tooltip>
      <TooltipTrigger>
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.45,
            delay: index * 0.1,
            ease: EASE,
          }}
          className="relative flex flex-col items-center text-center"
          role="listitem"
          aria-label={label}
        >
          {/* Connector line to next step */}
          {!isLast && (
            <div className="absolute top-5 left-1/2 h-0.5 w-full translate-x-1/2">
              <div
                className={cn(
                  'h-full rounded-full',
                  isCompleted
                    ? 'bg-success/60'
                    : 'bg-gradient-to-r from-brand-from/50 via-brand-via/40 to-brand-to/30'
                )}
              />
            </div>
          )}

          {/* Node circle */}
          <div
            className={cn(
              'relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-colors',
              isCompleted
                ? 'border-success bg-success/15 text-success'
                : isCurrent
                  ? 'border-primary bg-primary/15 text-primary animate-pulse-glow'
                  : 'border-muted bg-muted/40 text-muted-foreground'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="size-5" />
            ) : isLocked ? (
              <Lock className="size-4" />
            ) : isCurrent ? (
              <Target className="size-5" />
            ) : (
              <Circle className="size-4" />
            )}
          </div>

          {/* Label */}
          <p
            className={cn(
              'mt-2 max-w-[7rem] text-xs font-medium leading-tight',
              isLocked ? 'text-muted-foreground/60' : 'text-foreground'
            )}
          >
            {step.name}
          </p>

          {/* Mastery pill */}
          {step.mastery !== undefined && !isLocked && (
            <span
              className={cn(
                'mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                step.mastery >= 80
                  ? 'bg-success/15 text-success'
                  : step.mastery >= 50
                    ? 'bg-warning/15 text-warning'
                    : 'bg-destructive/15 text-destructive'
              )}
            >
              {Math.round(step.mastery)}%
            </span>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isLocked ? (
          <span>{step.name} — Locked</span>
        ) : step.mastery !== undefined ? (
          <span>
            {step.name} — {Math.round(step.mastery)}% mastery
          </span>
        ) : (
          <span>{step.name}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function LearningPath({ steps, className }: LearningPathProps) {
  if (steps.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-8 text-center',
          className
        )}
      >
        <Circle className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">No learning path available</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete topics to build your personalized path.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delay={200}>
      <div
        className={cn('w-full overflow-x-auto', className)}
        role="list"
        aria-label="Learning path showing recommended next topics"
      >
        <div className="flex min-w-max items-start justify-between gap-2 px-2 pb-2">
          {steps.map((step, i) => (
            <StepNode
              key={step.id}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

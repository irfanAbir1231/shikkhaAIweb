'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MasterySubject } from '@/lib/types/analytics';
import {
  masteryBgClass,
  masteryBorderClass,
  nodeAriaLabel,
} from './shared';
import { cn } from '@/lib/utils';
import { BookOpen, CheckCircle2, Circle, Lock } from 'lucide-react';

export interface MasteryTreeProps {
  subjects: MasterySubject[];
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function TopicNode({
  name,
  mastery,
  isCompleted,
  isWeak,
  isLocked,
  delay,
}: {
  name: string;
  mastery: number;
  isCompleted: boolean;
  isWeak: boolean;
  isLocked?: boolean;
  delay: number;
}) {
  const reduce = useReducedMotion();

  return (
    <Tooltip>
      <TooltipTrigger>
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, delay, ease: EASE }}
          className={cn(
            'group relative flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
            'cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isLocked
              ? 'border-muted bg-muted/30 opacity-60'
              : cn(
                  masteryBorderClass(mastery),
                  masteryBgClass(mastery),
                  'hover:brightness-110'
                )
          )}
          role="listitem"
          aria-label={nodeAriaLabel(name, mastery)}
          tabIndex={0}
        >
          {isLocked ? (
            <Lock className="size-3.5 shrink-0 text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
          ) : (
            <Circle
              className={cn(
                'size-3.5 shrink-0',
                isWeak ? 'text-destructive' : 'text-muted-foreground'
              )}
            />
          )}
          <span className="truncate font-medium">{name}</span>
          {!isLocked && (
            <span
              className={cn(
                'ml-auto shrink-0 tabular-nums text-[10px] font-semibold',
                mastery >= 80
                  ? 'text-success'
                  : mastery >= 50
                    ? 'text-warning'
                    : 'text-destructive'
              )}
            >
              {Math.round(mastery)}%
            </span>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isLocked ? (
          <span>{name} — Locked</span>
        ) : (
          <span>
            {name} — {Math.round(mastery)}% mastery
            {isWeak && ' (Weak)'}
            {isCompleted && ' (Completed)'}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function ChapterBranch({
  chapter,
  baseDelay,
}: {
  chapter: MasterySubject['chapters'][number];
  baseDelay: number;
}) {
  const reduce = useReducedMotion();
  const pct = Math.round(chapter.overall_completion_percentage);

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-brand-from/40 via-brand-via/30 to-brand-to/20" />

      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.45, delay: baseDelay, ease: EASE }}
        className="relative mb-3"
      >
        {/* Chapter header node */}
        <div className="flex items-center gap-2 pb-2">
          {/* Horizontal connector */}
          <div className="h-px w-4 shrink-0 bg-gradient-to-r from-brand-from/50 to-brand-via/30" />
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold',
              masteryBorderClass(pct),
              masteryBgClass(pct)
            )}
            role="listitem"
            aria-label={`${chapter.chapter_name}, chapter mastery ${pct} percent`}
          >
            <BookOpen className="size-3 text-muted-foreground" />
            <span className="truncate">
              {chapter.chapter_number !== undefined
                ? `Ch. ${chapter.chapter_number}: `
                : ''}
              {chapter.chapter_name}
            </span>
            <span className="tabular-nums text-[10px] opacity-70">{pct}%</span>
          </div>
        </div>

        {/* Topic nodes */}
        <div className="space-y-1.5 pl-6">
          {chapter.topics.map((topic, ti) => (
            <TopicNode
              key={topic.id}
              name={topic.name}
              mastery={topic.completion_percentage}
              isCompleted={topic.is_completed}
              isWeak={topic.is_weak}
              isLocked={topic.availability_status === 'locked'}
              delay={baseDelay + 0.06 + ti * 0.04}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SubjectRoot({
  subject,
  index,
}: {
  subject: MasterySubject;
  index: number;
}) {
  const reduce = useReducedMotion();
  const pct = Math.round(subject.overall_completion_percentage);
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, delay: index * 0.12, ease: EASE }}
      className="rounded-2xl border border-border/60 bg-card/40 p-4"
    >
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg -mx-1 px-1 py-1"
        aria-expanded={isOpen}
      >
        {/* Subject node orb */}
        <div
          className={cn(
            'relative flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold',
            masteryBorderClass(pct),
            masteryBgClass(pct)
          )}
          aria-label={nodeAriaLabel(subject.subject, pct)}
        >
          {subject.subject.slice(0, 2).toUpperCase()}
          {/* Subtle glow ring for high mastery */}
          {pct >= 80 && (
            <span className="absolute inset-0 rounded-xl ring-2 ring-success/30 animate-pulse-glow" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold capitalize">
            {subject.subject}
          </p>
          <p className="text-xs text-muted-foreground">
            {subject.completed_topics}/{subject.total_topics} completed • {pct}%
          </p>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-muted-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-muted-foreground"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
        className="overflow-hidden"
      >
        <div className="mt-3 space-y-1" role="list">
          {subject.chapters.map((chapter, ci) => (
            <ChapterBranch
              key={chapter.chapter_name}
              chapter={chapter}
              baseDelay={index * 0.12 + 0.1 + ci * 0.08}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MasteryTree({ subjects, className }: MasteryTreeProps) {
  return (
    <TooltipProvider delay={200}>
      <div
        className={cn('space-y-4', className)}
        role="tree"
        aria-label="Mastery tree showing subjects, chapters, and topics"
      >
        {subjects.map((subject, i) => (
          <SubjectRoot key={subject.subject} subject={subject} index={i} />
        ))}
      </div>
    </TooltipProvider>
  );
}

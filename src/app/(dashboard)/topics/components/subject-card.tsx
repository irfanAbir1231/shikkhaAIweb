'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MasterySubject } from '@/lib/types/analytics';
import { ChapterAccordion } from './chapter-accordion';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import {
  BookOpen,
  FlaskConical,
  Calculator,
  Globe,
  History,
  Languages,
  Palette,
  Music,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  science: <FlaskConical className="w-5 h-5" />,
  mathematics: <Calculator className="w-5 h-5" />,
  math: <Calculator className="w-5 h-5" />,
  english: <Languages className="w-5 h-5" />,
  bangla: <Languages className="w-5 h-5" />,
  geography: <Globe className="w-5 h-5" />,
  history: <History className="w-5 h-5" />,
  arts: <Palette className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
  ict: <Cpu className="w-5 h-5" />,
};

function getSubjectIcon(subjectName: string) {
  const key = subjectName.toLowerCase();
  return SUBJECT_ICONS[key] || <BookOpen className="w-5 h-5" />;
}

interface SubjectCardProps {
  subject: MasterySubject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const allCompleted = subject.completed_topics === subject.total_topics;

  return (
    <div className="rounded-2xl glass shadow-soft overflow-hidden hover-lift transition-shadow">
      {/* Subject Header */}
      <div className="px-5 py-4 border-b border-border/30 glass-strong">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              {getSubjectIcon(subject.subject)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold capitalize truncate">{subject.subject}</h3>
              <p className="text-xs text-muted-foreground">
                {subject.chapters.length} chapter{subject.chapters.length !== 1 ? 's' : ''} •{' '}
                {subject.total_topics} topic{subject.total_topics !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {subject.completed_topics}/{subject.total_topics} completed
              </span>
              <div className="w-28">
                <Progress value={subject.overall_completion_percentage} className="h-2" />
              </div>
            </div>
            <Badge
              variant={allCompleted ? 'default' : 'secondary'}
              className="tabular-nums"
            >
              {Math.round(subject.overall_completion_percentage)}%
            </Badge>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover-lift"
              aria-label={isExpanded ? 'Collapse chapters' : 'Expand chapters'}
            >
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform duration-300',
                  !isExpanded && '-rotate-90'
                )}
              />
            </button>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="sm:hidden mt-3">
          <Progress value={subject.overall_completion_percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {subject.completed_topics}/{subject.total_topics} completed
          </p>
        </div>
      </div>

      {/* Chapters List */}
      <div
        className={cn(
          'transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 space-y-3">
          <Stagger gap={0.06}>
            {subject.chapters.map((chapter) => (
              <StaggerItem key={chapter.chapter_name}>
                <ChapterAccordion
                  chapter={chapter}
                  subjectName={subject.subject}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  );
}

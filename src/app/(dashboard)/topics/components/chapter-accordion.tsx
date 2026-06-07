'use client';

import { useState, useRef, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { MasteryChapter } from '@/lib/types/analytics';
import { TopicListTile } from './topic-list-tile';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterAccordionProps {
  chapter: MasteryChapter;
  subjectName: string;
}

export function ChapterAccordion({ chapter, subjectName }: ChapterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, chapter.topics]);

  const completedCount = chapter.topics.filter((t) => t.is_completed).length;
  const totalCount = chapter.topics.length;

  return (
    <div className="rounded-xl glass overflow-hidden hover-lift transition-shadow">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          'hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
        )}
        aria-expanded={isOpen}
      >
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">
            {chapter.chapter_number !== undefined ? `Ch. ${chapter.chapter_number}: ` : ''}
            {chapter.chapter_name}
          </span>
        </div>

        {/* Progress stats */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{totalCount}
          </span>
          <div className="w-24">
            <Progress value={chapter.overall_completion_percentage} className="h-1.5" />
          </div>
          <span className="text-xs font-medium tabular-nums w-8 text-right">
            {Math.round(chapter.overall_completion_percentage)}%
          </span>
        </div>
      </button>

      {/* Animated Content Panel */}
      <div
        className="transition-[height] duration-300 ease-in-out overflow-hidden"
        style={{ height }}
      >
        <div ref={contentRef} className="px-4 pb-4 pt-1 space-y-2">
          {/* Mobile-only progress (shown inside content on small screens) */}
          <div className="sm:hidden flex items-center gap-2 mb-2">
            <Progress value={chapter.overall_completion_percentage} className="h-1.5 flex-1" />
            <span className="text-xs font-medium tabular-nums">
              {Math.round(chapter.overall_completion_percentage)}%
            </span>
          </div>

          <Stagger gap={0.04}>
            {chapter.topics.map((topic) => (
              <StaggerItem key={topic.id}>
                <TopicListTile
                  topic={topic}
                  subject={subjectName}
                  chapterName={chapter.chapter_name}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MasteryTopic } from '@/lib/types/analytics';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { useGeneratePracticeExam } from '@/lib/api/subtopics';
import {
  CheckCircle,
  AlertCircle,
  Circle,
  Play,
  Lock,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicListTileProps {
  topic: MasteryTopic;
  subject: string;
  chapterName: string;
}

export function TopicListTile({ topic, subject, chapterName }: TopicListTileProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setExam } = useExamStore();
  const generatePractice = useGeneratePracticeExam();
  const [isGenerating, setIsGenerating] = useState(false);

  const availabilityStatus = topic.availability_status;
  const hasAvailability = availabilityStatus !== undefined;

  const isLocked = availabilityStatus === 'locked';
  const isQueued = availabilityStatus === 'queued';
  const isAvailable = availabilityStatus === 'available' || !hasAvailability;

  const isCompleted = topic.is_completed && isAvailable;
  const isAttempted = topic.is_attempted && !topic.is_completed && isAvailable;
  const isUnattempted = !topic.is_attempted && isAvailable;
  const isWeak = topic.is_weak && isAvailable;

  const scoreText = `${Math.round(topic.completion_percentage)}%`;

  const handleWeakPractice = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }
    if (topic.weak_subtopic_ids.length === 0) {
      // Fallback to normal exam config if no weak subtopics
      router.push(
        `/exam/config?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapterName)}&topic=${encodeURIComponent(topic.name)}`
      );
      return;
    }

    setIsGenerating(true);
    try {
      const exam = await generatePractice.mutateAsync({
        student_id: user.id,
        subject: subject.toLowerCase(),
        class_level: user.grade_level || '8',
        difficulty: 'medium',
        num_questions: 10,
        focus_subtopics: topic.weak_subtopic_ids,
      });
      setExam(exam);
      toast.success('Practice exam generated!');
      router.push(`/exam/session/${exam.exam_id}`);
    } catch {
      toast.error('Failed to generate practice exam');
    } finally {
      setIsGenerating(false);
    }
  };

  const examConfigUrl = `/exam/config?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapterName)}&topic=${encodeURIComponent(topic.name)}`;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all hover-lift',
        isCompleted && 'glass border border-green-500/20 bg-green-500/5',
        isAttempted && 'glass border border-amber-500/20 bg-amber-500/5',
        isUnattempted && 'glass border border-border/40 hover:bg-muted/30',
        isLocked && 'glass border border-border/20 opacity-60',
        isQueued && 'glass border border-amber-500/10 bg-amber-500/5'
      )}
    >
      {/* Left: status icon + topic info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Status Icon */}
        {isCompleted && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500/15">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
        {isAttempted && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
        )}
        {isUnattempted && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted/60">
            <Circle className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        {isLocked && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted/40">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {isQueued && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
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
              isCompleted && 'text-green-600 dark:text-green-400',
              isAttempted && 'text-amber-600 dark:text-amber-400',
              isUnattempted && 'text-muted-foreground',
              isLocked && 'text-muted-foreground/60',
              isQueued && 'text-amber-600 dark:text-amber-400'
            )}
          >
            {isCompleted && 'Completed'}
            {isAttempted && !isWeak && 'In Progress'}
            {isWeak && 'Weak — needs practice'}
            {isUnattempted && 'Not started'}
            {isLocked && 'Locked (Ingestion required)'}
            {isQueued && 'Processing section...'}
          </p>
        </div>
      </div>

      {/* Right: score badge + action */}
      <div className="flex items-center gap-3 shrink-0">
        <Badge
          variant="outline"
          className={cn(
            'tabular-nums',
            isCompleted && 'border-green-400/40 text-green-700 bg-green-500/10 dark:text-green-400',
            isAttempted && 'border-amber-400/40 text-amber-700 bg-amber-500/10 dark:text-amber-400',
            isUnattempted && 'border-border text-muted-foreground bg-muted/40'
          )}
        >
          {scoreText}
        </Badge>

        {isLocked && (
          <Button size="sm" variant="ghost" disabled className="gap-1.5 opacity-50 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </Button>
        )}

        {isQueued && (
          <Button size="sm" variant="outline" disabled className="gap-1.5 border-amber-400/30 text-amber-600 bg-amber-500/5">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            Queued
          </Button>
        )}

        {isAvailable && (
          isWeak ? (
            <Button
              size="sm"
              variant="gradient"
              className="gap-1.5"
              onClick={handleWeakPractice}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="w-3.5 h-3.5 rounded-full bg-white/50 animate-pulse" />
              ) : (
                <Target className="w-3.5 h-3.5" />
              )}
              Practice Weak Areas
            </Button>
          ) : isUnattempted ? (
            <Link href={examConfigUrl}>
              <Button size="sm" variant="gradient" className="gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Practice
              </Button>
            </Link>
          ) : (
            <Link href={examConfigUrl}>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground hover-lift">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Retry
              </Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
}

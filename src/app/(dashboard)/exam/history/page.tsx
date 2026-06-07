'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { AIBackground } from '@/components/background/ai-background';
import { AttemptResponse } from '@/lib/types/exam';
import { formatDate } from '@/lib/utils/formatters';
import {
  useSaveExam,
  useUnsaveExam,
  useSavedExams,
} from '@/lib/api/exams';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  Target,
  Wand2,
} from 'lucide-react';

async function fetchAttempts(studentId: number): Promise<AttemptResponse[]> {
  const res = await fetch(`/api/proxy/student/${studentId}/attempts`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch attempts');
  return data.data;
}

/* ------------------------------------------------------------------ */
/*  Score badge color helper                                           */
/* ------------------------------------------------------------------ */
function getScoreBadgeClass(score: number): string {
  if (score >= 60)
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (score >= 40)
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
}

/* ------------------------------------------------------------------ */
/*  Attempt Row — glass card with hover-lift & score ring              */
/* ------------------------------------------------------------------ */
function AttemptRow({
  attempt,
  isSaved,
}: {
  attempt: AttemptResponse;
  isSaved: boolean;
}) {
  const router = useRouter();
  const saveExam = useSaveExam();
  const unsaveExam = useUnsaveExam();
  const [saved, setSaved] = useState(isSaved);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      unsaveExam.mutate(attempt.exam_id, {
        onSuccess: () => setSaved(false),
      });
    } else {
      saveExam.mutate(attempt.exam_id, {
        onSuccess: () => setSaved(true),
      });
    }
  };

  const handleClick = () => {
    router.push(`/exam/result/${attempt.attempt_id}`);
  };

  const badgeClass = getScoreBadgeClass(attempt.score_percentage);

  return (
    <Card
      variant="glass"
      interactive
      className="group cursor-pointer hover-lift"
      onClick={handleClick}
    >
      <CardContent className="flex items-center gap-4 py-4">
        {/* Score ring */}
        <div className="shrink-0">
          <ProgressRing
            value={attempt.score_percentage}
            size={52}
            strokeWidth={5}
            label={`Score ${attempt.score_percentage.toFixed(1)}%`}
          >
            <span className="font-heading text-sm font-semibold tabular-nums">
              {Math.round(attempt.score_percentage)}
              <span className="text-[10px] text-muted-foreground">%</span>
            </span>
          </ProgressRing>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">
              Exam #{attempt.exam_id}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
            >
              {attempt.score_percentage >= 60
                ? 'Pass'
                : attempt.score_percentage >= 40
                ? 'Average'
                : 'Needs Work'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(attempt.created_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="w-3 h-3" />
              {attempt.mcq_correct}/{attempt.mcq_total}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Readiness {attempt.readiness_score.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSave}
            title={saved ? 'Unsave exam' : 'Save exam'}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {saved ? (
              <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Bookmark className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State — premium glass illustration                            */
/* ------------------------------------------------------------------ */
function EmptyState() {
  const router = useRouter();
  return (
    <Reveal>
      <Card variant="glass" className="text-center py-14">
        <CardContent className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 grid place-items-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No exams taken yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Start your first personalized practice exam and track your progress over time.
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => router.push('/exam/config')}
            className="transition-all"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Your First Exam
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton — shimmer rows                                     */
/* ------------------------------------------------------------------ */
function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="glass">
          <CardContent className="flex items-center gap-4 py-4">
            <Skeleton className="w-[52px] h-[52px] rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function ExamHistoryPage() {
  const { user } = useAuthStore();
  const studentId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['attempts', studentId],
    queryFn: () => fetchAttempts(studentId!),
    enabled: !!studentId,
  });

  const { data: savedExams } = useSavedExams();
  const savedExamIds = new Set(savedExams?.map((s) => s.exam_id) || []);

  if (error) {
    return (
      <div className="relative min-h-screen pb-20">
        <div className="absolute inset-0 -z-10 opacity-30">
          <AIBackground />
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card variant="glass" className="text-center py-14">
            <CardContent className="space-y-2">
              <p className="text-destructive font-medium">Failed to load exam history</p>
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <AIBackground />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <Reveal>
          <div className="space-y-1">
            <h1 className="font-heading text-3xl font-bold tracking-tight">Exam History</h1>
            <p className="text-muted-foreground">
              Review your past attempts and track your growth
            </p>
          </div>
        </Reveal>

        {/* Stats summary bar */}
        {!isLoading && data && data.length > 0 && (
          <Reveal delay={0.05}>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Total attempts:</span>
                <span className="font-semibold">{data.length}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-muted-foreground">Avg score:</span>
                <span className="font-semibold">
                  {(
                    data.reduce((sum, a) => sum + a.score_percentage, 0) / data.length
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-muted-foreground">Best:</span>
                <span className="font-semibold">
                  {Math.max(...data.map((a) => a.score_percentage)).toFixed(0)}%
                </span>
              </div>
            </div>
          </Reveal>
        )}

        {/* Content */}
        <Reveal delay={0.1}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <HistorySkeleton />
              ) : !data || data.length === 0 ? (
                <EmptyState />
              ) : (
                <Stagger gap={0.06} className="space-y-3">
                  {data.map((attempt) => (
                    <StaggerItem key={attempt.attempt_id}>
                      <AttemptRow
                        attempt={attempt}
                        isSaved={savedExamIds.has(attempt.exam_id)}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

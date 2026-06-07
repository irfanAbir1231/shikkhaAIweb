'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWeakSubtopics, useSubtopicPerformance, useGeneratePracticeExam } from '@/lib/api/subtopics';
import { useExamStore } from '@/lib/stores/exam-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Brain, Target, Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

function MasteryColor(score: number) {
  if (score >= 60) return 'bg-green-500';
  if (score >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function PracticeExamPage() {
  return (
    <Suspense fallback={<PracticeExamSkeleton />}>
      <PracticeExamContent />
    </Suspense>
  );
}

function PracticeExamSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <Skeleton className="h-10 w-64 skeleton-shimmer" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl skeleton-shimmer" />
        <Skeleton className="h-96 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  );
}

function PracticeExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusParam = searchParams.get('focus');
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id ?? 0;
  const setExam = useExamStore((s) => s.setExam);

  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSubtopics, setSelectedSubtopics] = useState<number[]>(
    focusParam ? [parseInt(focusParam)] : []
  );

  const { data: weakSubtopics, isLoading } = useWeakSubtopics(studentId, 90);
  const { data: performance } = useSubtopicPerformance(studentId);
  const generatePractice = useGeneratePracticeExam();

  const toggleSubtopic = useCallback((id: number) => {
    setSelectedSubtopics((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleStart = async () => {
    if (!user) return;
    const focusIds = selectedSubtopics.length > 0 ? selectedSubtopics : undefined;
    const exam = await generatePractice.mutateAsync({
      student_id: studentId,
      subject: 'science',
      class_level: '8',
      difficulty,
      num_questions: numQuestions,
      focus_subtopics: focusIds,
    });
    setExam(exam);
    router.push(`/exam/session/${exam.exam_id}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please log in to start practice.</p>
      </div>
    );
  }

  // Compute distribution preview
  const distribution = (() => {
    if (!weakSubtopics || weakSubtopics.length === 0) return [];
    const selected = weakSubtopics.filter((ws) =>
      selectedSubtopics.length > 0 ? selectedSubtopics.includes(ws.subtopic_id) : true
    );
    if (selected.length === 0) return [];

    const totalWeakness = selected.reduce((sum, ws) => sum + Math.max(0, 90 - ws.score), 0);
    if (totalWeakness === 0) {
      const perTopic = Math.floor(numQuestions / selected.length);
      const rem = numQuestions % selected.length;
      return selected.map((ws, i) => ({
        name: ws.name,
        count: perTopic + (i < rem ? 1 : 0),
        pct: Math.round(100 / selected.length),
      }));
    }

    const dist = selected.map((ws) => {
      const weakness = Math.max(0, 90 - ws.score);
      const ratio = weakness / totalWeakness;
      return {
        name: ws.name,
        count: Math.max(1, Math.round(ratio * numQuestions)),
        pct: Math.round(ratio * 100),
      };
    });

    // Adjust for rounding
    const total = dist.reduce((s, d) => s + d.count, 0);
    if (total !== numQuestions && dist.length > 0) {
      dist[0].count += numQuestions - total;
    }
    return dist;
  })();

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <Reveal>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Adaptive Practice Exam</h1>
            <p className="text-muted-foreground text-sm">
              Focus on weak subtopics. More wrong answers = more questions.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <AIInsightCard>
          Select your weakest subtopics below. The AI will generate a personalized exam that allocates more questions to areas where you need the most practice.
        </AIInsightCard>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration */}
        <Reveal>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Exam Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Number of Questions: <span className="text-primary font-semibold">{numQuestions}</span></label>
                <Slider
                  value={[numQuestions]}
                  onValueChange={(v) => setNumQuestions(Array.isArray(v) ? v[0] : v)}
                  min={5}
                  max={30}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Question Distribution Preview</label>
                {distribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Select subtopics to see distribution</p>
                ) : (
                  <div className="space-y-2">
                    {distribution.map((d) => (
                      <div key={d.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{d.name}</span>
                          <span className="text-muted-foreground">{d.count} questions ({d.pct}%)</span>
                        </div>
                        <Progress value={d.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="gradient"
                className="w-full"
                size="lg"
                onClick={handleStart}
                disabled={generatePractice.isPending || (!!weakSubtopics && weakSubtopics.length === 0)}
              >
                {generatePractice.isPending ? (
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Start Practice Exam
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {/* Subtopic Selection */}
        <Reveal>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Select Weak Subtopics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl skeleton-shimmer" />
                  ))}
                </div>
              ) : !weakSubtopics || weakSubtopics.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No weak subtopics found.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Take exams to generate weak subtopic data.
                  </p>
                </div>
              ) : (
                <Stagger className="space-y-3 max-h-[400px] overflow-y-auto pr-2" gap={0.04}>
                  {weakSubtopics.map((ws) => {
                    const perf = performance?.find((p) => p.subtopic_id === ws.subtopic_id);
                    const checked = selectedSubtopics.includes(ws.subtopic_id);
                    return (
                      <StaggerItem key={ws.subtopic_id}>
                        <div
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover-lift',
                            checked ? 'border-primary/40 bg-primary/5' : 'border-border/40 glass hover:bg-muted/20'
                          )}
                          onClick={() => toggleSubtopic(ws.subtopic_id)}
                          role="checkbox"
                          aria-checked={checked}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                            checked ? 'bg-primary border-primary' : 'border-muted-foreground'
                          )}>
                            {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{ws.name}</span>
                              <Badge variant="outline" className="text-xs glass">
                                {ws.score.toFixed(0)}%
                              </Badge>
                            </div>
                            <Progress value={ws.score} className="h-1 mt-1.5">
                              <div className={cn('h-full rounded-full', MasteryColor(ws.score))} style={{ width: `${ws.score}%` }} />
                            </Progress>
                            {perf && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {perf.attempts_count} attempts
                              </p>
                            )}
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

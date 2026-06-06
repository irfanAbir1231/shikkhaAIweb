'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useWeakSubtopics, useSubtopicPerformance } from '@/lib/api/subtopics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, TrendingUp, Minus, BookOpen, Target } from 'lucide-react';
import Link from 'next/link';

function MasteryBar({ score }: { score: number }) {
  const color = score >= 60 ? 'bg-green-500' : score >= 30 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">Mastery</span>
        <span className="font-medium">{score.toFixed(1)}%</span>
      </div>
      <Progress value={score} className="h-2">
        <ProgressTrack>
          <ProgressIndicator className={color} />
        </ProgressTrack>
      </Progress>
    </div>
  );
}

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

export default function WeakSubtopicsPage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id ?? 0;

  const { data: weakSubtopics, isLoading: weakLoading } = useWeakSubtopics(studentId, 90);
  const { data: performance, isLoading: perfLoading } = useSubtopicPerformance(studentId);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please log in to view your subtopics.</p>
      </div>
    );
  }

  const isLoading = weakLoading || perfLoading;

  // Group weak subtopics by parent topic
  const grouped: Record<string, typeof weakSubtopics> = {};
  if (weakSubtopics) {
    for (const ws of weakSubtopics) {
      const key = ws.topic || 'General';
      grouped[key] = grouped[key] || [];
      grouped[key].push(ws);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weak Subtopics</h1>
          <p className="text-muted-foreground mt-1">
            Focus your practice on these specific areas to improve mastery.
          </p>
        </div>
        <Link href="/practice-exam" className="inline-flex">
          <Button variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Start Adaptive Practice
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && (!weakSubtopics || weakSubtopics.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Weak Subtopics!</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">
              Great job! You have mastered all subtopics at the current threshold (90%).
              Try taking more exams to discover new areas.
            </p>
            <Link href="/exam/config" className="mt-4 inline-flex">
              <Button>Take an Exam</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([topic, subtopicList]) => (
          <div key={topic} className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="secondary">{topic}</Badge>
              <span className="text-sm text-muted-foreground">
                {(subtopicList || []).length} weak subtopic{(subtopicList || []).length !== 1 ? 's' : ''}
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(subtopicList || []).map((ws) => {
                const perf = performance?.find((p) => p.subtopic_id === ws.subtopic_id);
                const trend = perf ? perf.last_score - perf.average_score : 0;
                return (
                  <Card key={ws.subtopic_id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">{ws.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MasteryBar score={ws.score} />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <TrendIcon trend={trend} />
                          <span className="text-muted-foreground">
                            {perf?.attempts_count ?? 0} attempts
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{ws.reason}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/practice-exam?focus=${ws.subtopic_id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Target className="w-3 h-3 mr-1" />
                            Practice
                          </Button>
                        </Link>
                        <Link href={`/personalized-notes?subtopic=${ws.subtopic_id}`} className="flex-1">
                          <Button size="sm" variant="ghost" className="w-full">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Notes
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

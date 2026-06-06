'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AttemptResponse } from '@/lib/types/exam';
import { formatDate } from '@/lib/utils/formatters';
import { getGradeColor } from '@/lib/utils/formatters';
import { useSaveExam, useUnsaveExam, useSavedExams } from '@/lib/api/exams';
import { Clock, TrendingUp, Bookmark, BookmarkCheck } from 'lucide-react';

async function fetchAttempts(studentId: number): Promise<AttemptResponse[]> {
  const res = await fetch(`/api/proxy/student/${studentId}/attempts`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch attempts');
  return data.data;
}

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
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load exam history</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam History</h1>
        <p className="text-muted-foreground">Your past exam attempts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No exams taken yet.</p>
              <p className="text-sm text-muted-foreground">Start your first exam from the dashboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((attempt) => (
                <AttemptRow
                  key={attempt.attempt_id}
                  attempt={attempt}
                  isSaved={savedExamIds.has(attempt.exam_id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AttemptRow({ attempt, isSaved }: { attempt: AttemptResponse; isSaved: boolean }) {
  const saveExam = useSaveExam();
  const unsaveExam = useUnsaveExam();
  const [saved, setSaved] = useState(isSaved);

  const handleToggleSave = () => {
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

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">Exam #{attempt.exam_id}</span>
          <Badge
            variant={attempt.score_percentage >= 60 ? 'default' : 'destructive'}
          >
            {attempt.score_percentage.toFixed(1)}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {formatDate(attempt.created_at)}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-medium">{attempt.mcq_correct}</span>
            <span className="text-muted-foreground">/ {attempt.mcq_total}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Readiness: {attempt.readiness_score.toFixed(1)}%
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSave}
          title={saved ? 'Unsave exam' : 'Save exam'}
        >
          {saved ? (
            <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

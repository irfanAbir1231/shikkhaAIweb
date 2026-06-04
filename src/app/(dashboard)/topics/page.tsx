'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TopicsData, SubjectTopics } from '@/lib/types/analytics';
import Link from 'next/link';
import { BookOpen, CheckCircle, Circle, TrendingUp } from 'lucide-react';

async function fetchTopics(studentId: number): Promise<TopicsData> {
  const res = await fetch(`/api/proxy/student/${studentId}/topics`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch topics');
  return data.data;
}

export default function TopicsPage() {
  const { user } = useAuthStore();
  const studentId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['topics', studentId],
    queryFn: () => fetchTopics(studentId!),
    enabled: !!studentId,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load topics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Topics</h1>
        <p className="text-muted-foreground">Browse and track your curriculum topics</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <p className="text-sm text-muted-foreground">
                {isLoading ? '...' : `${data?.completed_topics || 0} of ${data?.total_topics || 0} topics completed`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {isLoading
                  ? '...'
                  : data?.total_topics
                  ? Math.round((data.completed_topics / data.total_topics) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-3" />
          ) : (
            <Progress
              value={
                data?.total_topics
                  ? (data.completed_topics / data.total_topics) * 100
                  : 0
              }
              className="h-3"
            />
          )}
        </CardContent>
      </Card>

      {/* Subject Accordion */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Accordion className="space-y-3">
          {data?.subjects.map((subject) => (
            <SubjectCard key={subject.subject} subject={subject} />
          ))}
        </Accordion>
      )}
    </div>
  );
}

function SubjectCard({ subject }: { subject: SubjectTopics }) {
  return (
    <AccordionItem value={subject.subject} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 flex-1 text-left">
          <BookOpen className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <span className="font-medium capitalize">{subject.subject}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {subject.completed_topics}/{subject.total_topics}
            </span>
          </div>
          <div className="w-32 hidden sm:block">
            <Progress
              value={subject.overall_completion_percentage}
              className="h-2"
            />
          </div>
          <Badge variant={subject.completed_topics === subject.total_topics ? 'default' : 'secondary'}>
            {Math.round(subject.overall_completion_percentage)}%
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 pb-4">
          {subject.topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {topic.is_completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : topic.attempts_count > 0 ? (
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-sm">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.attempts_count} attempt{topic.attempts_count !== 1 ? 's' : ''}
                    {topic.last_score !== null && ` • Last: ${topic.last_score.toFixed(0)}%`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 hidden sm:block">
                  <Progress value={topic.completion_percentage} className="h-2" />
                </div>
                <Link
                  href={`/exam/config?subject=${subject.subject}&topic=${topic.name}`}
                >
                  <Button size="sm" variant="outline">
                    Practice
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

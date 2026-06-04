'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimpleLineChart } from '@/components/charts/line-chart';
import { AnalyticsData, WeakChapter, PracticeSuggestion } from '@/lib/types/analytics';
import { formatDate } from '@/lib/utils/formatters';
import {
  Target,
  BookOpen,
  Flame,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';

const timeRanges = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
];

async function fetchAnalytics(studentId: number): Promise<AnalyticsData> {
  const res = await fetch(`/api/proxy/student/${studentId}/analytics`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch analytics');
  return data.data;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30');
  const studentId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', studentId],
    queryFn: () => fetchAnalytics(studentId!),
    enabled: !!studentId,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your learning</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !data ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              title="Avg Accuracy"
              value={`${data.average_accuracy.toFixed(1)}%`}
              icon={Target}
              color="text-blue-500"
            />
            <StatCard
              title="Weak Chapters"
              value={String(data.weak_chapters.length)}
              icon={AlertTriangle}
              color="text-red-500"
            />
            <StatCard
              title="Questions"
              value={String(data.total_questions_attempted)}
              icon={BookOpen}
              color="text-green-500"
            />
            <StatCard
              title="Study Minutes"
              value={String(data.total_study_minutes)}
              icon={Clock}
              color="text-purple-500"
            />
          </>
        )}
      </div>

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="weakness">Weakness</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <div className="space-y-3">
                  {data.topic_accuracy.slice(0, 10).map((topic) => (
                    <div key={topic.topic} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{topic.topic}</span>
                        <span>{topic.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${topic.accuracy}%`,
                            backgroundColor:
                              topic.accuracy >= 60 ? '#10B981' : '#EF4444',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weakness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weak Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <Skeleton className="h-64" />
              ) : data.weak_chapters.length === 0 ? (
                <p className="text-muted-foreground">No weak chapters found!</p>
              ) : (
                <div className="space-y-3">
                  {data.weak_chapters.map((chapter) => (
                    <WeakChapterCard key={chapter.chapter_name} chapter={chapter} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Improvement History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <SimpleLineChart
                  data={data.improvement_history.map((h) => ({
                    name: formatDate(h.date),
                    value: h.overall_score,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </>
            ) : data.practice_suggestions.length === 0 ? (
              <p className="text-muted-foreground col-span-2">No practice suggestions yet.</p>
            ) : (
              data.practice_suggestions.map((suggestion) => (
                <PracticeSuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function WeakChapterCard({ chapter }: { chapter: WeakChapter }) {
  return (
    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{chapter.chapter_name}</h4>
          <p className="text-sm text-muted-foreground">{chapter.subject}</p>
        </div>
        <Badge variant="destructive">{chapter.accuracy.toFixed(1)}%</Badge>
      </div>
      <p className="text-sm mt-2">{chapter.suggested_action}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {chapter.related_topics.map((topic) => (
          <Badge key={topic} variant="secondary" className="text-xs">
            {topic}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PracticeSuggestionCard({ suggestion }: { suggestion: PracticeSuggestion }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{suggestion.title}</h4>
            <p className="text-sm text-muted-foreground">{suggestion.topic}</p>
          </div>
          <Badge>{suggestion.difficulty}</Badge>
        </div>
        <p className="text-sm">{suggestion.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {suggestion.estimated_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            +{suggestion.potential_impact.toFixed(0)}%
          </span>
        </div>
        <Button size="sm" className="w-full">
          Practice Now
        </Button>
      </CardContent>
    </Card>
  );
}

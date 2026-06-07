'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { StatCard } from '@/components/ui/stat-card';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { AIBackground } from '@/components/background/ai-background';
import {
  Target,
  BookOpen,
  AlertTriangle,
  Clock,
  Zap,
  Sparkles,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Brain,
} from 'lucide-react';

const timeRanges = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
];

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

async function fetchAnalytics(studentId: number): Promise<AnalyticsData> {
  const res = await fetch(`/api/proxy/student/${studentId}/analytics`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch analytics');
  return data.data;
}

function generateInsight(data: AnalyticsData): string {
  const parts: string[] = [];

  if (data.average_accuracy >= 80) {
    parts.push("Excellent performance! You're mastering most topics with strong accuracy.");
  } else if (data.average_accuracy >= 60) {
    parts.push(
      'Good progress! Your accuracy is solid — focus on weak chapters to push even higher.'
    );
  } else if (data.average_accuracy >= 40) {
    parts.push(
      'Steady improvement is visible. Targeted practice on weak areas will accelerate your growth.'
    );
  } else {
    parts.push(
      'Keep practicing! Your weak areas have been identified for focused study sessions.'
    );
  }

  if (data.weak_chapters.length === 0) {
    parts.push('No weak chapters detected — you\'re well-prepared across all subjects!');
  } else if (data.weak_chapters.length <= 3) {
    parts.push(
      `Only ${data.weak_chapters.length} weak chapter${
        data.weak_chapters.length > 1 ? 's' : ''
      } need attention. Quick targeted practice can make a big difference.`
    );
  } else {
    parts.push(
      `${data.weak_chapters.length} weak chapters need attention. Prioritize the highest-ranked ones for maximum impact.`
    );
  }

  if (data.improvement_history.length >= 2) {
    const first = data.improvement_history[0].overall_score;
    const last = data.improvement_history[data.improvement_history.length - 1].overall_score;
    const diff = last - first;
    if (diff > 5) {
      parts.push('Your scores are trending upward — keep up the momentum!');
    } else if (diff < -5) {
      parts.push(
        'Scores have dipped recently. Consistency is key — regular practice will turn the curve upward.'
      );
    } else {
      parts.push(
        'Your performance has been steady. A little extra focus on weak areas will unlock the next level.'
      );
    }
  }

  return parts.join(' ');
}

function EmptyState() {
  const router = useRouter();
  return (
    <Reveal>
      <Card variant="glass" className="text-center py-14">
        <CardContent className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-gradient grid place-items-center shadow-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No analytics yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Complete your first exam to unlock personalized insights and track your learning
              journey.
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => router.push('/exam/config')}
            className="shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Your First Exam
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function TabEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-14 space-y-4">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-gradient/10 grid place-items-center">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  );
}

function WeakChapterCard({ chapter }: { chapter: WeakChapter }) {
  return (
    <Card variant="glass" className="hover-lift interactive">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-medium truncate">{chapter.chapter_name}</h4>
            <p className="text-sm text-muted-foreground">{chapter.subject}</p>
          </div>
          <Badge variant="destructive" className="shrink-0">
            {chapter.accuracy.toFixed(1)}%
          </Badge>
        </div>
        <p className="text-sm leading-relaxed">{chapter.suggested_action}</p>
        <div className="flex flex-wrap gap-1.5">
          {chapter.related_topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs glass">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PracticeSuggestionCard({ suggestion }: { suggestion: PracticeSuggestion }) {
  const router = useRouter();

  const handlePractice = () => {
    const params = new URLSearchParams();
    if (suggestion.subject) params.set('subject', suggestion.subject);
    if (suggestion.topic) params.set('topic', suggestion.topic);
    if (suggestion.difficulty) params.set('difficulty', suggestion.difficulty);
    router.push(`/exam/config?${params.toString()}`);
  };

  return (
    <Card variant="glass" className="hover-lift interactive">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-medium truncate">{suggestion.title}</h4>
            <p className="text-sm text-muted-foreground">{suggestion.topic}</p>
          </div>
          <Badge className="glass shrink-0">{suggestion.difficulty}</Badge>
        </div>
        <p className="text-sm leading-relaxed">{suggestion.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {suggestion.estimated_minutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-warning" />
            +{suggestion.potential_impact.toFixed(0)}%
          </span>
        </div>
        <Button
          size="sm"
          variant="gradient"
          className="w-full shadow-glow hover:shadow-glow-lg transition-all"
          onClick={handlePractice}
        >
          Practice Now
        </Button>
      </CardContent>
    </Card>
  );
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
      <div className="relative min-h-screen pb-20">
        <div className="absolute inset-0 -z-10 opacity-30">
          <AIBackground />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Card variant="glass" className="text-center py-14">
            <CardContent className="space-y-2">
              <p className="text-destructive font-medium">Failed to load analytics</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasData = data && data.total_questions_attempted > 0;

  return (
    <div className="relative min-h-screen pb-20">
      <div className="absolute inset-0 -z-10 opacity-30">
        <AIBackground />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gradient">Analytics</h1>
              <p className="text-muted-foreground">Deep insights into your learning journey</p>
            </div>
            <div className="flex gap-2">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range.value)}
                  className={
                    timeRange === range.value
                      ? 'shadow-glow'
                      : 'glass border-0 hover:bg-primary/10'
                  }
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Stats Cards */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-28 skeleton-shimmer rounded-2xl" />
                <Skeleton className="h-28 skeleton-shimmer rounded-2xl" />
                <Skeleton className="h-28 skeleton-shimmer rounded-2xl" />
                <Skeleton className="h-28 skeleton-shimmer rounded-2xl" />
              </>
            ) : (
              <>
                <StatCard
                  label="Avg Accuracy"
                  value={data.average_accuracy}
                  suffix="%"
                  icon={Target}
                  tone="brand"
                />
                <StatCard
                  label="Weak Chapters"
                  value={data.weak_chapters.length}
                  icon={AlertTriangle}
                  tone="warning"
                />
                <StatCard
                  label="Questions"
                  value={data.total_questions_attempted}
                  icon={BookOpen}
                  tone="success"
                />
                <StatCard
                  label="Study Minutes"
                  value={data.total_study_minutes}
                  icon={Clock}
                  tone="muted"
                />
              </>
            )}
          </div>
        </Reveal>

        {/* AI Insight */}
        {data && (
          <Reveal delay={0.15}>
            <AIInsightCard>
              {generateInsight(data)}
            </AIInsightCard>
          </Reveal>
        )}

        {/* Tabs */}
        <Reveal delay={0.2}>
          <Tabs defaultValue="topics">
            <TabsList className="glass rounded-xl p-1 flex-wrap">
              <TabsTrigger value="topics" className="gap-1.5 rounded-lg text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Topics</span>
              </TabsTrigger>
              <TabsTrigger value="weakness" className="gap-1.5 rounded-lg text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Weakness</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 rounded-lg text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="gap-1.5 rounded-lg text-xs sm:text-sm">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Practice</span>
              </TabsTrigger>
            </TabsList>

            {/* Topics */}
            <TabsContent value="topics" className="mt-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Topic Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || !data ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : data.topic_accuracy.length === 0 ? (
                    <TabEmptyState
                      icon={BarChart3}
                      title="No topic data yet"
                      description="Complete exams to see your accuracy breakdown across topics."
                    />
                  ) : (
                    <Stagger gap={0.05} className="space-y-4">
                      {data.topic_accuracy.slice(0, 10).map((topic, index) => (
                        <StaggerItem key={topic.topic}>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium truncate max-w-[60%]">
                                {topic.topic}
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                {topic.accuracy.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                  width: `${topic.accuracy}%`,
                                  backgroundColor: chartColors[index % chartColors.length],
                                }}
                              />
                            </div>
                          </div>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weakness */}
            <TabsContent value="weakness" className="mt-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Weak Chapters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || !data ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 skeleton-shimmer rounded-2xl" />
                      ))}
                    </div>
                  ) : data.weak_chapters.length === 0 ? (
                    <TabEmptyState
                      icon={AlertTriangle}
                      title="No weak chapters"
                      description="Great job! You're performing well across all chapters."
                    />
                  ) : (
                    <Stagger gap={0.06} className="space-y-3">
                      {data.weak_chapters.map((chapter) => (
                        <StaggerItem key={chapter.chapter_name}>
                          <WeakChapterCard chapter={chapter} />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="mt-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Improvement History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || !data ? (
                    <Skeleton className="h-[300px] skeleton-shimmer rounded-2xl" />
                  ) : data.improvement_history.length === 0 ? (
                    <TabEmptyState
                      icon={TrendingUp}
                      title="No history yet"
                      description="Complete exams to track your progress over time."
                    />
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

            {/* Practice */}
            <TabsContent value="practice" className="mt-6">
              {isLoading || !data ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-48 skeleton-shimmer rounded-2xl" />
                  <Skeleton className="h-48 skeleton-shimmer rounded-2xl" />
                </div>
              ) : data.practice_suggestions.length === 0 ? (
                <Card variant="glass">
                  <CardContent>
                    <TabEmptyState
                      icon={Lightbulb}
                      title="No suggestions yet"
                      description="Practice more topics to get AI-powered recommendations tailored for you."
                    />
                  </CardContent>
                </Card>
              ) : (
                <Stagger gap={0.06} className="grid gap-4 md:grid-cols-2">
                  {data.practice_suggestions.map((suggestion) => (
                    <StaggerItem key={suggestion.id}>
                      <PracticeSuggestionCard suggestion={suggestion} />
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </TabsContent>
          </Tabs>
        </Reveal>

        {/* Global empty state */}
        {!isLoading && !hasData && (
          <Reveal delay={0.25}>
            <EmptyState />
          </Reveal>
        )}
      </div>
    </div>
  );
}

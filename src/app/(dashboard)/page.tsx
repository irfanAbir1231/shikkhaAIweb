'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { AILoader } from '@/components/ui/ai-loader';
import { GradientText } from '@/components/ui/gradient-text';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { SimpleLineChart } from '@/components/charts/line-chart';
import { SimpleBarChart } from '@/components/charts/bar-chart';
import { KnowledgeGraph } from '@/components/adaptive/knowledge-graph';
import type { DashboardData } from '@/lib/types/analytics';
import { formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  FileQuestion,
  Library,
  ArrowRight,
  Lightbulb,
  Flame,
  AlertTriangle,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  Network,
} from 'lucide-react';

const quickActions = [
  {
    href: '/study-companion',
    label: 'Study Companion',
    icon: Brain,
    color: 'bg-blue-500',
  },
  {
    href: '/exam/config',
    label: 'Take Exam',
    icon: FileQuestion,
    color: 'bg-green-500',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BookOpen,
    color: 'bg-purple-500',
  },
  {
    href: '/library',
    label: 'Library',
    icon: Library,
    color: 'bg-amber-500',
  },
];

async function fetchDashboard(studentId: number): Promise<DashboardData> {
  const res = await fetch(`/api/proxy/student/${studentId}/dashboard`);
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error?.message || 'Failed to fetch dashboard');
  return data.data;
}

function getEncouragement(data: DashboardData): string {
  const { readiness, streak, weak_subjects, recent_quizzes } = data;

  if (weak_subjects.length > 0 && readiness.trend > 0) {
    return `Your overall readiness is up ${readiness.trend}% this week. Focus on ${weak_subjects[0].name} to keep the momentum going.`;
  }
  if (streak.current_streak >= 3) {
    return `Incredible — you've maintained a ${streak.current_streak}-day study streak! Consistency is the key to mastery.`;
  }
  if (readiness.overall >= 80) {
    return `Outstanding work! Your ${readiness.overall.toFixed(0)}% readiness score puts you in the top tier.`;
  }
  if (recent_quizzes.length > 0 && weak_subjects.length > 0) {
    return `You've taken ${recent_quizzes.length} exams. Strengthening ${weak_subjects[0].name} will boost your overall score.`;
  }
  if (recent_quizzes.length === 0) {
    return 'Welcome! Take your first exam to unlock personalized insights and track your progress.';
  }
  return 'Keep up the great work! Every practice session brings you closer to mastery.';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const studentId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', studentId],
    queryFn: () => fetchDashboard(studentId!),
    enabled: !!studentId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/15">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="mt-1 mb-6 max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t retrieve your learning data. Please check your
          connection and try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-8 py-4">
        <AILoader label="Analyzing your learning data…" className="py-8" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const encouragement = getEncouragement(data);

  return (
    <div className="space-y-8 py-2">
      {/* 1. Greeting + AI Encouragement */}
      <Reveal>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <GradientText>
                Hello, {user?.name?.split(' ')[0] || 'Student'}!
              </GradientText>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Welcome to your AI Command Center
            </p>
          </div>
          <AIInsightCard title="AI Encouragement">
            {encouragement}
          </AIInsightCard>
        </div>
      </Reveal>

      {/* 2. Quick Actions */}
      <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <StaggerItem key={action.href}>
              <Link href={action.href} className="block">
                <Card
                  variant="glass"
                  interactive
                  className="flex items-center gap-3 p-4"
                >
                  <div
                    className={`${action.color} rounded-lg p-2 text-white shadow-glow`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* 3. Stat Row */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Mastery"
            value={data.readiness.overall}
            suffix="%"
            icon={Target}
            tone="brand"
            trend={data.readiness.trend}
            hint="Overall readiness score"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Study Streak"
            value={data.streak.current_streak}
            suffix=" days"
            icon={Flame}
            tone="success"
            hint={`Best: ${data.streak.longest_streak} days`}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Exams Taken"
            value={data.recent_quizzes.length}
            icon={FileQuestion}
            tone="muted"
            hint="Total quizzes completed"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Weak Areas"
            value={data.weak_subjects.length}
            icon={AlertTriangle}
            tone="warning"
            hint="Topics needing attention"
          />
        </StaggerItem>
      </Stagger>

      {/* 4. Mastery Overview + Focus Areas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Mastery Overview</CardTitle>
              <CardDescription>
                Your overall learning readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ProgressRing
                  value={data.readiness.overall}
                  size={140}
                  strokeWidth={12}
                  label="Overall Mastery"
                >
                  <div className="text-center">
                    <span className="font-heading text-3xl font-semibold tabular-nums">
                      {Math.round(data.readiness.overall)}
                    </span>
                    <span className="text-sm text-muted-foreground">%</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Mastery
                    </p>
                  </div>
                </ProgressRing>
                <div className="flex-1 space-y-3">
                  {Object.entries(data.readiness.breakdown).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No breakdown data yet.
                    </p>
                  ) : (
                    Object.entries(data.readiness.breakdown).map(
                      ([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{key}</span>
                            <span className="text-muted-foreground">
                              {value.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-brand-gradient"
                              style={{
                                width: `${Math.max(0, Math.min(100, value))}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
              <CardDescription>
                Topics that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.weak_subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-success/15">
                    <Trophy className="size-6 text-success" />
                  </div>
                  <p className="text-sm font-medium">No weak subjects!</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You&apos;re doing great across all topics.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.weak_subjects.slice(0, 5).map((subject) => (
                    <div key={subject.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{subject.name}</span>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            subject.accuracy < 40
                              ? 'text-destructive'
                              : subject.accuracy < 60
                                ? 'text-warning'
                                : 'text-muted-foreground'
                          )}
                        >
                          {subject.accuracy}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            subject.accuracy < 40
                              ? 'bg-destructive'
                              : subject.accuracy < 60
                                ? 'bg-warning'
                                : 'bg-success'
                          )}
                          style={{
                            width: `${Math.max(0, Math.min(100, subject.accuracy))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* 5. Performance Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Improvement Over Time</CardTitle>
              <CardDescription>Weekly score progression</CardDescription>
            </CardHeader>
            <CardContent>
              {data.improvement.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15">
                    <TrendingUp className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">
                    No improvement data yet
                  </p>
                  <p className="mt-1 mb-4 text-xs text-muted-foreground">
                    Complete more exams to see your progress over time.
                  </p>
                  <Link href="/exam/config">
                    <Button variant="gradient" size="sm">
                      Take an Exam
                    </Button>
                  </Link>
                </div>
              ) : (
                <SimpleLineChart
                  data={data.improvement.map((p) => ({
                    name: p.week,
                    value: p.score,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Topic Accuracy</CardTitle>
              <CardDescription>Accuracy breakdown by topic</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topic_accuracy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15">
                    <Zap className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">No topic data yet</p>
                  <p className="mt-1 mb-4 text-xs text-muted-foreground">
                    Practice different topics to build your accuracy profile.
                  </p>
                  <Link href="/exam/config">
                    <Button variant="gradient" size="sm">
                      Start Practicing
                    </Button>
                  </Link>
                </div>
              ) : (
                <SimpleBarChart
                  data={data.topic_accuracy.slice(0, 8).map((t) => ({
                    name:
                      t.topic.length > 20
                        ? t.topic.slice(0, 20) + '...'
                        : t.topic,
                    value: t.accuracy,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* 6. Your Knowledge Map */}
      <Reveal>
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="size-5 text-primary" />
              <CardTitle>Your Knowledge Map</CardTitle>
            </div>
            <CardDescription>
              Visual map of your topic mastery across subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topic_accuracy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15">
                  <Network className="size-6 text-primary" />
                </div>
                <p className="text-sm font-medium">No knowledge map yet</p>
                <p className="mt-1 mb-4 text-xs text-muted-foreground">
                  Practice different topics to visualize your knowledge network.
                </p>
                <Link href="/exam/config">
                  <Button variant="gradient" size="sm">
                    Start Practicing
                  </Button>
                </Link>
              </div>
            ) : (
              <KnowledgeGraph
                nodes={data.topic_accuracy.map((t, i) => ({
                  id: `ta-${i}`,
                  name: t.topic,
                  mastery: t.accuracy,
                  isWeak: t.accuracy < 60 && t.total_questions > 0,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* 7. Recent Exams */}
      <Reveal>
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Exams</CardTitle>
              <CardDescription>Your latest quiz attempts</CardDescription>
            </div>
            <Link href="/exam/history">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recent_quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15">
                  <FileQuestion className="size-6 text-primary" />
                </div>
                <p className="text-sm font-medium">No exams taken yet</p>
                <p className="mt-1 mb-4 text-xs text-muted-foreground">
                  Start your learning journey with a practice exam.
                </p>
                <Link href="/exam/config">
                  <Button variant="gradient" size="sm">
                    Take First Exam
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.recent_quizzes.slice(0, 6).map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/exam/result/${quiz.id}`}
                    className="block"
                  >
                    <Card variant="glass" interactive className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {quiz.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {quiz.subject}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            quiz.score / quiz.total >= 0.6
                              ? 'bg-success/15 text-success'
                              : 'bg-destructive/15 text-destructive'
                          )}
                        >
                          {quiz.score}/{quiz.total}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{formatDate(quiz.date)}</span>
                        <span>•</span>
                        <Clock className="size-3" />
                        <span>{quiz.time_taken}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* 8. AI Insights / Recommendations */}
      <div className="space-y-4">
        <Reveal>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="size-5 text-yellow-500" />
              AI Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Personalized recommendations for you
            </p>
          </div>
        </Reveal>
        {data.recommendations.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-8 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15">
                <Brain className="size-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No recommendations yet</p>
              <p className="mt-1 mb-4 text-xs text-muted-foreground">
                Complete more activities to receive AI-powered learning tips.
              </p>
              <Link href="/study-companion">
                <Button variant="gradient" size="sm">
                  Ask AI Companion
                </Button>
              </Link>
            </div>
          </Reveal>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recommendations.map((rec) => (
              <StaggerItem key={rec.id}>
                <AIInsightCard
                  title={rec.type || 'Recommendation'}
                  pulse={rec.priority === 'high'}
                >
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rec.description}
                  </p>
                </AIInsightCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ReadinessCard } from '@/components/dashboard/readiness-card';
import { StreakCard } from '@/components/dashboard/streak-card';
import { SimpleLineChart } from '@/components/charts/line-chart';
import { SimpleBarChart } from '@/components/charts/bar-chart';
import { DashboardData } from '@/lib/types/analytics';
import { formatDate } from '@/lib/utils/formatters';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  FileQuestion,
  Timer,
  ArrowRight,
  Lightbulb,
  Target,
} from 'lucide-react';

const quickActions = [
  { href: '/study-companion', label: 'Study Companion', icon: Brain, color: 'bg-blue-500' },
  { href: '/exam/config', label: 'Take Exam', icon: FileQuestion, color: 'bg-green-500' },
  { href: '/practice-exam', label: 'Adaptive Practice', icon: Target, color: 'bg-red-500' },
  { href: '/analytics', label: 'Analytics', icon: BookOpen, color: 'bg-purple-500' },
];

async function fetchDashboard(studentId: number): Promise<DashboardData> {
  const res = await fetch(`/api/proxy/student/${studentId}/dashboard`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch dashboard');
  return data.data;
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
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your learning progress overview
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`${action.color} p-2 rounded-lg text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading || !data ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : (
          <>
            <div className="lg:col-span-1">
              <ReadinessCard data={data.readiness} />
            </div>
            <StreakCard data={data.streak} />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Weak Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.weak_subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No weak subjects! Great job!</p>
                ) : (
                  <div className="space-y-2">
                    {data.weak_subjects.slice(0, 3).map((subject) => (
                      <div key={subject.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <span className="text-sm" style={{ color: subject.color }}>
                          {subject.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Improvement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <SimpleLineChart
                data={data.improvement.map((p) => ({ name: p.week, value: p.score }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <SimpleBarChart
                data={data.topic_accuracy.slice(0, 8).map((t) => ({
                  name: t.topic.length > 20 ? t.topic.slice(0, 20) + '...' : t.topic,
                  value: t.accuracy,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Quizzes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Quizzes</CardTitle>
          <Link href="/exam/history">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-40" />
          ) : data.recent_quizzes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No quizzes taken yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recent_quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(quiz.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {quiz.score}/{quiz.total}
                    </p>
                    <p className="text-xs text-muted-foreground">{quiz.time_taken}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {data.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : rec.priority === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                      : 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  }`}
                >
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

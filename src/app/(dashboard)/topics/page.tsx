'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useTopicsMastery } from '@/hooks/use-topics-mastery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SubjectCard } from './components/subject-card';
import { TopicsSkeleton } from './components/topics-skeleton';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import {
  LearningPath,
  KnowledgeGraph,
  TopicProgressMap,
} from '@/components/adaptive';
import type { PathStep, GraphNode, MapTopic } from '@/components/adaptive';
import {
  AlertCircle,
  RotateCcw,
  BookOpen,
  Trophy,
  Route,
  Network,
  LayoutGrid,
} from 'lucide-react';

export default function TopicsMasteryPage() {
  const { user } = useAuthStore();
  const studentId = user?.id;

  const { data, isLoading, error, refetch } = useTopicsMastery(studentId);

  const overallPercentage =
    data && data.total_topics > 0
      ? Math.round((data.completed_topics / data.total_topics) * 100)
      : 0;

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Topics Mastery</h1>
          <p className="text-muted-foreground">Track your progress across all subjects and chapters</p>
        </div>
        <Card variant="glass">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Failed to load topics</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {error instanceof Error ? error.message : 'Something went wrong while fetching your topics data.'}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="gradient" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Topics Mastery</h1>
            <p className="text-muted-foreground">Track your progress across all subjects and chapters</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {data && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:self-center">
                <BookOpen className="w-4 h-4" />
                <span>
                  {data.total_topics} topic{data.total_topics !== 1 ? 's' : ''} total
                </span>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Overall Progress Card */}
      <Reveal>
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-glow">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Overall Progress</h3>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {data?.completed_topics || 0} of {data?.total_topics || 0} topics mastered
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isLoading ? (
                  <div className="text-3xl font-bold text-muted-foreground">...</div>
                ) : (
                  <span className="text-3xl font-bold tabular-nums text-gradient">{overallPercentage}%</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-3 bg-muted rounded-full skeleton-shimmer" />
              ) : (
                <Progress value={overallPercentage} className="h-3" />
              )}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* AI Insight */}
      {!isLoading && data && data.subjects.length > 0 && (
        <Reveal>
          <AIInsightCard>
            {getInsightMessage(overallPercentage, data.completed_topics, data.total_topics, data.subjects)}
          </AIInsightCard>
        </Reveal>
      )}

      {/* Adaptive Visualizations */}
      {!isLoading && data && data.subjects.length > 0 && (
        <div className="space-y-5">
          {/* Learning Path */}
          <Reveal>
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                    <Route className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle>Recommended Learning Path</CardTitle>
                </div>
                <CardDescription>Your personalized next steps</CardDescription>
              </CardHeader>
              <CardContent>
                <LearningPath steps={buildLearningPath(data.subjects)} />
              </CardContent>
            </Card>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Knowledge Graph */}
            <Reveal>
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                      <Network className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle>Knowledge Graph</CardTitle>
                  </div>
                  <CardDescription>Topic relationships and mastery</CardDescription>
                </CardHeader>
                <CardContent>
                  <KnowledgeGraph nodes={buildGraphNodes(data.subjects)} />
                </CardContent>
              </Card>
            </Reveal>

            {/* Topic Progress Heatmap */}
            <Reveal>
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                      <LayoutGrid className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle>Topic Progress Map</CardTitle>
                  </div>
                  <CardDescription>Mastery heatmap across all topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopicProgressMap topics={buildMapTopics(data.subjects)} columns={6} />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      )}

      {/* Subject Cards */}
      {isLoading ? (
        <TopicsSkeleton />
      ) : !data || data.subjects.length === 0 ? (
        <Card variant="glass">
          <CardContent className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center mx-auto shadow-glow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">No topics found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your curriculum topics will appear here once they are available. Check back later or contact your teacher.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Stagger className="space-y-5">
          {data.subjects.map((subject) => (
            <StaggerItem key={subject.subject}>
              <SubjectCard subject={subject} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function getInsightMessage(
  percentage: number,
  completed: number,
  total: number,
  subjects: { subject: string; chapters: { topics: { is_weak: boolean; completion_percentage: number }[] }[] }[]
) {
  if (percentage >= 90) {
    return `Outstanding! You've mastered ${completed} of ${total} topics. You're in the top tier — consider revisiting weak areas to lock in 100%.`;
  }
  if (percentage >= 70) {
    return `Great momentum! You're ${percentage}% through your curriculum. Focus on the remaining ${total - completed} topics to push past the finish line.`;
  }
  if (percentage >= 40) {
    const weakSubjects = subjects
      .filter((s) => s.chapters.some((c) => c.topics.some((t) => t.is_weak)))
      .map((s) => s.subject);
    if (weakSubjects.length > 0) {
      return `You're making solid progress at ${percentage}%. Your weakest subjects are ${weakSubjects.join(', ')} — tackling those first will give you the biggest boost.`;
    }
    return `You're making solid progress at ${percentage}%. Keep building consistency — small daily sessions add up fast.`;
  }
  return `Starting strong! With ${completed} topics mastered so far, focus on one chapter at a time. The AI will guide your path as you go.`;
}

function buildLearningPath(subjects: { chapters: { topics: { id: string; name: string; completion_percentage: number; is_completed: boolean; is_weak: boolean; availability_status?: string }[] }[] }[]): PathStep[] {
  const steps: PathStep[] = [];
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      for (const topic of chapter.topics) {
        if (topic.availability_status === 'locked') continue;
        let status: PathStep['status'] = 'locked';
        if (topic.is_completed) status = 'completed';
        else if (topic.is_weak) status = 'current';
        else if (topic.completion_percentage > 0) status = 'current';
        else if (steps.filter((s) => s.status === 'current').length === 0) status = 'current';
        else status = 'locked';
        steps.push({
          id: topic.id,
          name: topic.name,
          status,
          mastery: topic.completion_percentage,
        });
      }
    }
  }
  // Sort: completed first, then current, then locked
  const order = { completed: 0, current: 1, locked: 2 };
  steps.sort((a, b) => order[a.status] - order[b.status]);
  // Limit to first 8 for visual clarity
  return steps.slice(0, 8);
}

function buildGraphNodes(subjects: { subject: string; chapters: { topics: { id: string; name: string; completion_percentage: number; is_weak: boolean; availability_status?: string }[] }[] }[]): GraphNode[] {
  const nodes: GraphNode[] = [];
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      for (const topic of chapter.topics) {
        if (topic.availability_status === 'locked') continue;
        nodes.push({
          id: topic.id,
          name: topic.name,
          mastery: topic.completion_percentage,
          isWeak: topic.is_weak,
          subject: subject.subject,
          group: subject.subject,
        });
      }
    }
  }
  return nodes;
}

function buildMapTopics(subjects: { subject: string; chapters: { topics: { id: string; name: string; completion_percentage: number; is_weak: boolean; availability_status?: string }[] }[] }[]): MapTopic[] {
  const topics: MapTopic[] = [];
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      for (const topic of chapter.topics) {
        if (topic.availability_status === 'locked') continue;
        topics.push({
          id: topic.id,
          name: topic.name,
          mastery: topic.completion_percentage,
          isWeak: topic.is_weak,
          subject: subject.subject,
        });
      }
    }
  }
  return topics;
}

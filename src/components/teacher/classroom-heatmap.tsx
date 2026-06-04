'use client';

import { TopicHeatmapData } from '@/lib/types/teacher';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';

interface ClassroomHeatmapProps {
  topics: TopicHeatmapData[] | undefined;
  isLoading: boolean;
}

function getHeatmapStyles(ratio: number) {
  const clamped = Math.max(0, Math.min(1, ratio));

  const hue = Math.round((1 - clamped) * 120);
  const saturation = 75;
  const lightness = 88 - Math.round(clamped * 18);
  const borderLightness = lightness - 12;

  const textHue = clamped > 0.5 ? 0 : 120;
  const textSat = clamped > 0.5 ? 70 : 60;
  const textLight = clamped > 0.5 ? 30 : 25;

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    borderColor: `hsl(${hue}, ${saturation}%, ${borderLightness}%)`,
    color: `hsl(${textHue}, ${textSat}%, ${textLight}%)`,
    ratio: clamped,
  };
}

function getStatusLabel(ratio: number) {
  if (ratio <= 0.2) return { label: 'Strong', icon: CheckCircle2 };
  if (ratio <= 0.5) return { label: 'Mixed', icon: MinusCircle };
  return { label: 'Weak', icon: AlertTriangle };
}

export function ClassroomHeatmap({ topics, isLoading }: ClassroomHeatmapProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground text-sm">
          No topic performance data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'hsl(120, 75%, 80%)' }}
          />
          Strong mastery (&le;20% weak)
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'hsl(60, 75%, 80%)' }}
          />
          Mixed understanding
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'hsl(0, 75%, 80%)' }}
          />
          Urgent intervention (&ge;50% weak)
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {topics.map((topic) => {
          const ratio =
            topic.total_students > 0
              ? topic.weak_students / topic.total_students
              : 0;
          const styles = getHeatmapStyles(ratio);
          const status = getStatusLabel(ratio);
          const StatusIcon = status.icon;

          return (
            <div
              key={topic.topic}
              className="relative rounded-lg border p-3 transition-transform hover:scale-[1.02] cursor-default"
              style={{
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor,
                color: styles.color,
              }}
              title={`${topic.topic}: ${topic.weak_students} of ${topic.total_students} students struggling`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight line-clamp-2">
                  {topic.topic}
                </p>
                <StatusIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              </div>

              <div className="mt-2 flex items-end justify-between">
                <span className="text-xs font-medium opacity-90">
                  {topic.weak_students}/{topic.total_students} weak
                </span>
                <span className="text-xs font-bold opacity-80">
                  {Math.round(ratio * 100)}%
                </span>
              </div>

              {/* Mini bar */}
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-current opacity-60"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

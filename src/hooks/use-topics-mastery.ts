'use client';

import { useQuery } from '@tanstack/react-query';
import { TopicsMasteryData } from '@/lib/types/analytics';

async function fetchTopicsMastery(studentId: number): Promise<TopicsMasteryData> {
  const res = await fetch(`/api/proxy/student/${studentId}/topics`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch topics mastery');
  return data.data as TopicsMasteryData;
}

export function useTopicsMastery(studentId: number | undefined) {
  return useQuery({
    queryKey: ['topics-mastery', studentId],
    queryFn: () => fetchTopicsMastery(studentId!),
    enabled: !!studentId,
  });
}

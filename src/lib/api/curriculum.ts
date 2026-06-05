'use client';

import { useQuery } from '@tanstack/react-query';
import { Chapter, Topic } from '@/lib/types/exam';

async function fetchChapters(classLevel: string, subject: string): Promise<Chapter[]> {
  const res = await fetch(`/api/proxy/curriculum/${classLevel}/${subject}/chapters`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch chapters');
  return data.data as Chapter[];
}

async function fetchTopics(
  classLevel: string,
  subject: string,
  chapter: string,
  search: string
): Promise<Topic[]> {
  const params = new URLSearchParams();
  params.set('chapter', chapter);
  if (search.trim()) params.set('search', search.trim());

  const res = await fetch(`/api/proxy/curriculum/${classLevel}/${subject}/topics?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch topics');
  return data.data as Topic[];
}

export function useChapters(classLevel: string | undefined, subject: string | undefined) {
  return useQuery({
    queryKey: ['chapters', classLevel, subject],
    queryFn: () => fetchChapters(classLevel!, subject!),
    enabled: !!classLevel && !!subject,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useTopics(
  classLevel: string | undefined,
  subject: string | undefined,
  chapter: string | undefined,
  search: string
) {
  return useQuery({
    queryKey: ['topics', classLevel, subject, chapter, search],
    queryFn: () => fetchTopics(classLevel!, subject!, chapter!, search),
    enabled: !!classLevel && !!subject && !!chapter,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

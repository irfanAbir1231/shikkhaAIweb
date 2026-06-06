'use client';

import { useQuery } from '@tanstack/react-query';
import { TopicsMasteryData, MasteryTopic } from '@/lib/types/analytics';

// Fallback heuristic mapping — only used when backend returns flat topics without chapter field
const TOPIC_TO_CHAPTER_MAP: Record<string, string> = {
  'force': 'Force and Motion',
  'motion': 'Force and Motion',
  'newton': 'Force and Motion',
  'velocity': 'Force and Motion',
  'acceleration': 'Force and Motion',
  'light': 'Light',
  'reflection': 'Light',
  'refraction': 'Light',
  'lens': 'Light',
  'mirror': 'Light',
  'chemical': 'Chemical Reactions',
  'reaction': 'Chemical Reactions',
  'atom': 'Chemical Reactions',
  'molecule': 'Chemical Reactions',
  'equation': 'Chemical Reactions',
  'acid': 'Chemical Reactions',
  'base': 'Chemical Reactions',
  'earth': 'Earth and Universe',
  'universe': 'Earth and Universe',
  'star': 'Earth and Universe',
  'planet': 'Earth and Universe',
  'galaxy': 'Earth and Universe',
};

function getChapterForTopic(topicName: string): string {
  const normalized = topicName.toLowerCase().trim();
  for (const [key, chapter] of Object.entries(TOPIC_TO_CHAPTER_MAP)) {
    if (normalized.includes(key)) return chapter;
  }
  return 'General Topics';
}

function buildTopicItem(t: any): MasteryTopic {
  const completion = t.completion_percentage ?? 0;
  const attempts = t.attempts_count ?? 0;
  const is_completed = t.is_completed ?? (completion >= 60.0);
  const is_attempted = t.is_attempted ?? (attempts > 0);
  return {
    id: t.id || `topic_${Math.random().toString(36).substr(2, 9)}`,
    name: t.name,
    chapter: t.chapter,
    chapter_number: t.chapter_number,
    completion_percentage: completion,
    attempts_count: attempts,
    is_completed,
    is_attempted,
    is_weak: t.is_weak ?? (is_attempted && completion < 60.0),
    last_score: t.last_score ?? null,
    weak_subtopic_ids: t.weak_subtopic_ids ?? [],
    availability_status: t.availability_status,
    page_start: t.page_start,
    page_end: t.page_end,
  };
}

function parseTopicsResponse(data: any): TopicsMasteryData {
  if (!data) {
    return { subjects: [], total_topics: 0, completed_topics: 0 };
  }

  // If the backend response already has nested chapters, return it as-is
  if (data.subjects && data.subjects.length > 0 && 'chapters' in data.subjects[0]) {
    return data as TopicsMasteryData;
  }

  // Otherwise, group flat topics under subjects into chapters
  const parsedSubjects = (data.subjects || []).map((subj: any) => {
    if (subj.chapters) return subj;

    const topics = subj.topics || [];
    const chaptersMap: Record<string, { topics: MasteryTopic[]; chapter_number?: number }> = {};

    topics.forEach((t: any) => {
      const chapterName = t.chapter || getChapterForTopic(t.name);
      if (!chaptersMap[chapterName]) {
        chaptersMap[chapterName] = { topics: [], chapter_number: t.chapter_number };
      }
      chaptersMap[chapterName].topics.push(buildTopicItem(t));
    });

    const chapters = Object.entries(chaptersMap).map(([chapter_name, data]) => {
      const chapterTopics = data.topics;
      const completedCount = chapterTopics.filter((t) => t.is_completed).length;
      const totalCount = chapterTopics.length;
      const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      return {
        chapter_name,
        chapter_number: data.chapter_number,
        overall_completion_percentage: pct,
        topics: chapterTopics,
      };
    });

    return {
      subject: subj.subject,
      icon_name: subj.icon_name,
      total_topics: subj.total_topics ?? topics.length,
      completed_topics: subj.completed_topics ?? chapters.reduce((acc: number, ch: any) => acc + ch.topics.filter((t: any) => t.is_completed).length, 0),
      overall_completion_percentage: subj.overall_completion_percentage ?? 0,
      chapters,
    };
  });

  return {
    subjects: parsedSubjects,
    total_topics: data.total_topics ?? parsedSubjects.reduce((acc: number, s: any) => acc + s.total_topics, 0),
    completed_topics: data.completed_topics ?? parsedSubjects.reduce((acc: number, s: any) => acc + s.completed_topics, 0),
  };
}

async function fetchTopicsMastery(studentId: number): Promise<TopicsMasteryData> {
  const res = await fetch(`/api/proxy/student/${studentId}/topics`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch topics mastery');
  return parseTopicsResponse(data.data);
}

export function useTopicsMastery(studentId: number | undefined) {
  return useQuery({
    queryKey: ['topics-mastery', studentId],
    queryFn: () => fetchTopicsMastery(studentId!),
    enabled: !!studentId,
  });
}

// No mock fallback — show empty state when API is unavailable

async function fetchAvailableTopics(studentId: number): Promise<TopicsMasteryData> {
  const res = await fetch(`/api/proxy/student/${studentId}/available-topics`);
  if (!res.ok) {
    return { subjects: [], total_topics: 0, completed_topics: 0 };
  }
  const data = await res.json();
  if (!data.success) {
    return { subjects: [], total_topics: 0, completed_topics: 0 };
  }
  return parseTopicsResponse(data.data);
}

export function useAvailableTopics(studentId: number | undefined) {
  return useQuery({
    queryKey: ['available-topics', studentId],
    queryFn: () => fetchAvailableTopics(studentId!),
    enabled: !!studentId,
  });
}

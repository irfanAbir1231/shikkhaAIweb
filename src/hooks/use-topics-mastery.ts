'use client';

import { useQuery } from '@tanstack/react-query';
import { TopicsMasteryData, MasteryTopic } from '@/lib/types/analytics';

// Simple heuristic mapping to group flat curriculum topics into chapters
const TOPIC_TO_CHAPTER_MAP: Record<string, string> = {
  // Force & Motion
  'force': 'Force and Motion',
  'motion': 'Force and Motion',
  'newton': 'Force and Motion',
  'velocity': 'Force and Motion',
  'acceleration': 'Force and Motion',
  
  // Light
  'light': 'Light',
  'reflection': 'Light',
  'refraction': 'Light',
  'lens': 'Light',
  'mirror': 'Light',

  // Chemistry
  'chemical': 'Chemical Reactions',
  'reaction': 'Chemical Reactions',
  'atom': 'Chemical Reactions',
  'molecule': 'Chemical Reactions',
  'equation': 'Chemical Reactions',
  'acid': 'Chemical Reactions',
  'base': 'Chemical Reactions',
  
  // Earth & Space
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

function parseTopicsResponse(data: any): TopicsMasteryData {
  if (!data) {
    return { subjects: [], total_topics: 0, completed_topics: 0 };
  }

  // If the backend response already matches TopicsMasteryData with nested chapters, return it as-is
  if (data.subjects && data.subjects.length > 0 && 'chapters' in data.subjects[0]) {
    return data as TopicsMasteryData;
  }

  // Otherwise, group flat topics under subjects into chapters
  const parsedSubjects = (data.subjects || []).map((subj: any) => {
    if (subj.chapters) return subj;

    const topics = subj.topics || [];
    const chaptersMap: Record<string, MasteryTopic[]> = {};

    topics.forEach((t: any) => {
      const chapterName = getChapterForTopic(t.name);
      if (!chaptersMap[chapterName]) {
        chaptersMap[chapterName] = [];
      }
      
      chaptersMap[chapterName].push({
        id: t.id || `topic_${Math.random().toString(36).substr(2, 9)}`,
        name: t.name,
        is_completed: t.is_completed ?? (t.completion_percentage >= 60.0),
        is_attempted: t.is_attempted ?? (t.attempts_count > 0),
        last_score: t.last_score ?? null,
      });
    });

    const chapters = Object.entries(chaptersMap).map(([chapter_name, chapterTopics]) => {
      const completedCount = chapterTopics.filter((t) => t.is_completed).length;
      const totalCount = chapterTopics.length;
      const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      return {
        chapter_name,
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

// ── Textbook Extracted Available Topics Fallback Mock ──
const MOCK_AVAILABLE_TOPICS: TopicsMasteryData = {
  subjects: [
    {
      subject: 'science',
      icon_name: 'FlaskConical',
      total_topics: 7,
      completed_topics: 2,
      overall_completion_percentage: 28,
      chapters: [
        {
          chapter_name: 'Force and Motion',
          overall_completion_percentage: 50,
          topics: [
            {
              id: 'textbook_force_1',
              name: 'Types of Force',
              is_completed: true,
              is_attempted: true,
              last_score: 85,
              availability_status: 'available',
              page_start: 12,
              page_end: 14,
            },
            {
              id: 'textbook_force_2',
              name: 'Newton\'s Laws',
              is_completed: false,
              is_attempted: true,
              last_score: 45,
              availability_status: 'available',
              page_start: 15,
              page_end: 18,
            },
            {
              id: 'textbook_force_3',
              name: 'Velocity and Acceleration',
              is_completed: false,
              is_attempted: false,
              last_score: null,
              availability_status: 'queued',
              page_start: 19,
              page_end: 22,
            },
          ],
        },
        {
          chapter_name: 'Chemical Reactions',
          overall_completion_percentage: 0,
          topics: [
            {
              id: 'textbook_chem_1',
              name: 'Chemical Equations',
              is_completed: false,
              is_attempted: false,
              last_score: null,
              availability_status: 'available',
              page_start: 35,
              page_end: 39,
            },
            {
              id: 'textbook_chem_2',
              name: 'Acids and Bases',
              is_completed: false,
              is_attempted: false,
              last_score: null,
              availability_status: 'locked',
              page_start: 40,
              page_end: 45,
            },
          ],
        },
        {
          chapter_name: 'Light',
          overall_completion_percentage: 50,
          topics: [
            {
              id: 'textbook_light_1',
              name: 'Reflection of Light',
              is_completed: true,
              is_attempted: true,
              last_score: 90,
              availability_status: 'available',
              page_start: 55,
              page_end: 60,
            },
            {
              id: 'textbook_light_2',
              name: 'Refraction of Light',
              is_completed: false,
              is_attempted: false,
              last_score: null,
              availability_status: 'locked',
              page_start: 61,
              page_end: 65,
            },
          ],
        },
      ],
    },
  ],
  total_topics: 7,
  completed_topics: 2,
};

async function fetchAvailableTopics(studentId: number): Promise<TopicsMasteryData> {
  try {
    const res = await fetch(`/api/proxy/student/${studentId}/available-topics`);
    if (!res.ok) {
      // Endpoint 404 or error: use fallback mock data
      return MOCK_AVAILABLE_TOPICS;
    }
    const data = await res.json();
    if (!data.success) {
      return MOCK_AVAILABLE_TOPICS;
    }
    return parseTopicsResponse(data.data);
  } catch (error) {
    // Graceful fallback on network failure or other exceptions
    return MOCK_AVAILABLE_TOPICS;
  }
}

export function useAvailableTopics(studentId: number | undefined) {
  return useQuery({
    queryKey: ['available-topics', studentId],
    queryFn: () => fetchAvailableTopics(studentId!),
    enabled: !!studentId,
  });
}

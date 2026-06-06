import { useQuery, useMutation } from '@tanstack/react-query';
import type { Subtopic, SubtopicPerformance, WeakSubtopic, PracticeExamRequest } from '@/lib/types/subtopic';
import type { ExamResponse } from '@/lib/types/exam';

const API_PROXY = '/api/proxy';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'API request failed');
  return data.data as T;
}

export function useSubtopics(topic?: string, classLevel: string = '8', subject: string = 'science') {
  return useQuery({
    queryKey: ['subtopics', classLevel, subject, topic],
    queryFn: () =>
      fetchJson<Subtopic[]>(
        `${API_PROXY}/curriculum/${classLevel}/${subject}/subtopics?topic=${encodeURIComponent(topic || '')}`
      ),
    enabled: !!topic,
  });
}

export function useWeakSubtopics(studentId: number, threshold: number = 60) {
  return useQuery({
    queryKey: ['weak-subtopics', studentId, threshold],
    queryFn: () =>
      fetchJson<WeakSubtopic[]>(
        `${API_PROXY}/subtopics/weak/${studentId}?threshold=${threshold}`
      ),
    enabled: !!studentId,
  });
}

export function useSubtopicPerformance(studentId: number) {
  return useQuery({
    queryKey: ['subtopic-performance', studentId],
    queryFn: () =>
      fetchJson<SubtopicPerformance[]>(
        `${API_PROXY}/subtopics/performance/${studentId}`
      ),
    enabled: !!studentId,
  });
}

export function useGeneratePracticeExam() {
  return useMutation({
    mutationFn: (payload: PracticeExamRequest) =>
      fetchJson<ExamResponse>(`${API_PROXY}/exam/practice/generate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

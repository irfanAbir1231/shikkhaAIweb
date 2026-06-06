export interface Subtopic {
  id: number;
  name: string;
  summary?: string;
  topic: string;
  chapter: string;
  subject: string;
  class_level: string;
}

export interface SubtopicPerformance {
  subtopic_id: number;
  name: string;
  attempts_count: number;
  average_score: number;
  consistency_score: number;
  last_score: number;
  mastery_score: number;
  is_mastered?: boolean;
}

export interface WeakSubtopic {
  subtopic_id: number;
  name: string;
  topic: string;
  score: number;
  reason: string;
}

export interface PracticeExamRequest {
  student_id: number;
  subject: string;
  class_level: string;
  difficulty: 'easy' | 'medium' | 'hard';
  num_questions: number;
  focus_subtopics?: number[];
  mastery_threshold?: number;
}

export interface SubtopicWeight {
  subtopic_id: number;
  name: string;
  weight_percentage: number;
  questions: number;
}

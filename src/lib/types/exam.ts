export interface Chapter {
  id: string;
  name: string;
  chapter_number?: number;
}

export interface Topic {
  id: string;
  name: string;
}

export interface ExamGenerateRequest {
  student_id: number;
  subject: string;
  chapter: string;
  topic: string;
  class_level: string;
  difficulty: 'easy' | 'medium' | 'hard';
  num_questions: number;
}

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'short_answer';
  topic: string;
  subtopic?: string;
  prompt: string;
  options: string[];
  marks: number;
  correct_answer: string;
  explanation: string;
}

export interface ExamResponse {
  exam_id: number;
  student_id: number;
  subject: string;
  topic: string;
  difficulty: string;
  source: string;
  questions: ExamQuestion[];
}

export interface AnswerSubmission {
  question_id: string;
  answer: string;
}

export interface ExamSubmitRequest {
  student_id: number;
  exam_id: number;
  answers: AnswerSubmission[];
  tab_switches: number;
}

export interface McqFeedback {
  question_id: string;
  correct: boolean;
  correct_answer: string;
  submitted_answer: string;
}

export interface ShortAnswerFeedback {
  question_id: string;
  status: string;
  feedback: string;
  awarded_marks: number;
}

export interface WeakTopic {
  topic: string;
  reason: string;
  score: number | null;
}

export interface GeneratedNote {
  id: number;
  title: string;
  content: string;
  topic: string;
  subject: string;
  class_level: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface ExamSubmitResponse {
  attempt_id: number;
  student_id: number;
  exam_id: number;
  score_percentage: number;
  mcq_correct: number;
  mcq_total: number;
  weak_topics: WeakTopic[];
  readiness_score: number;
  short_answer_feedback: ShortAnswerFeedback[];
  mcq_feedback: McqFeedback[];
  generated_notes: GeneratedNote[];
}

export interface ExamSummaryResponse {
  exam_id: number;
  student_id: number;
  subject: string;
  topic: string;
  difficulty: string;
  num_questions: number;
  source: string;
  created_at: string;
}

export interface AttemptResponse {
  attempt_id: number;
  exam_id: number;
  student_id: number;
  score_percentage: number;
  mcq_correct: number;
  mcq_total: number;
  readiness_score: number;
  weak_topics: WeakTopic[];
  short_answer_feedback: ShortAnswerFeedback[];
  created_at: string;
}

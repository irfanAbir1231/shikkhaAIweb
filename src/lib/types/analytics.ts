export interface ReadinessData {
  overall: number;
  trend: number;
  breakdown: Record<string, number>;
}

export interface WeakSubject {
  name: string;
  accuracy: number;
  color: string;
  icon: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  weekly_activity: boolean[];
  last_study_date: string | null;
}

export interface ImprovementPoint {
  week: string;
  score: number;
}

export interface TopicAccuracy {
  topic: string;
  accuracy: number;
  total_questions: number;
}

export interface RecentQuiz {
  id: string;
  title: string;
  subject: string;
  score: number;
  total: number;
  date: string;
  time_taken: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
}

export interface DashboardData {
  readiness: ReadinessData;
  weak_subjects: WeakSubject[];
  streak: StreakData;
  improvement: ImprovementPoint[];
  topic_accuracy: TopicAccuracy[];
  recent_quizzes: RecentQuiz[];
  recommendations: Recommendation[];
}

export interface TopicAccuracyDetail {
  topic: string;
  chapter: string;
  subject: string;
  accuracy: number;
  total_questions: number;
  correct_answers: number;
  trend: number;
  last_attempted: string;
}

export interface WeakChapter {
  chapter_name: string;
  subject: string;
  accuracy: number;
  weakness_rank: number;
  related_topics: string[];
  suggested_action: string;
  trend: number;
  time_spent_minutes: number;
}

export interface ImprovementHistoryPoint {
  date: string;
  overall_score: number;
  topic_scores: Record<string, number>;
  exam_id: number;
}

export interface DailyActivity {
  date: string;
  is_active: boolean;
  performance_score: number;
  questions_answered: number;
  study_minutes: number;
}

export interface AnalyticsStreakData {
  current_streak: number;
  longest_streak: number;
  last_30_days: DailyActivity[];
}

export interface PracticeSuggestion {
  id: string;
  title: string;
  description: string;
  topic: string;
  type: string;
  difficulty: string;
  estimated_minutes: number;
  potential_impact: number;
  subject: string;
  note_id: string | null;
}

export interface SubtopicAccuracyDetail {
  subtopic_id: number;
  name: string;
  topic: string;
  chapter: string;
  subject: string;
  accuracy: number;
  total_questions: number;
  correct_answers: number;
  trend: number;
  last_attempted: string | null;
  is_mastered: boolean;
}

export interface AnalyticsData {
  topic_accuracy: TopicAccuracyDetail[];
  weak_chapters: WeakChapter[];
  improvement_history: ImprovementHistoryPoint[];
  streak_data: AnalyticsStreakData;
  practice_suggestions: PracticeSuggestion[];
  average_accuracy: number;
  total_questions_attempted: number;
  total_study_minutes: number;
  subtopic_accuracy: SubtopicAccuracyDetail[];
  weak_subtopics: SubtopicAccuracyDetail[];
  mastered_subtopics: SubtopicAccuracyDetail[];
}

export interface TopicItem {
  id: string;
  name: string;
  completion_percentage: number;
  attempts_count: number;
  last_score: number | null;
  last_attempted: string | null;
  is_completed: boolean;
}

export interface SubjectTopics {
  subject: string;
  icon_name: string;
  total_topics: number;
  completed_topics: number;
  overall_completion_percentage: number;
  topics: TopicItem[];
}

export interface TopicsData {
  subjects: SubjectTopics[];
  total_topics: number;
  completed_topics: number;
}

// ── Topics Mastery Dashboard (nested: Subject → Chapter → Topic) ──

export interface MasteryTopic {
  id: string;
  name: string;
  chapter?: string;
  chapter_number?: number;
  completion_percentage: number;
  attempts_count: number;
  is_completed: boolean;
  is_attempted: boolean;
  is_weak: boolean;
  last_score: number | null;
  weak_subtopic_ids: number[];
  availability_status?: 'available' | 'locked' | 'queued';
  page_start?: number;
  page_end?: number;
}

export interface MasteryChapter {
  chapter_name: string;
  chapter_number?: number;
  overall_completion_percentage: number;
  topics: MasteryTopic[];
}

export interface MasterySubject {
  subject: string;
  icon_name?: string;
  total_topics: number;
  completed_topics: number;
  overall_completion_percentage: number;
  chapters: MasteryChapter[];
}

export interface TopicsMasteryData {
  subjects: MasterySubject[];
  total_topics: number;
  completed_topics: number;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const GRADE_LEVELS = ['8'];

export const SUBJECTS = [
  'science',
  'history',
  'geography',
  'physics',
  'chemistry',
  'biology',
];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const EXPLANATION_MODES = [
  { value: 'simple', label: 'Simple' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'examStyle', label: 'Exam-style' },
  { value: 'bengali', label: 'Bengali' },
] as const;

export const SUBJECT_ICONS: Record<string, string> = {
  science: 'FlaskConical',
  math: 'Calculator',
  mathematics: 'Calculator',
  english: 'Languages',
  bangla: 'BookOpen',
  history: 'Landmark',
  geography: 'Globe',
  physics: 'Zap',
  chemistry: 'Atom',
  biology: 'Dna',
};

export const SUBJECT_COLORS = [
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
];

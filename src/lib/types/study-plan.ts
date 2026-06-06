export type TaskType = 'study' | 'practice' | 'review' | 'break';

export interface StudyPlanTask {
  id: string;
  day: number;
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  completed: boolean;
  type: TaskType;
}

export interface StudyPlan {
  id: string;
  student_id: number;
  title: string;
  subject: string;
  goal: string;
  topics: string[];
  class_level: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_hours: number;
  tasks: StudyPlanTask[];
  progress: number;
  created_at: string;
}

export interface PlanSelection {
  id: string;
  subject: string;
  chapter?: string;
  chapterName?: string;
  topic?: string;
}

export interface StudyPlanGenerateInput {
  selections: PlanSelection[];
  goal: string;
  deadline: string;
  daily_hours: number;
  class_level: string;
}

export interface DailySchedule {
  day: number;
  date: string;
  tasks: StudyPlanTask[];
}

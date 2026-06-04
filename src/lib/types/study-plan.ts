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

export interface StudyPlanGenerateInput {
  subject: string;
  topics: string[];
  goal: string;
  total_days: number;
  daily_hours: number;
  class_level: string;
}

export interface DailySchedule {
  day: number;
  date: string;
  tasks: StudyPlanTask[];
}

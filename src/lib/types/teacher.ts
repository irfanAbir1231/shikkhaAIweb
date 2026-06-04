export interface TopicHeatmapData {
  topic: string;
  weak_students: number;
  total_students: number;
}

export interface StudentMetrics {
  student_id: number;
  student_name: string;
  overall_readiness_score: number;
  weakest_topics: string[];
}

export interface ClassroomDashboardResponse {
  classroom_id: string;
  classroom_name: string;
  subject: string;
  class_level: string;
  total_students: number;
  average_readiness_score: number;
  topic_performance: TopicHeatmapData[];
  students: StudentMetrics[];
}

export interface TeacherClassroom {
  id: string;
  name: string;
  subject: string;
  class_level: string;
  student_count: number;
}

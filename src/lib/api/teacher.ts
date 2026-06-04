'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ClassroomDashboardResponse,
  TeacherClassroom,
} from '@/lib/types/teacher';
import { ApiResponse } from '@/lib/types/auth';

/* ------------------------------------------------------------------ */
/*  Raw fetchers                                                       */
/* ------------------------------------------------------------------ */

async function fetchTeacherClassrooms(): Promise<TeacherClassroom[]> {
  const res = await fetch('/api/proxy/teacher/classrooms');
  const data: ApiResponse<TeacherClassroom[]> = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch classrooms');
  }
  return data.data;
}

async function fetchClassroomDashboard(
  classroomId: string
): Promise<ClassroomDashboardResponse> {
  const res = await fetch(
    `/api/proxy/teacher/classrooms/${classroomId}/dashboard`
  );
  const data: ApiResponse<ClassroomDashboardResponse> = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch dashboard');
  }
  return data.data;
}

/* ------------------------------------------------------------------ */
/*  React Query hooks                                                  */
/* ------------------------------------------------------------------ */

export function useTeacherClassrooms() {
  return useQuery({
    queryKey: ['teacher-classrooms'],
    queryFn: fetchTeacherClassrooms,
  });
}

export function useClassroomDashboard(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['classroom-dashboard', classroomId],
    queryFn: () => fetchClassroomDashboard(classroomId!),
    enabled: !!classroomId,
  });
}

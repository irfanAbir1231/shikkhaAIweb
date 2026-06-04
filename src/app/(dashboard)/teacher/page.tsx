'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useTeacherClassrooms,
  useClassroomDashboard,
} from '@/lib/api/teacher';
import { ClassroomHeatmap } from '@/components/teacher/classroom-heatmap';
import { StudentPerformanceTable } from '@/components/teacher/student-performance-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';

export default function TeacherPage() {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');

  const {
    data: classrooms,
    isLoading: classroomsLoading,
    error: classroomsError,
  } = useTeacherClassrooms();

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useClassroomDashboard(selectedClassroomId || undefined);

  /* Auto-select first classroom once list loads */
  useEffect(() => {
    if (classrooms && classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  /* Surface errors via toast */
  useEffect(() => {
    if (classroomsError) {
      toast.error(classroomsError.message || 'Failed to load classrooms');
    }
  }, [classroomsError]);

  useEffect(() => {
    if (dashboardError) {
      toast.error(dashboardError.message || 'Failed to load dashboard');
    }
  }, [dashboardError]);

  const isLoading = classroomsLoading || dashboardLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Intelligence</h1>
          <p className="text-muted-foreground">
            Classroom performance, topic heatmaps, and student drill-downs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {classroomsLoading ? (
            <Skeleton className="h-10 w-56" />
          ) : classroomsError || !classrooms || classrooms.length === 0 ? (
            <Badge variant="outline" className="h-10 px-3">
              <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" />
              No classrooms found
            </Badge>
          ) : (
            <Select
              value={selectedClassroomId}
              onValueChange={(v) => v && setSelectedClassroomId(v)}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a classroom" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} &middot; {c.subject} &middot; Class {c.class_level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchDashboard()}
            disabled={!selectedClassroomId || dashboardLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Error state for dashboard */}
      {dashboardError && !dashboardLoading && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">
              Could not load dashboard data
            </p>
            <p className="text-sm text-red-600 mt-1">
              {dashboardError.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetchDashboard()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !dashboard ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={String(dashboard.total_students)}
              icon={Users}
              color="text-blue-500"
            />
            <StatCard
              title="Avg Readiness"
              value={`${dashboard.average_readiness_score.toFixed(1)}%`}
              icon={TrendingUp}
              color="text-emerald-500"
            />
            <StatCard
              title="Subject"
              value={dashboard.subject}
              icon={BookOpen}
              color="text-violet-500"
            />
            <StatCard
              title="Class Level"
              value={dashboard.class_level}
              icon={GraduationCap}
              color="text-amber-500"
            />
          </>
        )}
      </div>

      {/* Weak-Topic Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Weak-Topic Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomHeatmap
            topics={dashboard?.topic_performance}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Student Drill-Down
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentPerformanceTable
            students={dashboard?.students}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card sub-component                                            */
/* ------------------------------------------------------------------ */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

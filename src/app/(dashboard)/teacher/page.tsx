'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function TeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage classrooms and student progress</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Teacher Dashboard coming soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will include classroom management, student performance heatmaps, and assignment tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function StudyPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Plan</h1>
        <p className="text-muted-foreground">AI-generated study schedules</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Study Plan feature coming soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will help you create personalized study schedules based on your exam dates and weak topics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

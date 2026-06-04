'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function FocusSessionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Focus Session</h1>
        <p className="text-muted-foreground">Pomodoro-style study sessions</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Focus Session feature coming soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will include a Pomodoro timer, plant growth gamification, and anti-cheat tab detection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

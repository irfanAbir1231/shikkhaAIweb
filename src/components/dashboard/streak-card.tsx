'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';
import { StreakData } from '@/lib/types/analytics';

interface StreakCardProps {
  data: StreakData;
}

export function StreakCard({ data }: StreakCardProps) {
  const { current_streak, longest_streak, weekly_activity } = data;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Study Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{current_streak}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{longest_streak}</div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          {days.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  weekly_activity?.[index]
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {day}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

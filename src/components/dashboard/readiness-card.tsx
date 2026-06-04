'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReadinessData } from '@/lib/types/analytics';
import { getGradeColor } from '@/lib/utils/formatters';

interface ReadinessCardProps {
  data: ReadinessData;
}

export function ReadinessCard({ data }: ReadinessCardProps) {
  const { overall, trend, breakdown } = data;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Readiness Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold" style={{ color: getGradeColor(overall) }}>
              {overall.toFixed(1)}%
            </div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs last</span>
            </div>
          </div>
        </div>

        <Progress value={overall} className="h-2" />

        {Object.entries(breakdown).length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="text-center p-2 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{value.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{key}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

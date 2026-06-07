'use client';

import { useId } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  color?: string;
}

export function SimpleLineChart({ data, color = 'var(--chart-1)' }: SimpleLineChartProps) {
  const uid = useId().replace(/:/g, '');
  const fillId = `lineFill-${uid}`;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'hsl(var(--foreground))',
            fontSize: '13px',
            boxShadow:
              '0 8px 30px -8px color-mix(in oklch, var(--primary) 30%, transparent)',
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill={`url(#${fillId})`}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{
            fill: color,
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
            r: 4,
          }}
          activeDot={{
            r: 6,
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

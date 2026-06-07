'use client';

import { useId } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  color?: string;
}

export function SimpleBarChart({ data, color = 'var(--chart-1)' }: SimpleBarChartProps) {
  const uid = useId().replace(/:/g, '');
  const fillId = `barFill-${uid}`;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" barSize={20} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <stop offset="100%" stopColor={color} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
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
        <Bar dataKey="value" fill={`url(#${fillId})`} radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

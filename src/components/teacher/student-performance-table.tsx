'use client';

import { useMemo, useState } from 'react';
import { StudentMetrics } from '@/lib/types/teacher';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface StudentPerformanceTableProps {
  students: StudentMetrics[] | undefined;
  isLoading: boolean;
}

type SortKey = 'name' | 'readiness';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

function getReadinessColor(score: number): string {
  if (score >= 75) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/60" />;
  return direction === 'asc' ? (
    <ArrowUp className="w-3.5 h-3.5 text-primary" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-primary" />
  );
}

export function StudentPerformanceTable({
  students,
  isLoading,
}: StudentPerformanceTableProps) {
  const [sort, setSort] = useState<SortConfig>({
    key: 'readiness',
    direction: 'asc',
  });

  const sortedStudents = useMemo(() => {
    if (!students) return [];
    const list = [...students];
    list.sort((a, b) => {
      if (sort.key === 'name') {
        return sort.direction === 'asc'
          ? a.student_name.localeCompare(b.student_name)
          : b.student_name.localeCompare(a.student_name);
      }
      if (sort.key === 'readiness') {
        return sort.direction === 'asc'
          ? a.overall_readiness_score - b.overall_readiness_score
          : b.overall_readiness_score - a.overall_readiness_score;
      }
      return 0;
    });
    return list;
  }, [students, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground text-sm">
          No student data available for this classroom.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 gap-1 font-medium"
                onClick={() => toggleSort('name')}
              >
                Student Name
                <SortIndicator
                  active={sort.key === 'name'}
                  direction={sort.direction}
                />
              </Button>
            </TableHead>
            <TableHead className="w-[180px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 gap-1 font-medium"
                onClick={() => toggleSort('readiness')}
              >
                Readiness Score
                <SortIndicator
                  active={sort.key === 'readiness'}
                  direction={sort.direction}
                />
              </Button>
            </TableHead>
            <TableHead>Top 2 Weakest Topics</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStudents.map((student) => {
            const topWeak = student.weakest_topics.slice(0, 2);
            const score = student.overall_readiness_score;

            return (
              <TableRow key={student.student_id}>
                <TableCell className="font-medium">
                  {student.student_name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getReadinessColor(score)} font-semibold`}
                  >
                    {score.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {topWeak.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {topWeak.map((topic) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No weak topics identified
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

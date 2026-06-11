'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/lib/stores/exam-store';
import { AILoader } from '@/components/ui/ai-loader';

export default function ExamResultIndexPage() {
  const router = useRouter();
  const { lastResult, isDemo, hasHydrated } = useExamStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (isDemo) {
      router.replace('/exam/result/demo');
      return;
    }

    if (lastResult?.exam_id) {
      router.replace(`/exam/result/${lastResult.exam_id}`);
      return;
    }

    // No result available — send the user somewhere useful
    router.replace('/exam/history');
  }, [hasHydrated, isDemo, lastResult, router]);

  return (
    <div className="relative flex items-center justify-center min-h-[60vh]">
      <AILoader label="Loading your result…" />
    </div>
  );
}

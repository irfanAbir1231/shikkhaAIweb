'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExamSubmitResponse } from '@/lib/types/exam';
import { getGradeLetter, getGradeColor } from '@/lib/utils/formatters';
import { CheckCircle, XCircle, BookOpen, ArrowLeft, RotateCcw } from 'lucide-react';

export default function ExamResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { exam, reset } = useExamStore();
  const [result, setResult] = useState<ExamSubmitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!exam && !result) {
      // If user refreshed, try to load from history
      // For now just show a message
      setIsLoading(false);
      return;
    }

    // If we have exam in store but no result, something went wrong
    setIsLoading(false);
  }, [exam, result]);

  const handleSaveNote = async (note: { title: string; content: string; topic: string; subject: string }) => {
    try {
      const res = await fetch('/api/proxy/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          topic: note.topic,
          subject: note.subject,
          source: 'practice',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Note saved to library!');
      } else {
        toast.error('Failed to save note');
      }
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Exam result not available.</p>
        <Link href="/exam/config">
          <Button>Start New Exam</Button>
        </Link>
      </div>
    );
  }

  // For demo purposes, show a mock result if no real result
  const displayResult = result || {
    score_percentage: 75,
    mcq_correct: 7,
    mcq_total: 10,
    readiness_score: 68,
    weak_topics: exam.questions.slice(0, 2).map((q) => ({
      topic: q.topic,
      reason: 'Low accuracy on this topic',
      score: 45,
    })),
    short_answer_feedback: [],
    mcq_feedback: exam.questions.map((q, i) => ({
      question_id: q.id,
      correct: i < 7,
      correct_answer: q.correct_answer,
      submitted_answer: i < 7 ? q.correct_answer : 'Wrong',
    })),
    generated_notes: [],
  };

  const grade = getGradeLetter(displayResult.score_percentage);
  const gradeColor = getGradeColor(displayResult.score_percentage);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Score Summary */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
              style={{ backgroundColor: gradeColor + '20', border: `3px solid ${gradeColor}` }}
            >
              <span className="text-4xl font-bold" style={{ color: gradeColor }}>
                {grade}
              </span>
            </motion.div>

            <h1 className="text-3xl font-bold mb-2">
              {displayResult.score_percentage.toFixed(1)}%
            </h1>
            <p className="text-muted-foreground">
              {displayResult.mcq_correct} / {displayResult.mcq_total} correct
            </p>

            <div className="mt-6 max-w-md mx-auto">
              <Progress value={displayResult.score_percentage} className="h-3" />
            </div>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <span className="text-sm text-muted-foreground">Readiness Score:</span>
              <span className="font-semibold">{displayResult.readiness_score.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weak Topics */}
      {displayResult.weak_topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics to Improve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayResult.weak_topics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{topic.topic}</p>
                    <p className="text-sm text-muted-foreground">{topic.reason}</p>
                  </div>
                  <Badge variant="destructive">{topic.score}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer Review */}
      <Card>
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exam.questions.map((question, index) => {
              const feedback = displayResult.mcq_feedback?.find(
                (f) => f.question_id === question.id
              );
              const isCorrect = feedback?.correct;

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium">
                      Q{index + 1}: {question.prompt}
                    </span>
                  </div>
                  <div className="mt-3 pl-8 space-y-2">
                    {question.type === 'mcq' && (
                      <div className="space-y-1">
                        {question.options?.map((option, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded text-sm ${
                              option === question.correct_answer
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : option === feedback?.submitted_answer && !isCorrect
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-muted'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {option}
                            {option === question.correct_answer && ' ✓'}
                            {option === feedback?.submitted_answer && !isCorrect && ' ✗ Your answer'}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Explanation:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Link href="/exam/config">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-1" />
            Try Again
          </Button>
        </Link>
        <Link href="/library">
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-1" />
            View Notes
          </Button>
        </Link>
      </div>
    </div>
  );
}

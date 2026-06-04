'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExamSessionProtector } from '@/components/exam/exam-session-protector';
import { formatDuration } from '@/lib/utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  Send,
} from 'lucide-react';

export default function ExamSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    exam,
    answers,
    currentQuestionIndex,
    timeRemaining,
    isSubmitted,
    tabSwitchCount,
    isTimerPaused,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    decrementTimer,
    submitExam,
  } = useExamStore();

  // Redirect if no exam loaded
  useEffect(() => {
    if (!exam) {
      router.push('/exam/config');
    }
  }, [exam, router]);

  // Timer — pauses when a tab-switch warning is active
  useEffect(() => {
    if (!exam || isSubmitted) return;
    const interval = setInterval(() => {
      if (!isTimerPaused) {
        decrementTimer();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, isSubmitted, isTimerPaused, decrementTimer]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted]);

  const handleSubmit = async () => {
    if (!exam || !user || isSubmitted) return;
    submitExam();

    const answersArray = Object.entries(answers).map(([question_id, answer]) => ({
      question_id,
      answer,
    }));

    try {
      const res = await fetch('/api/proxy/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          exam_id: exam.exam_id,
          answers: answersArray,
          tab_switches: tabSwitchCount,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Submission failed');
        return;
      }

      toast.success(`Exam submitted! Score: ${result.data.score_percentage.toFixed(1)}%`);
      router.push(`/exam/result/${exam.exam_id}`);
    } catch (error) {
      toast.error('Failed to submit exam');
    }
  };

  if (!exam) return null;

  const question = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <ExamSessionProtector onAutoSubmit={handleSubmit} enabled={!isSubmitted}>
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            {exam.subject} — {exam.topic}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`text-lg font-mono font-bold ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : ''}`}>
            {formatDuration(timeRemaining)}
          </div>
          <Button variant="destructive" size="sm" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-1" />
            Submit
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
        />
      </div>

      {/* Tab switch warning */}
      {tabSwitchCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 px-4 py-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">
            Tab switches: {tabSwitchCount}/3 {tabSwitchCount >= 2 && '(Auto-submit on next)'}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </span>
                <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full uppercase">
                  {question.type}
                </span>
                <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full">
                  {question.marks} mark{question.marks > 1 ? 's' : ''}
                </span>
              </div>

              <h2 className="text-xl font-medium mb-6">{question.prompt}</h2>

              {question.type === 'mcq' && question.options && (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => setAnswer(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setAnswer(question.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'short_answer' && (
                <Textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[200px]"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="max-w-3xl mx-auto mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button onClick={handleSubmit} variant="default">
                Submit Exam
                <Send className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Grid Sidebar */}
        <aside className="hidden lg:block w-64 border-l bg-muted/30 p-4 overflow-auto">
          <h3 className="font-medium mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isAnswered
                      ? 'bg-green-500 text-white'
                      : 'bg-background border hover:bg-muted'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border bg-background" />
              <span>Not answered</span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-background rounded-lg">
            <div className="text-sm font-medium">Progress</div>
            <div className="text-2xl font-bold mt-1">
              {answeredCount}/{exam.questions.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((answeredCount / exam.questions.length) * 100)}% completed
            </div>
          </div>
        </aside>
      </div>
    </div>
    </ExamSessionProtector>
  );
}

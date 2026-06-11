'use client';

import { useEffect, useState, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { useFocusGardenStore } from '@/lib/stores/focus-garden-store';
import { getDemoResultForAnswers } from '@/lib/mock-exam';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AILoader } from '@/components/ui/ai-loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ExamSessionProtector } from '@/components/exam/exam-session-protector';
import { formatDuration } from '@/lib/utils/formatters';
import { useQueryClient } from '@tanstack/react-query';
import { AIBackground } from '@/components/background/ai-background';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Shield,
  ShieldAlert,
  Check,
  AlertTriangle,
  BookOpen,
  TreeDeciduous,
  Skull,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Timer ring — animates on value change (unlike whileInView version) */
/* ------------------------------------------------------------------ */
function TimerRing({
  value,
  size = 44,
  strokeWidth = 4,
  isLowTime,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  isLowTime?: boolean;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const gradId = useId();

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-from)" />
          <stop offset="50%" stopColor="var(--brand-via)" />
          <stop offset="100%" stopColor="var(--brand-to)" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isLowTime ? 'var(--destructive)' : `url(#${gradId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Garden sidebar card                                               */
/* ------------------------------------------------------------------ */
function GardenSidebarCard() {
  const profile = useFocusGardenStore((s) => s.profile);
  const liveCount = profile.plants.filter((p) => !p.withered).length;
  const deadCount = profile.plants.filter((p) => p.withered).length;

  return (
    <div className="mt-6 p-4 rounded-xl bg-card/60 border border-border/50">
      <div className="text-xs font-medium text-muted-foreground mb-2">Focus Garden</div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <TreeDeciduous className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{liveCount}</span>
          <span className="text-[10px] text-muted-foreground">live</span>
        </div>
        {deadCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Skull className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">{deadCount}</span>
            <span className="text-[10px] text-muted-foreground">withered</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        Complete exams without tab switches to grow trees. Trees wither if you switch tabs during exams.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function stripOptionPrefix(option: string): string {
  let cleaned = option.trim();
  while (/^[A-D][\.\)\-]\s*/.test(cleaned)) {
    cleaned = cleaned.replace(/^[A-D][\.\)\-]\s*/, '').trim();
  }
  return cleaned;
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function ExamSessionPage({ params }: { params: { id: string } }) {
  void params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const reduce = useReducedMotion();
  const { user } = useAuthStore();
  const {
    exam,
    answers,
    currentQuestionIndex,
    timeRemaining,
    isSubmitted,
    tabSwitchCount,
    isTimerPaused,
    isDemo,
    hasHydrated,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    decrementTimer,
    submitExam,
    setLastResult,
  } = useExamStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* --------------------------- Handlers --------------------------- */

  /* Core submission — no React setState, safe to call from effects */
  const runSubmission = async () => {
    if (!exam || (!user && !isDemo) || isSubmitted) return;
    submitExam();

    // Demo mode: skip backend and generate mock results
    if (isDemo) {
      const result = getDemoResultForAnswers(answers);
      setLastResult(result);
      toast.success(`Demo exam submitted! Score: ${result.score_percentage.toFixed(1)}%`);
      router.push('/exam/result/demo');
      return;
    }

    const answersArray = Object.entries(answers).map(([question_id, answer]) => ({
      question_id,
      answer,
    }));

    if (!user) return;

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

      setLastResult(result.data);

      // Auto-award tree if student had no integrity violations
      if (tabSwitchCount === 0) {
        useFocusGardenStore.getState().awardExamTree(exam.topic);
        toast.success('You earned a Scholar Tree for completing the exam!');
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['topics-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['weak-subtopics'] });
      queryClient.invalidateQueries({ queryKey: ['attempts'] });

      toast.success(`Exam submitted! Score: ${result.data.score_percentage.toFixed(1)}%`);
      router.push(`/exam/result/${exam.exam_id}`);
    } catch {
      toast.error('Failed to submit exam');
    }
  };

  const runSubmissionRef = useRef(runSubmission);
  const questionScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runSubmissionRef.current = runSubmission;
  });

  /* Scroll question area to top whenever question changes */
  useEffect(() => {
    questionScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await runSubmission();
    setIsSubmitting(false);
  };

  /* --------------------------- Effects ---------------------------- */

  useEffect(() => {
    if (hasHydrated && !exam) {
      router.push('/exam/config');
    }
  }, [exam, hasHydrated, router]);

  useEffect(() => {
    if (!exam || isSubmitted) return;
    const interval = setInterval(() => {
      if (!isTimerPaused) {
        decrementTimer();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, isSubmitted, isTimerPaused, decrementTimer]);

  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted) {
      runSubmissionRef.current();
    }
  }, [timeRemaining, isSubmitted]);

  /* --------------------------- Render ----------------------------- */

  if (!hasHydrated || !exam) {
    return (
      <div className="relative flex items-center justify-center min-h-[60vh]">
        <AILoader label="Loading exam session…" />
      </div>
    );
  }

  const question = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / exam.questions.length) * 100);
  const totalTime = exam.questions.length * 2 * 60;
  const timerPercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isLowTime = timeRemaining < 60;

  return (
    <ExamSessionProtector onAutoSubmit={handleSubmit} enabled={!isSubmitted}>
      <div className="relative flex flex-col h-[calc(100dvh-3.5rem)] -m-4 lg:-m-8 overflow-hidden">
        {/* Dimmed ambient background */}
        <div className="absolute inset-0 -z-10 opacity-25 pointer-events-none">
          <AIBackground />
        </div>

        {/* ---------- Header ---------- */}
        <header className="relative h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-3 lg:px-5 shrink-0 overflow-hidden">
          {/* Left — Title */}
          <div className="flex items-center gap-2 min-w-0 shrink-0 max-w-[35%] sm:max-w-[30%]">
            <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{exam.subject}</h1>
              <p className="text-[11px] text-muted-foreground truncate hidden sm:block">{exam.topic}</p>
            </div>
          </div>

          {/* Center — Progress */}
          <div className="flex-1 min-w-0 max-w-[7rem] sm:max-w-[9rem] md:max-w-[12rem] lg:max-w-[14rem] mx-2 lg:mx-4 hidden sm:block">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
              <span className="text-muted-foreground hidden md:inline">
                {answeredCount} of {exam.questions.length} answered
              </span>
              <span className="text-muted-foreground md:hidden">
                {answeredCount}/{exam.questions.length}
              </span>
              <span className="font-medium tabular-nums">{progressPercent}%</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-brand-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Right — Timer + Integrity + Submit */}
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-2.5 shrink-0" data-tour="session-timer">
            {/* Desktop timer ring */}
            <div className="hidden sm:flex items-center gap-1">
              <TimerRing value={timerPercent} isLowTime={isLowTime} size={28} />
              <div className={cn('text-[11px] font-mono font-bold tabular-nums leading-none', isLowTime && 'text-red-500')}>
                {formatDuration(timeRemaining)}
              </div>
            </div>

            {/* Mobile timer text */}
            <div className={cn('sm:hidden text-xs font-mono font-bold tabular-nums', isLowTime && 'text-red-500 animate-pulse')}>
              {formatDuration(timeRemaining)}
            </div>

            {/* Integrity indicator */}
            <div className="hidden lg:flex">
              {tabSwitchCount === 0 ? (
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400" title="Exam secure">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-500 animate-pulse" title={`${tabSwitchCount}/3 tab switches`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="tabular-nums text-[11px]">{tabSwitchCount}/3</span>
                </div>
              )}
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
              disabled={isSubmitting}
              className="h-7 px-2 md:px-2.5"
              data-tour="session-submit"
            >
              <Send className="w-3.5 h-3.5 md:mr-1" />
              <span className="hidden md:inline text-xs">Submit</span>
            </Button>
          </div>
        </header>

        {/* ---------- Tab-switch warning ---------- */}
        {tabSwitchCount > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 text-xs shrink-0" data-tour="session-tab-warning">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Tab switches: {tabSwitchCount}/3 {tabSwitchCount >= 2 && '— auto-submit on next offense'}
            </span>
          </div>
        )}

        {/* ---------- Mobile progress strip ---------- */}
        <div className="md:hidden h-1 bg-muted shrink-0">
          <motion.div
            className="h-full bg-brand-gradient"
            animate={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.3 }}
          />
        </div>

        {/* ---------- Mobile question navigator ---------- */}
        <div className="lg:hidden border-b bg-background/60 backdrop-blur-sm shrink-0">
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide">
            {exam.questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    'shrink-0 h-8 w-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center',
                    isCurrent
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                      : isAnswered
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted/50 text-muted-foreground border border-border/50'
                  )}
                >
                  {isAnswered ? <Check className="w-3 h-3" /> : index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Main content ---------- */}
        <div className="flex-1 flex overflow-hidden">
          {/* Question area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable question card */}
            <div ref={questionScrollRef} className="flex-1 overflow-auto p-4 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  transition={{ duration: reduce ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-3xl mx-auto"
                >
                  <Card variant="glass" className="p-6 lg:p-10 border-0 shadow-soft">
                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                        Question {currentQuestionIndex + 1} of {exam.questions.length}
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-muted uppercase tracking-wider text-muted-foreground">
                        {question.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        {question.marks} mark{question.marks > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Prompt */}
                    <h2 className="text-xl lg:text-2xl font-medium leading-relaxed mb-8 text-foreground">
                      {question.prompt}
                    </h2>

                    {/* MCQ options */}
                    {question.type === 'mcq' && question.options && (
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onValueChange={(value) => setAnswer(question.id, value)}
                        className="space-y-3"
                      >
                        {question.options.map((option, index) => {
                          const isSelected = answers[question.id] === option;
                          return (
                            <motion.div
                              key={`${question.id}-${index}`}
                              whileTap={reduce ? undefined : { scale: 0.98 }}
                              className={cn(
                                'group relative flex items-start gap-4 p-4 lg:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border/40 bg-card/20 hover:border-primary/25 hover:bg-muted/15 hover:-translate-y-0.5 hover:shadow-soft'
                              )}
                              onClick={() => setAnswer(question.id, option)}
                            >
                              <RadioGroupItem
                                value={option}
                                id={`opt-${question.id}-${index}`}
                                className="mt-0.5 shrink-0"
                              />
                              <Label
                                htmlFor={`opt-${question.id}-${index}`}
                                className="flex-1 cursor-pointer text-sm lg:text-base leading-relaxed"
                              >
                                <span
                                  className={cn(
                                    'font-semibold mr-2',
                                    isSelected ? 'text-primary' : 'text-muted-foreground'
                                  )}
                                >
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                {stripOptionPrefix(option)}
                              </Label>
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={reduce ? undefined : { scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={reduce ? undefined : { scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="mt-0.5 shrink-0"
                                  >
                                    <Check className="w-4 h-4 text-primary" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </RadioGroup>
                    )}

                    {/* Short answer */}
                    {question.type === 'short_answer' && (
                      <Textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => setAnswer(question.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[120px] text-base leading-relaxed bg-card/30 border-border/50 focus-visible:border-primary focus-visible:ring-primary/20 transition-all resize-y"
                      />
                    )}
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fixed Prev / Next button bar */}
            <div className="shrink-0 border-t bg-background/80 backdrop-blur-md px-4 lg:px-8 py-4">
              <div className="max-w-3xl mx-auto flex justify-between items-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    variant="gradient"
                    size="lg"
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    <span className="hidden sm:inline">Submit Exam</span>
                    <span className="sm:hidden">Submit</span>
                    <Send className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} size="lg" className="gap-2">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Desktop sidebar navigator ---------- */}
          <aside className="hidden lg:flex w-72 flex-col border-l bg-background/50 backdrop-blur-sm overflow-auto shrink-0">
            <div className="p-5">
              <h3 className="text-sm font-semibold mb-4">Question Navigator</h3>

              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((q, index) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <motion.button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      whileTap={reduce ? undefined : { scale: 0.92 }}
                      className={cn(
                        'h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center',
                        isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                          : isAnswered
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-card/60 text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground'
                      )}
                    >
                      {isAnswered ? <Check className="w-3.5 h-3.5" /> : index + 1}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded border border-border/50 bg-card/60" />
                  <span className="text-muted-foreground">Not answered</span>
                </div>
              </div>

              {/* Progress card */}
              <div className="mt-6 p-4 rounded-xl bg-card/60 border border-border/50">
                <div className="text-xs font-medium text-muted-foreground mb-1">Progress</div>
                <div className="text-3xl font-bold tabular-nums">
                  {answeredCount}
                  <span className="text-lg text-muted-foreground font-normal">/{exam.questions.length}</span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">{progressPercent}% completed</div>
              </div>

              {/* Focus Garden card */}
              <GardenSidebarCard />

              {/* Integrity sidebar notice */}
              {tabSwitchCount > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{tabSwitchCount}/3 tab switches</span>
                  </div>
                  {tabSwitchCount >= 2 && (
                    <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-500">
                      One more will auto-submit your exam
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ---------- Submit confirmation dialog ---------- */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ready to Submit?</DialogTitle>
              <DialogDescription>
                You have answered <strong>{answeredCount}</strong> of <strong>{exam.questions.length}</strong>{' '}
                questions.
                {answeredCount < exam.questions.length && (
                  <span className="block mt-1 text-amber-500 font-medium">
                    {exam.questions.length - answeredCount} unanswered — submit anyway?
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {isSubmitting ? (
              <div className="py-10">
                <AILoader label="Evaluating your answers…" />
              </div>
            ) : (
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  Keep Working
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => {
                    setShowSubmitDialog(false);
                    handleSubmit();
                  }}
                >
                  Submit Exam
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ExamSessionProtector>
  );
}

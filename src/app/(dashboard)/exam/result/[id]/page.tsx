'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion, useMotionValue, animate } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { AIBackground } from '@/components/background/ai-background';
import { ExamSubmitResponse, GeneratedNote, AttemptResponse, ExamResponse, McqFeedback } from '@/lib/types/exam';
import { getGradeLetter, getGradeColor } from '@/lib/utils/formatters';
import { useSaveNote } from '@/lib/api/notes';
import {
  CheckCircle, XCircle, BookOpen, ArrowLeft, RotateCcw, Target, Layers,
  Save, Bookmark, FileText, ChevronRight, BookMarked, TrendingUp, TrendingDown,
  Zap, Award, BarChart3, Lightbulb, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ========================================================================
   Count-up hook — lightweight, reduced-motion safe
   ======================================================================== */
function useCountUp(target: number, duration = 1.5, delay = 0.3) {
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(reduce ? Math.round(target) : 0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || reduce) return;
    hasStarted.current = true;

    const timeout = setTimeout(() => {
      const controls = animate(count, target, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [target, duration, delay, reduce, count]);

  return display;
}

/* ========================================================================
   Topic stat computation
   ======================================================================== */
function useTopicStats(exam: ExamResponse | null, mcqFeedback: McqFeedback[] | undefined) {
  return useMemo(() => {
    if (!exam?.questions?.length || !mcqFeedback?.length) return [];

    const stats: Record<string, { correct: number; total: number }> = {};
    exam.questions.forEach((q) => {
      if (q.type !== 'mcq') return;
      if (!stats[q.topic]) stats[q.topic] = { correct: 0, total: 0 };
      stats[q.topic].total++;
      const fb = mcqFeedback.find((f) => f.question_id === q.id);
      if (fb?.correct) stats[q.topic].correct++;
    });

    return Object.entries(stats)
      .map(([topic, { correct, total }]) => ({
        topic,
        score: total > 0 ? (correct / total) * 100 : 0,
        correct,
        total,
      }))
      .sort((a, b) => b.score - a.score);
  }, [exam, mcqFeedback]);
}

/* ========================================================================
   Review Item (isolated so hooks are valid)
   ======================================================================== */
function ReviewItem({
  question,
  index,
  feedback,
  reduce,
}: {
  question: ExamResponse['questions'][number];
  index: number;
  feedback: McqFeedback[] | undefined;
  reduce: boolean | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const fb = feedback?.find((f) => f.question_id === question.id);
  const isCorrect = fb?.correct;

  return (
    <div className="border rounded-xl overflow-hidden transition-colors hover:bg-muted/20">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {isCorrect ? (
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive shrink-0" />
        )}
        <span className="text-sm font-medium line-clamp-1 flex-1">
          Q{index + 1}: {question.prompt}
        </span>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <motion.div
          initial={reduce ? {} : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 pb-4"
        >
          <div className="pl-8 space-y-2">
            {question.type === 'mcq' && (
              <div className="space-y-1.5">
                {question.options?.map((option, i) => {
                  const isCorrectOption = option === question.correct_answer;
                  const isWrongSelection = option === fb?.submitted_answer && !isCorrect;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${
                        isCorrectOption
                          ? 'bg-success/10 text-success border border-success/20'
                          : isWrongSelection
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-muted/50'
                      }`}
                    >
                      <span className="font-semibold tabular-nums w-5">{String.fromCharCode(65 + i)}.</span>
                      <span className="flex-1">{option}</span>
                      {isCorrectOption && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {isWrongSelection && <XCircle className="w-4 h-4 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Explanation
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ========================================================================
   Main Page
   ======================================================================== */
export default function ExamResultPage() {
  const params = useParams();
  const examId = parseInt(params?.id as string, 10);
  const { user } = useAuthStore();
  const { exam, lastResult } = useExamStore();
  const [result, setResult] = useState<ExamSubmitResponse | null>(() =>
    lastResult && lastResult.exam_id === examId ? lastResult : null
  );
  const [isLoading, setIsLoading] = useState(() =>
    !(lastResult && lastResult.exam_id === examId)
  );
  const [savedExam, setSavedExam] = useState(false);
  const saveNote = useSaveNote();
  const reduce = useReducedMotion();

  useEffect(() => {
    const alreadyLoaded = lastResult && lastResult.exam_id === examId;
    if (alreadyLoaded) return;

    let cancelled = false;

    if (user) {
      const doFetch = async () => {
        try {
          const res = await fetch(`/api/proxy/student/${user.id}/attempts`);
          const data = await res.json();
          if (!cancelled && data.success) {
            const attempts: AttemptResponse[] = data.data;
            const attempt = attempts.find((a) => a.exam_id === examId);
            if (attempt) {
              setResult({
                attempt_id: attempt.attempt_id,
                student_id: attempt.student_id,
                exam_id: attempt.exam_id,
                score_percentage: attempt.score_percentage,
                mcq_correct: attempt.mcq_correct,
                mcq_total: attempt.mcq_total,
                weak_topics: attempt.weak_topics || [],
                weak_subtopics: [],
                readiness_score: attempt.readiness_score,
                short_answer_feedback: attempt.short_answer_feedback || [],
                mcq_feedback: [],
                generated_notes: [],
              });
            }
          }
        } catch {
          // silent fail
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };
      doFetch();
    } else {
      const t = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(t);
    }

    return () => { cancelled = true; };
  }, [lastResult, examId, user]);

  const handleSaveNote = (note: GeneratedNote) => {
    saveNote.mutate(
      { noteId: note.id, bookmarked: false },
      { onSuccess: () => toast.success('Note saved to library!'), onError: () => toast.error('Failed to save note') }
    );
  };

  const handleBookmarkNote = (note: GeneratedNote) => {
    saveNote.mutate(
      { noteId: note.id, bookmarked: true },
      { onSuccess: () => toast.success('Note bookmarked!'), onError: () => toast.error('Failed to bookmark note') }
    );
  };

  const handleSaveExam = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/proxy/exam/${examId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, exam_id: examId }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedExam(true);
        toast.success('Exam saved to library!');
      } else {
        toast.error(data.error?.message || 'Failed to save exam');
      }
    } catch {
      toast.error('Failed to save exam');
    }
  };

  /* ---- Derived data --------------------------------------------------- */
  const topicStats = useTopicStats(exam, result?.mcq_feedback);
  const strengths = topicStats.filter((t) => t.score >= 60);
  // weakness stats from per-topic breakdown (available when mcq_feedback exists)
  void topicStats;

  const grade = result ? getGradeLetter(result.score_percentage) : 'F';
  const gradeColor = result ? getGradeColor(result.score_percentage) : '#EF4444';
  const scoreCount = useCountUp(result ? Math.round(result.score_percentage) : 0, 1.8, 0.4);
  const readinessCount = useCountUp(result ? Math.round(result.readiness_score) : 0, 1.5, 0.6);

  const isGreatScore = result ? result.score_percentage >= 70 : false;
  const isGoodScore = result ? result.score_percentage >= 50 : false;

  /* ---- Loading state -------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-[60vh]">
        <div className="absolute inset-0 -z-10 opacity-20">
          <AIBackground />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-muted border-t-primary"
        />
      </div>
    );
  }

  /* ---- No-result state ------------------------------------------------ */
  if (!result) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 -z-10 opacity-20">
          <AIBackground />
        </div>
        <Reveal className="text-center max-w-md mx-auto">
          <div className="glass rounded-3xl p-10">
            <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-5" />
            <h3 className="text-xl font-bold mb-2">Exam Result Not Available</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              This result may have expired or the exam was taken on another device.
              Check your exam history for details.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/exam/history">
                <Button variant="outline" size="lg">View History</Button>
              </Link>
              <Link href="/exam/config">
                <Button variant="gradient" size="lg">Start New Exam</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  /* ---- AI Insight copy ------------------------------------------------ */
  const aiInsightCopy = (() => {
    const parts: string[] = [];
    if (isGreatScore) {
      parts.push('Outstanding performance! You have a strong grasp of the material.');
    } else if (isGoodScore) {
      parts.push('Solid effort! You are on the right track with a good understanding of core concepts.');
    } else {
      parts.push('Every attempt is a step forward. Focus on the highlighted areas below to build a stronger foundation.');
    }
    if (result.weak_topics.length > 0) {
      parts.push(` Prioritize ${result.weak_topics[0].topic} in your next study session.`);
    }
    if (result.readiness_score >= 75) {
      parts.push(' Your readiness score suggests you are well-prepared for tougher challenges.');
    }
    return parts.join('');
  })();

  return (
    <div className="relative min-h-screen pb-20">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 -z-10 opacity-25">
        <AIBackground />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12 space-y-8 lg:space-y-10">
        {/* Back link */}
        <Reveal>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* =============================================================
            1. SCORE HERO
            ============================================================= */}
        <Reveal delay={0.05}>
          <div className="relative glass rounded-3xl p-8 lg:p-14 text-center overflow-hidden">
            {/* Celebratory ambient glow */}
            {isGreatScore && !reduce && (
              <>
                <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-pulse-glow" />
                <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-brand-gradient opacity-15 blur-3xl animate-float-slow" />
              </>
            )}

            <div className="relative flex flex-col items-center gap-6">
              {/* Grade badge */}
              <motion.div
                initial={reduce ? {} : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: gradeColor + '18',
                  color: gradeColor,
                  border: `1.5px solid ${gradeColor}40`,
                }}
              >
                <Award className="w-4 h-4" />
                Grade {grade}
              </motion.div>

              {/* Big ProgressRing with count-up */}
              <div className="relative">
                <ProgressRing
                  value={result.score_percentage}
                  size={220}
                  strokeWidth={14}
                  label="Exam score percentage"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-heading text-6xl font-bold tabular-nums leading-none">
                      {scoreCount}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium mt-1">%</span>
                  </div>
                </ProgressRing>

                {/* Orbiting sparkle for great scores */}
                {isGreatScore && !reduce && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  >
                    <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-5 text-brand-from opacity-70" />
                  </motion.div>
                )}
              </div>

              {/* Score meta */}
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {isGreatScore ? 'Excellent Work!' : isGoodScore ? 'Good Job!' : 'Keep Pushing!'}
                </h1>
                <p className="text-muted-foreground">
                  {result.mcq_correct} / {result.mcq_total} questions correct
                </p>
              </div>

              {/* Readiness score mini-card */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-muted/50 border border-border/50">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Readiness</span>
                <span className="font-semibold tabular-nums">{readinessCount}%</span>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-brand-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.readiness_score}%` }}
                    transition={{ duration: reduce ? 0 : 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* =============================================================
            2. AI INSIGHT
            ============================================================= */}
        <Reveal delay={0.12}>
          <AIInsightCard title="Performance Summary" pulse={!reduce}>
            {aiInsightCopy}
          </AIInsightCard>
        </Reveal>

        {/* =============================================================
            3. STRENGTH + WEAKNESS GRID
            ============================================================= */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Reveal delay={0.18} direction="left">
            <Card variant="glass" className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  You are strongest at
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strengths.length > 0 ? (
                  <Stagger gap={0.06}>
                    {strengths.map((s) => (
                      <StaggerItem key={s.topic}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{s.topic}</span>
                            <span className="text-xs font-semibold text-success tabular-nums">
                              {s.correct}/{s.total}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-success"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${s.score}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {topicStats.length > 0
                      ? 'No standout strengths yet — keep practicing!'
                      : 'Detailed topic data not available for this attempt.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          {/* Weaknesses */}
          <Reveal delay={0.24} direction="right">
            <Card variant="glass" className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="w-5 h-5" />
                  You need improvement in
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Weak topics from API */}
                {result.weak_topics.length > 0 ? (
                  <Stagger gap={0.06}>
                    {result.weak_topics.map((wt, i) => (
                      <StaggerItem key={`wt-${i}`}>
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{wt.topic}</p>
                            <p className="text-xs text-muted-foreground truncate">{wt.reason}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="destructive" className="tabular-nums">
                              {wt.score ?? '–'}%
                            </Badge>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                ) : null}

                {/* Weak subtopics with practice CTA */}
                {result.weak_subtopics && result.weak_subtopics.length > 0 && (
                  <Stagger gap={0.06}>
                    {result.weak_subtopics.map((ws) => (
                      <StaggerItem key={ws.subtopic_id}>
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{ws.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{ws.topic}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="tabular-nums">
                              {ws.score.toFixed(0)}%
                            </Badge>
                            <Link href={`/practice-exam?focus=${ws.subtopic_id}`}>
                              <Button size="sm" variant="ghost" className="gap-1 text-xs h-7 px-2">
                                <Target className="w-3 h-3" />
                                Practice
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}

                {result.weak_topics.length === 0 && (!result.weak_subtopics || result.weak_subtopics.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No weak areas detected — amazing work!
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* =============================================================
            4. TOPIC MASTERY MAP (Growth Visual)
            ============================================================= */}
        {topicStats.length > 0 && (
          <Reveal delay={0.3}>
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Topic Mastery Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" gap={0.05}>
                  {topicStats.map((t) => {
                    const mastery = t.score >= 80 ? 'Mastered' : t.score >= 60 ? 'Proficient' : t.score >= 40 ? 'Developing' : 'Beginning';
                    const masteryColor = t.score >= 80 ? 'bg-success/15 text-success border-success/20' : t.score >= 60 ? 'bg-primary/10 text-primary border-primary/20' : t.score >= 40 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-destructive/10 text-destructive border-destructive/20';
                    return (
                      <StaggerItem key={t.topic}>
                        <div className={`relative p-4 rounded-2xl border ${masteryColor} flex flex-col items-center text-center gap-2`}>
                          <span className="font-heading text-2xl font-bold tabular-nums">{Math.round(t.score)}%</span>
                          <span className="text-xs font-medium leading-tight line-clamp-2">{t.topic}</span>
                          <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{mastery}</span>
                          <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{
                                background: t.score >= 60
                                  ? 'linear-gradient(90deg, var(--brand-from), var(--brand-to))'
                                  : t.score >= 40
                                    ? 'linear-gradient(90deg, var(--warning), var(--warning))'
                                    : 'linear-gradient(90deg, var(--destructive), var(--destructive))',
                              }}
                              initial={{ width: 0 }}
                              whileInView={{ width: '100%' }}
                              viewport={{ once: true }}
                              transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* =============================================================
            5. GENERATED NOTES
            ============================================================= */}
        {result.generated_notes && result.generated_notes.length > 0 && (
          <Reveal delay={0.35}>
            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Personalized Notes Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Stagger gap={0.08} className="space-y-4">
                  {result.generated_notes.map((note) => (
                    <StaggerItem key={note.id}>
                      <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm">{note.title}</h4>
                            {note.topic && (
                              <Badge variant="secondary" className="mt-1 text-xs">{note.topic}</Badge>
                            )}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleSaveNote(note)}>
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => handleBookmarkNote(note)}>
                              <Bookmark className="w-3 h-3 mr-1" />
                              Bookmark
                            </Button>
                          </div>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-h-40 overflow-y-auto text-sm text-muted-foreground">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {note.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
                <Link href="/personalized-notes" className="mt-4 block">
                  <Button variant="ghost" size="sm" className="w-full gap-1">
                    View All Notes <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* =============================================================
            6. ANSWER REVIEW
            ============================================================= */}
        {exam && result.mcq_feedback && result.mcq_feedback.length > 0 && (
          <Reveal delay={0.4}>
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Answer Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Stagger gap={0.05}>
                  {exam.questions.map((question, index) => (
                    <StaggerItem key={question.id}>
                      <ReviewItem
                        question={question}
                        index={index}
                        feedback={result.mcq_feedback}
                        reduce={reduce}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* =============================================================
            7. ACTIONS
            ============================================================= */}
        <Reveal delay={0.45}>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/exam/config">
              <Button variant="gradient" size="xl" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Retake Exam
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="outline" size="xl" className="gap-2">
                <BookOpen className="w-5 h-5" />
                View Notes
              </Button>
            </Link>
            <Button
              variant="outline"
              size="xl"
              className="gap-2"
              onClick={handleSaveExam}
              disabled={savedExam}
            >
              <BookMarked className="w-5 h-5" />
              {savedExam ? 'Saved to Library' : 'Save Exam'}
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

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
import { ExamSubmitResponse, GeneratedNote, AttemptResponse } from '@/lib/types/exam';
import { getGradeLetter, getGradeColor } from '@/lib/utils/formatters';
import { useSaveNote } from '@/lib/api/notes';
import {
  CheckCircle, XCircle, BookOpen, ArrowLeft, RotateCcw, Target, Layers,
  Save, Bookmark, FileText, ChevronRight, BookMarked
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ExamResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { exam, lastResult, reset } = useExamStore();
  const [result, setResult] = useState<ExamSubmitResponse | null>(lastResult);
  const [isLoading, setIsLoading] = useState(true);
  const [savedExam, setSavedExam] = useState(false);
  const saveNote = useSaveNote();

  const examId = parseInt(params.id, 10);

  useEffect(() => {
    // If we have lastResult from the store and it matches this exam, use it
    if (lastResult && lastResult.exam_id === examId) {
      setResult(lastResult);
      setIsLoading(false);
      return;
    }

    // If user refreshed or came back later, try to fetch from history
    if (user) {
      fetchAttemptFromHistory(user.id, examId);
    } else {
      setIsLoading(false);
    }
  }, [lastResult, examId, user]);

  const fetchAttemptFromHistory = async (studentId: number, targetExamId: number) => {
    try {
      const res = await fetch(`/api/proxy/student/${studentId}/attempts`);
      const data = await res.json();
      if (data.success) {
        const attempts: AttemptResponse[] = data.data;
        const attempt = attempts.find((a) => a.exam_id === targetExamId);
        if (attempt) {
          // Attempt response has less detail than submit response, but enough for basic display
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
    } catch (e) {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = (note: GeneratedNote) => {
    saveNote.mutate(
      { noteId: note.id, bookmarked: false },
      {
        onSuccess: () => toast.success('Note saved to library!'),
        onError: () => toast.error('Failed to save note'),
      }
    );
  };

  const handleBookmarkNote = (note: GeneratedNote) => {
    saveNote.mutate(
      { noteId: note.id, bookmarked: true },
      {
        onSuccess: () => toast.success('Note bookmarked!'),
        onError: () => toast.error('Failed to bookmark note'),
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Exam Result Not Available</h3>
        <p className="text-muted-foreground mb-6">
          This result may have expired or the exam was taken on another device.
          Check your exam history for details.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/exam/history">
            <Button variant="outline">View History</Button>
          </Link>
          <Link href="/exam/config">
            <Button>Start New Exam</Button>
          </Link>
        </div>
      </div>
    );
  }

  const grade = getGradeLetter(result.score_percentage);
  const gradeColor = getGradeColor(result.score_percentage);

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
              {result.score_percentage.toFixed(1)}%
            </h1>
            <p className="text-muted-foreground">
              {result.mcq_correct} / {result.mcq_total} correct
            </p>

            <div className="mt-6 max-w-md mx-auto">
              <Progress value={result.score_percentage} className="h-3" />
            </div>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <span className="text-sm text-muted-foreground">Readiness Score:</span>
              <span className="font-semibold">{result.readiness_score.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weak Topics */}
      {result.weak_topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics to Improve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.weak_topics.map((topic, index) => (
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

      {/* Weak Subtopics */}
      {(result.weak_subtopics?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Weak Subtopics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.weak_subtopics!.map((ws) => (
                <div
                  key={ws.subtopic_id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{ws.name}</p>
                    <p className="text-sm text-muted-foreground">{ws.topic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ws.score.toFixed(0)}%</Badge>
                    <Link href={`/practice-exam?focus=${ws.subtopic_id}`}>
                      <Button size="sm" variant="ghost">
                        <Target className="w-3 h-3 mr-1" />
                        Practice
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Personalized Notes */}
      {result.generated_notes && result.generated_notes.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Personalized Notes Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.generated_notes.map((note) => (
                <div key={note.id} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{note.title}</h4>
                      {note.topic && (
                        <Badge variant="secondary" className="mt-1">{note.topic}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveNote(note)}
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBookmarkNote(note)}
                      >
                        <Bookmark className="w-3 h-3 mr-1" />
                        Bookmark
                      </Button>
                    </div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-h-40 overflow-y-auto text-sm text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content.slice(0, 400) + (note.content.length > 400 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              <Link href="/personalized-notes">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Notes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer Review */}
      {exam && result.mcq_feedback && result.mcq_feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exam.questions.map((question, index) => {
                const feedback = result.mcq_feedback?.find(
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
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
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
        <Button
          variant="outline"
          onClick={handleSaveExam}
          disabled={savedExam}
        >
          <BookMarked className="w-4 h-4 mr-1" />
          {savedExam ? 'Saved' : 'Save Exam'}
        </Button>
      </div>
    </div>
  );
}

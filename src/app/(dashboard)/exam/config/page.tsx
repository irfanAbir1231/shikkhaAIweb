'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { useChapters, useTopics } from '@/lib/api/curriculum';
import { useSubtopics } from '@/lib/api/subtopics';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AILoader } from '@/components/ui/ai-loader';
import { Reveal } from '@/components/motion/reveal';
import { AIBackground } from '@/components/background/ai-background';
import { SUBJECTS, DIFFICULTIES } from '@/lib/utils/constants';
import {
  Brain,
  Clock,
  HelpCircle,
  Search,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Wand2,
  Target,
  Zap,
  BookOpen,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const configSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  class_level: z.string().min(1, 'Class level is required'),
  chapter: z.string().min(1, 'Chapter is required'),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  num_questions: z.number().min(5).max(50),
  time_limit: z.number().min(10).max(180),
});

type ConfigForm = z.infer<typeof configSchema>;

/* ------------------------------------------------------------------ */
/*  Topic Autocomplete — logic unchanged, styling upgraded            */
/* ------------------------------------------------------------------ */
function TopicAutocomplete({
  value,
  onChange,
  disabled,
  classLevel,
  subject,
  chapter,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  classLevel: string | undefined;
  subject: string | undefined;
  chapter: string | undefined;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const debouncedSearch = useDebounce(search, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const { data: topics, isLoading, error: topicsError } = useTopics(
    classLevel,
    subject,
    chapter,
    debouncedSearch
  );

  useEffect(() => {
    if (value === search) return;
    rafRef.current = requestAnimationFrame(() => {
      setSearch(value);
      rafRef.current = null;
    });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = useCallback(
    (topicName: string) => {
      onChange(topicName);
      setSearch(topicName);
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSearch('');
    onChange('');
    setOpen(true);
  }, [onChange]);

  const showSuggestions = open && !disabled && !!chapter;

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={disabled ? 'Select a chapter first' : 'Type to search topics...'}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (!disabled && chapter) setOpen(true);
          }}
          disabled={disabled}
          className="pl-9 pr-9 glass bg-transparent border-foreground/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/30 transition-all"
        />
        {search && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 rounded-xl glass ring-0">
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {isLoading && (
                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching…
                </div>
              )}
              {topicsError && (
                <div className="px-3 py-2 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed to load topics
                </div>
              )}
              {!isLoading && !topicsError && topics && topics.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {debouncedSearch.trim()
                    ? `No topics found for "${debouncedSearch}"`
                    : 'Start typing to search topics'}
                </div>
              )}
              {!isLoading && !topicsError && topics && topics.length > 0 && (
                <div>
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelect(topic.name)}
                      className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exam Summary Panel — sticky action card on the right              */
/* ------------------------------------------------------------------ */
function ExamSummaryPanel({
  subject,
  chapterName,
  topic,
  difficulty,
  numQuestions,
  timeLimit,
  subtopicCount,
  isLoading,
}: {
  subject: string;
  chapterName: string;
  topic: string;
  difficulty: string;
  numQuestions: number;
  timeLimit: number;
  subtopicCount: number;
  isLoading: boolean;
}) {
  const diffConfig =
    difficulty === 'easy'
      ? { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Easy' }
      : difficulty === 'medium'
      ? { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' }
      : { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Hard' };

  const ready = !!subject && !!chapterName && !!topic;

  return (
    <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
      <Reveal delay={0.2}>
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-primary" />
              Exam Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Config list */}
            <div className="space-y-3">
              <SummaryRow
                icon={<BookOpen className="w-4 h-4" />}
                label="Subject"
                value={subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : '—'}
                active={!!subject}
              />
              <SummaryRow
                icon={<Layers className="w-4 h-4" />}
                label="Chapter"
                value={chapterName || '—'}
                active={!!chapterName}
              />
              <SummaryRow
                icon={<Brain className="w-4 h-4" />}
                label="Topic"
                value={topic || '—'}
                active={!!topic}
              />
              <SummaryRow
                icon={<Zap className="w-4 h-4" />}
                label="Difficulty"
                value={
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${diffConfig.bg} ${diffConfig.color} ${diffConfig.border}`}
                  >
                    {diffConfig.label}
                  </span>
                }
                active
              />
              <SummaryRow
                icon={<HelpCircle className="w-4 h-4" />}
                label="Questions"
                value={`${numQuestions}`}
                active
              />
              <SummaryRow
                icon={<Clock className="w-4 h-4" />}
                label="Time Limit"
                value={`${timeLimit} min`}
                active
              />
              {subtopicCount > 0 && (
                <SummaryRow
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  label="Focused Subtopics"
                  value={`${subtopicCount} selected`}
                  active
                />
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 pt-4">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">Est. duration</span>
                <span className="font-semibold tabular-nums">{timeLimit} min</span>
              </div>

              <Button
                type="submit"
                variant="default"
                size="xl"
                className="w-full transition-all"
                disabled={isLoading || !ready}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Generate Exam
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {!ready && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Select subject, chapter, and topic to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* Helper tip */}
      <Reveal delay={0.3}>
        <div className="rounded-xl border border-foreground/10 bg-muted/30 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Tip:</span> Choose specific subtopics to
          focus your exam on weak areas. The AI adapts question difficulty based on your selection.
        </div>
      </Reveal>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium truncate ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Form — two-column layout with sticky summary panel           */
/* ------------------------------------------------------------------ */
function ExamConfigForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { setExam } = useExamStore();
  const [isLoading, setIsLoading] = useState(false);

  const urlSubject = searchParams.get('subject') || '';
  const urlTopic = searchParams.get('topic') || '';
  const urlChapter = searchParams.get('chapter') || '';
  const urlTimeLimit = searchParams.get('time_limit');
  const urlNumQuestions = searchParams.get('num_questions');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      subject: urlSubject || 'science',
      topic: urlTopic || '',
      class_level: user?.grade_level || '8',
      chapter: '',
      difficulty: 'medium',
      num_questions: urlNumQuestions
        ? Math.min(50, Math.max(5, parseInt(urlNumQuestions)))
        : 10,
      time_limit: urlTimeLimit
        ? Math.min(180, Math.max(10, parseInt(urlTimeLimit)))
        : 30,
    },
  });

  const numQuestions = watch('num_questions');
  const timeLimit = watch('time_limit');
  const difficulty = watch('difficulty');
  const subject = watch('subject');
  const classLevel = watch('class_level');
  const chapter = watch('chapter');
  const topic = watch('topic');

  const {
    data: chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
  } = useChapters(classLevel, subject);

  useEffect(() => {
    if (chapters && urlChapter && !watch('chapter')) {
      const matched = chapters.find(
        (ch: { id: string; name: string }) =>
          ch.id === urlChapter || ch.name.toLowerCase() === urlChapter.toLowerCase()
      );
      if (matched) {
        setValue('chapter', matched.id);
        if (urlTopic) {
          setValue('topic', urlTopic);
        }
      }
    }
  }, [chapters, urlChapter, urlTopic, setValue, watch]);

  const onSubmit = async (data: ConfigForm) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { time_limit: _tl, chapter: _ch, ...examData } = data;
      const res = await fetch('/api/proxy/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          ...examData,
          subtopic_ids: selectedSubtopicIds.length > 0 ? selectedSubtopicIds : undefined,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Failed to generate exam');
        return;
      }

      setExam(result.data, (data.time_limit || 30) * 60);
      toast.success('Exam generated!');
      router.push(`/exam/session/${result.data.exam_id}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const chapterSelectDisabled = !subject || !classLevel;
  const topicAutocompleteDisabled = !chapter || chapterSelectDisabled;
  const [showSubtopics, setShowSubtopics] = useState(false);
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<number[]>([]);
  const { data: subtopics, isLoading: subtopicsLoading } = useSubtopics(
    watch('topic'),
    classLevel,
    subject
  );

  const selectedChapterName =
    chapters?.find((ch: { id: string; name: string }) => ch.id === chapter)?.name || '';

  return (
    <div className="relative min-h-screen pb-20">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <AIBackground />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <Reveal>
          <div className="mb-6">
            <h1 className="font-heading text-3xl font-bold tracking-tight">Generate Exam</h1>
            <p className="text-muted-foreground">
              Configure your personalized practice exam
            </p>
          </div>
        </Reveal>

        {isLoading && (
          <div className="py-16">
            <AILoader label="Generating personalized exam…" />
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* ═══════ LEFT COLUMN: Configuration ═══════ */}
              <div className="space-y-6">
                {/* ── Subject & Topic ── */}
                <Reveal delay={0.05}>
                  <Card variant="glass" className="overflow-visible">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Subject &amp; Topic
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Subject pills */}
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECTS.slice(0, 5).map((s) => {
                            const active = subject === s;
                            return (
                              <Button
                                key={s}
                                type="button"
                                variant={active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setValue('subject', s);
                                  setValue('chapter', '');
                                  setValue('topic', '');
                                }}
                                className={
                                  active
                                    ? 'ring-2 ring-primary/20'
                                    : 'border-foreground/10 hover:border-primary/30 hover:bg-primary/5'
                                }
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </Button>
                            );
                          })}
                        </div>
                        {errors.subject && (
                          <p className="text-sm text-destructive">{errors.subject.message}</p>
                        )}
                      </div>

                      {/* Hidden class_level */}
                      <input type="hidden" {...register('class_level')} />

                      {/* Chapter select */}
                      <div className="space-y-2">
                        <Label htmlFor="chapter">Chapter</Label>
                        <Controller
                          name="chapter"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setValue('topic', '');
                              }}
                              disabled={chapterSelectDisabled}
                            >
                              <SelectTrigger
                                className="w-full glass bg-transparent border-foreground/10 focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                                id="chapter"
                              >
                                <SelectValue
                                  placeholder={
                                    chapterSelectDisabled
                                      ? 'Select subject and class first'
                                      : chaptersLoading
                                      ? 'Loading chapters…'
                                      : 'Select a chapter'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {chaptersLoading && (
                                  <div className="px-3 py-2">
                                    <Skeleton className="h-4 w-full" />
                                  </div>
                                )}
                                {chaptersError && (
                                  <div className="px-3 py-2 text-sm text-destructive flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Failed to load chapters
                                  </div>
                                )}
                                {!chaptersLoading &&
                                  !chaptersError &&
                                  chapters?.map((ch) => (
                                    <SelectItem key={ch.id} value={ch.id}>
                                      {ch.chapter_number !== undefined
                                        ? `Ch. ${ch.chapter_number}: `
                                        : ''}
                                      {ch.name}
                                    </SelectItem>
                                  ))}
                                {!chaptersLoading && !chaptersError && chapters?.length === 0 && (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No chapters found
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.chapter && (
                          <p className="text-sm text-destructive">{errors.chapter.message}</p>
                        )}
                      </div>

                      {/* Topic autocomplete */}
                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Controller
                          name="topic"
                          control={control}
                          render={({ field }) => (
                            <TopicAutocomplete
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                                setSelectedSubtopicIds([]);
                              }}
                              disabled={topicAutocompleteDisabled}
                              classLevel={classLevel}
                              subject={subject}
                              chapter={chapter}
                              error={errors.topic?.message}
                            />
                          )}
                        />
                      </div>

                      {/* Subtopics */}
                      {watch('topic') && (
                        <div className="space-y-2 pt-3 border-t border-foreground/5">
                          <button
                            type="button"
                            onClick={() => setShowSubtopics(!showSubtopics)}
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSubtopics ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            Focus on Specific Subtopics (optional)
                          </button>
                          {showSubtopics && (
                            <div className="space-y-2">
                              {subtopicsLoading ? (
                                <Skeleton className="h-20" />
                              ) : !subtopics || subtopics.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No subtopics found for this topic.
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {subtopics.map((st) => {
                                    const selected = selectedSubtopicIds.includes(st.id);
                                    return (
                                      <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => {
                                          if (selected) {
                                            setSelectedSubtopicIds((prev) =>
                                              prev.filter((id) => id !== st.id)
                                            );
                                          } else {
                                            setSelectedSubtopicIds((prev) => [...prev, st.id]);
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                          selected
                                            ? 'bg-primary text-primary-foreground border-transparent'
                                            : 'glass text-muted-foreground border-foreground/10 hover:border-primary/30 hover:text-foreground'
                                        }`}
                                      >
                                        {st.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Reveal>

                {/* ── Exam Settings ── */}
                <Reveal delay={0.15}>
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        Exam Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Difficulty */}
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <div className="flex gap-2">
                          {DIFFICULTIES.map((diff) => {
                            const active = difficulty === diff;
                            return (
                              <Button
                                key={diff}
                                type="button"
                                variant={active ? 'default' : 'outline'}
                                className={`flex-1 capitalize ${
                                  active ? 'ring-2 ring-primary/20' : 'border-foreground/10 hover:border-primary/30'
                                }`}
                                onClick={() => setValue('difficulty', diff)}
                              >
                                {diff}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Number of questions */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Number of Questions</Label>
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {numQuestions}
                          </span>
                        </div>
                        <Slider
                          value={[numQuestions]}
                          onValueChange={(value) =>
                            setValue('num_questions', Array.isArray(value) ? value[0] : value)
                          }
                          min={5}
                          max={50}
                          step={1}
                        />
                      </div>

                      {/* Time limit */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Time Limit (minutes)
                          </Label>
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {timeLimit} min
                          </span>
                        </div>
                        <Slider
                          value={[timeLimit]}
                          onValueChange={(value) =>
                            setValue('time_limit', Array.isArray(value) ? value[0] : value)
                          }
                          min={10}
                          max={180}
                          step={5}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>

              {/* ═══════ RIGHT COLUMN: Sticky Summary ═══════ */}
              <ExamSummaryPanel
                subject={subject}
                chapterName={selectedChapterName}
                topic={topic}
                difficulty={difficulty}
                numQuestions={numQuestions}
                timeLimit={timeLimit}
                subtopicCount={selectedSubtopicIds.length}
                isLoading={isLoading}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page shell with Suspense fallback                                  */
/* ------------------------------------------------------------------ */
export default function ExamConfigPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen pb-20">
          <div className="absolute inset-0 -z-10 opacity-30">
            <AIBackground />
          </div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6 space-y-1">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-5 w-72" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              <div className="space-y-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-64" />
              </div>
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      }
    >
      <ExamConfigForm />
    </Suspense>
  );
}

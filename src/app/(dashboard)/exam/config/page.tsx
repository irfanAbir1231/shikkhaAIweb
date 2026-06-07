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

  // Sync external value prop to local search state via rAF to avoid
  // synchronous setState-in-effect (react-hooks/set-state-in-effect).
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
        <div className="absolute z-50 w-full mt-1 rounded-xl glass shadow-glow ring-0">
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
/*  Exam Preview Chips — reads existing form state                    */
/* ------------------------------------------------------------------ */
function ExamPreviewChips({
  subject,
  numQuestions,
  timeLimit,
  difficulty,
}: {
  subject: string;
  numQuestions: number;
  timeLimit: number;
  difficulty: string;
}) {
  const diffColor =
    difficulty === 'easy'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : difficulty === 'medium'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">Preview:</span>
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium glass">
        <Target className="w-3 h-3 text-primary" />
        {subject.charAt(0).toUpperCase() + subject.slice(1)}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium glass">
        <HelpCircle className="w-3 h-3 text-primary" />
        {numQuestions} questions
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium glass">
        <Clock className="w-3 h-3 text-primary" />
        {timeLimit} min
      </span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${diffColor}`}
      >
        <Zap className="w-3 h-3" />
        {difficulty}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Form — all business logic preserved                          */
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

  return (
    <div className="relative min-h-screen pb-20">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <AIBackground />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <Reveal>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gradient">Generate Exam</h1>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Subject & Topic ── */}
          <Reveal delay={0.05}>
            <Card variant="glass" className="overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
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
                          variant={active ? 'gradient' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setValue('subject', s);
                            setValue('chapter', '');
                            setValue('topic', '');
                          }}
                          className={
                            active
                              ? 'shadow-glow'
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
                                      ? 'bg-brand-gradient text-white border-transparent shadow-glow'
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
                <CardTitle className="flex items-center gap-2 text-gradient">
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
                          variant={active ? 'gradient' : 'outline'}
                          className={`flex-1 capitalize ${
                            active ? 'shadow-glow' : 'border-foreground/10 hover:border-primary/30'
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

                {/* Preview chips */}
                <div className="pt-2 border-t border-foreground/5">
                  <ExamPreviewChips
                    subject={subject}
                    numQuestions={numQuestions}
                    timeLimit={timeLimit}
                    difficulty={difficulty}
                  />
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* ── Generate Button ── */}
          <Reveal delay={0.25}>
            <Button
              type="submit"
              variant="gradient"
              size="xl"
              className="w-full shadow-glow hover:shadow-glow-lg transition-all"
              disabled={isLoading}
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
                </span>
              )}
            </Button>
          </Reveal>
        </form>
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
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <div className="space-y-1">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-5 w-72" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
      }
    >
      <ExamConfigForm />
    </Suspense>
  );
}

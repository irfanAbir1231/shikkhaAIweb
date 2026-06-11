'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
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
import { cn } from '@/lib/utils';
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
  Crosshair,
  Atom,
  Dna,
  Calculator,
  Globe,
  PenTool,
  FlaskConical,
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
  isPracticeWeak,
}: {
  subject: string;
  chapterName: string;
  topic: string;
  difficulty: string;
  numQuestions: number;
  timeLimit: number;
  subtopicCount: number;
  isLoading: boolean;
  isPracticeWeak?: boolean;
}) {
  const diffConfig =
    difficulty === 'easy'
      ? { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Easy' }
      : difficulty === 'medium'
      ? { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' }
      : { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Hard' };

  const ready = !!subject && !!chapterName && !!topic;

  return (
    <div className="lg:sticky lg:top-4 lg:self-start space-y-3">
      <Reveal delay={0.2}>
        <Card variant="glass" className="overflow-hidden" size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-primary" />
              Exam Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Config list */}
            <div className="space-y-2">
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
              {isPracticeWeak && subtopicCount > 0 && (
                <SummaryRow
                  icon={<Crosshair className="w-4 h-4" />}
                  label="Focus Areas"
                  value={`${subtopicCount} subtopic${subtopicCount !== 1 ? 's' : ''} selected`}
                  active
                />
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 pt-3">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">Est. duration</span>
                <span className="font-semibold tabular-nums">{timeLimit} min</span>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full transition-all"
                disabled={isLoading || !ready || (isPracticeWeak && subtopicCount === 0)}
                data-tour="exam-generate"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    {isPracticeWeak ? 'Practice Weak Areas' : 'Generate Exam'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {!ready && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Select subject, chapter, and topic to continue
                </p>
              )}
              {ready && isPracticeWeak && subtopicCount === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Select at least one subtopic to practice
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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
    <div className="flex items-center gap-2.5">
      <div className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        <p className={`text-sm font-medium truncate leading-tight ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
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
  const urlClassLevel = searchParams.get('class_level') || '';
  const urlTimeLimit = searchParams.get('time_limit');
  const urlNumQuestions = searchParams.get('num_questions');
  const isPracticeWeak = searchParams.get('practice_weak') === '1';
  const urlWeakSubtopicIds = searchParams
    .get('subtopic_ids')
    ?.split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0) || [];

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
      class_level: urlClassLevel || user?.grade_level || '8',
      chapter: urlChapter || '',
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
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<number[]>(
    isPracticeWeak ? urlWeakSubtopicIds : []
  );
  const { data: allSubtopics, isLoading: subtopicsLoading } = useSubtopics(
    isPracticeWeak ? watch('topic') : undefined,
    classLevel,
    subject
  );
  const weakSubtopics =
    isPracticeWeak && allSubtopics
      ? allSubtopics.filter((st) => urlWeakSubtopicIds.includes(st.id))
      : [];


  const selectedChapterName =
    chapters?.find((ch: { id: string; name: string }) => ch.id === chapter)?.name || '';

  return (
    <div className="h-screen overflow-hidden flex flex-col relative">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <AIBackground />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 flex-1 min-h-0 flex flex-col w-full">
        {/* Header */}
        <Reveal>
          <div className="mb-3 shrink-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {isPracticeWeak ? 'Practice Weak Areas' : 'Generate Exam'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isPracticeWeak
                ? 'Focus on the subtopics you need to improve'
                : 'Configure your personalized practice exam'}
            </p>
          </div>
        </Reveal>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <AILoader label="Generating personalized exam…" />
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-stretch h-full">
              {/* ═══════ LEFT COLUMN: Configuration ═══════ */}
              <div className="flex flex-col gap-4 min-h-0 overflow-y-auto lg:overflow-visible pr-1">
                {/* ── Subject & Topic ── */}
                <Reveal delay={0.05}>
                  <Card variant="glass" className="overflow-visible" size="sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-primary" />
                        Subject &amp; Topic
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Subject cards */}
                      <div className="space-y-2" data-tour="exam-subject">
                        <Label>Subject</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SUBJECTS.slice(0, 6).map((s) => {
                            const active = subject === s;
                            const subjectConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
                              science: { icon: FlaskConical, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                              math: { icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                              english: { icon: PenTool, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
                              biology: { icon: Dna, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
                              physics: { icon: Atom, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
                              chemistry: { icon: FlaskConical, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                            };
                            const config = subjectConfig[s] || { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
                            const Icon = config.icon;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setValue('subject', s);
                                  setValue('chapter', '');
                                  setValue('topic', '');
                                }}
                                className={cn(
                                  'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                                  active
                                    ? `${config.bg} ${config.border} shadow-glow`
                                    : 'border-border/40 bg-card/30 hover:border-primary/20 hover:bg-primary/5'
                                )}
                              >
                                <Icon className={cn('size-6', active ? config.color : 'text-muted-foreground')} />
                                <span className={cn('text-sm font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </span>
                                {active && (
                                  <motion.div
                                    layoutId="subjectCheck"
                                    className="absolute top-2 right-2"
                                  >
                                    <CheckCircle2 className={cn('size-4', config.color)} />
                                  </motion.div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {errors.subject && (
                          <p className="text-sm text-destructive">{errors.subject.message}</p>
                        )}
                      </div>

                      {/* Hidden class_level */}
                      <input type="hidden" {...register('class_level')} data-tour="exam-class" />

                      {/* Chapter select */}
                      <div className="space-y-2" data-tour="exam-chapter">
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
                      <div className="space-y-2" data-tour="exam-topic">
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

                    </CardContent>
                  </Card>
                </Reveal>

                {/* ── Exam Settings ── */}
                <Reveal delay={0.1}>
                  <Card variant="glass" size="sm" data-tour="exam-settings">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Exam Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Difficulty */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">Difficulty</Label>
                        <div className="flex gap-2">
                          {DIFFICULTIES.map((diff) => {
                            const active = difficulty === diff;
                            return (
                              <Button
                                key={diff}
                                type="button"
                                variant={active ? 'default' : 'outline'}
                                size="sm"
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
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm">Number of Questions</Label>
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
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="flex items-center gap-2 text-sm">
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

                {/* ── Weak Areas (only in practice-weak mode) ── */}
                {isPracticeWeak && watch('topic') && (
                  <Reveal delay={0.15}>
                    <Card variant="glass" size="sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Crosshair className="w-4 h-4 text-primary" />
                          Focus Areas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {weakSubtopics.length > 0
                            ? 'These are the weak subtopics identified from your previous exam. Deselect any you do not want to focus on.'
                            : urlWeakSubtopicIds.length === 0
                            ? 'No weak subtopics tracked yet. Select subtopics below to track them in your next exam — after submission, weak areas will appear here automatically.'
                            : 'No weak subtopics found yet. Select subtopics you want to practice below.'}
                        </p>
                        {subtopicsLoading ? (
                          <Skeleton className="h-16" />
                        ) : allSubtopics && allSubtopics.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {allSubtopics.map((st) => {
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
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No subtopics available for this topic.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Reveal>
                )}
              </div>

              {/* ═══════ RIGHT COLUMN: Sticky Summary ═══════ */}
              <div className="shrink-0">
                <ExamSummaryPanel
                  subject={subject}
                  chapterName={selectedChapterName}
                  topic={topic}
                  difficulty={difficulty}
                  numQuestions={numQuestions}
                  timeLimit={timeLimit}
                  subtopicCount={selectedSubtopicIds.length}
                  isLoading={isLoading}
                  isPracticeWeak={isPracticeWeak}
                />
              </div>
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
        <div className="h-screen overflow-hidden flex flex-col relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <AIBackground />
          </div>
          <div className="max-w-6xl mx-auto px-4 py-4 flex-1 min-h-0 flex flex-col w-full">
            <div className="mb-3 space-y-1 shrink-0">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 flex-1">
              <div className="space-y-4">
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
              </div>
              <Skeleton className="h-80" />
            </div>
          </div>
        </div>
      }
    >
      <ExamConfigForm />
    </Suspense>
  );
}

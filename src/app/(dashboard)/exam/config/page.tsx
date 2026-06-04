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
import { SUBJECTS, DIFFICULTIES, GRADE_LEVELS } from '@/lib/utils/constants';
import { Brain, Clock, HelpCircle, Search, X, Loader2, AlertCircle } from 'lucide-react';

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

  const { data: topics, isLoading, error: topicsError } = useTopics(
    classLevel,
    subject,
    chapter,
    debouncedSearch
  );

  useEffect(() => {
    if (value !== search) {
      setSearch(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close dropdown on outside click
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
          className="pl-9 pr-9"
        />
        {search && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {isLoading && (
                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </div>
              )}
              {topicsError && (
                <div className="px-3 py-2 text-sm text-red-500 flex items-center gap-2">
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
                      className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
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
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function ExamConfigForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { setExam } = useExamStore();
  const [isLoading, setIsLoading] = useState(false);

  const urlSubject = searchParams.get('subject') || '';
  const urlTopic = searchParams.get('topic') || '';

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
      num_questions: 10,
      time_limit: 30,
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

  const onSubmit = async (data: ConfigForm) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      const { time_limit: _, ...examData } = data;
      const res = await fetch('/api/proxy/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          ...examData,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Failed to generate exam');
        return;
      }

      setExam(result.data);
      toast.success('Exam generated!');
      router.push(`/exam/session/${result.data.exam_id}`);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const chapterSelectDisabled = !subject || !classLevel;
  const topicAutocompleteDisabled = !chapter || chapterSelectDisabled;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Exam</h1>
        <p className="text-muted-foreground">Configure your practice exam</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Subject & Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.slice(0, 5).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={subject === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setValue('subject', s);
                      setValue('chapter', '');
                      setValue('topic', '');
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            {/* Class Level */}
            <div className="space-y-2">
              <Label>Class Level</Label>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <Button
                    key={grade}
                    type="button"
                    variant={classLevel === grade ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setValue('class_level', grade);
                      setValue('chapter', '');
                      setValue('topic', '');
                    }}
                  >
                    Class {grade}
                  </Button>
                ))}
              </div>
              {errors.class_level && (
                <p className="text-sm text-red-500">{errors.class_level.message}</p>
              )}
            </div>

            {/* Chapter */}
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
                    <SelectTrigger className="w-full" id="chapter">
                      <SelectValue
                        placeholder={
                          chapterSelectDisabled
                            ? 'Select subject and class first'
                            : chaptersLoading
                            ? 'Loading chapters...'
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
                        <div className="px-3 py-2 text-sm text-red-500 flex items-center gap-2">
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
                <p className="text-sm text-red-500">{errors.chapter.message}</p>
              )}
            </div>

            {/* Topic Autocomplete */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Controller
                name="topic"
                control={control}
                render={({ field }) => (
                  <TopicAutocomplete
                    value={field.value}
                    onChange={field.onChange}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Exam Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((diff) => (
                  <Button
                    key={diff}
                    type="button"
                    variant={difficulty === diff ? 'default' : 'outline'}
                    className="flex-1 capitalize"
                    onClick={() => setValue('difficulty', diff)}
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Number of Questions</Label>
                <span className="text-sm font-medium">{numQuestions}</span>
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

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Limit (minutes)
                </Label>
                <span className="text-sm font-medium">{timeLimit} min</span>
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

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Generating Exam...' : 'Generate Exam'}
        </Button>
      </form>
    </div>
  );
}

export default function ExamConfigPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Generate Exam</h1>
            <p className="text-muted-foreground">Configure your practice exam</p>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-12" />
          </div>
        </div>
      }
    >
      <ExamConfigForm />
    </Suspense>
  );
}

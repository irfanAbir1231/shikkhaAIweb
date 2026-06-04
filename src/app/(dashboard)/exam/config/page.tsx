'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExamStore } from '@/lib/stores/exam-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBJECTS, DIFFICULTIES, GRADE_LEVELS } from '@/lib/utils/constants';
import { Brain, Clock, HelpCircle } from 'lucide-react';

const configSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  class_level: z.string().min(1, 'Class level is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  num_questions: z.number().min(5).max(50),
  time_limit: z.number().min(10).max(180),
});

type ConfigForm = z.infer<typeof configSchema>;

export default function ExamConfigPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setExam } = useExamStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      subject: 'science',
      topic: '',
      class_level: user?.grade_level || '8',
      difficulty: 'medium',
      num_questions: 10,
      time_limit: 30,
    },
  });

  const numQuestions = watch('num_questions');
  const timeLimit = watch('time_limit');
  const difficulty = watch('difficulty');

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
            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.slice(0, 5).map((subject) => (
                  <Button
                    key={subject}
                    type="button"
                    variant={watch('subject') === subject ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('subject', subject)}
                  >
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </Button>
                ))}
              </div>
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Photosynthesis, Force and Motion"
                {...register('topic')}
              />
              {errors.topic && <p className="text-sm text-red-500">{errors.topic.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Class Level</Label>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <Button
                    key={grade}
                    type="button"
                    variant={watch('class_level') === grade ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('class_level', grade)}
                  >
                    Class {grade}
                  </Button>
                ))}
              </div>
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
                onValueChange={(value) => setValue('num_questions', Array.isArray(value) ? value[0] : value)}
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
                onValueChange={(value) => setValue('time_limit', Array.isArray(value) ? value[0] : value)}
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

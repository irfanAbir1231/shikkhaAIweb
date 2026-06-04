'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useStudyPlanStore } from '@/lib/stores/study-plan-store';
import { StudyPlan, StudyPlanTask, DailySchedule } from '@/lib/types/study-plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SUBJECTS, GRADE_LEVELS } from '@/lib/utils/constants';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Target,
  CheckCircle2,
  Circle,
  GraduationCap,
  Brain,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';

const generateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topics: z.string().min(1, 'At least one topic is required'),
  goal: z.string().min(1, 'Goal is required'),
  total_days: z.number().min(7).max(90),
  daily_hours: z.number().min(1).max(8),
  class_level: z.string().min(1, 'Class level is required'),
});

type GenerateForm = z.infer<typeof generateSchema>;

const GOALS = [
  { value: 'exam_prep', label: 'Exam Preparation' },
  { value: 'daily_revision', label: 'Daily Revision' },
  { value: 'weak_topics', label: 'Weak Topic Focus' },
  { value: 'complete_syllabus', label: 'Complete Syllabus' },
];

const TASK_TYPE_COLORS: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  practice: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  break: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const TASK_TYPE_ICONS: Record<string, typeof Brain> = {
  study: BookOpen,
  practice: Brain,
  review: Sparkles,
  break: Clock,
};

export default function StudyPlanPage() {
  const { user } = useAuthStore();
  const { plans, generatePlan, deletePlan } = useStudyPlanStore();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailPlan, setDetailPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      subject: 'science',
      topics: '',
      goal: 'exam_prep',
      total_days: 14,
      daily_hours: 2,
      class_level: user?.grade_level || '8',
    },
  });

  const totalDays = watch('total_days');
  const dailyHours = watch('daily_hours');

  const onSubmit = async (data: GenerateForm) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsGenerating(true);
    try {
      const topics = data.topics
        .split(/[,\n]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (topics.length === 0) {
        toast.error('Please enter at least one topic');
        return;
      }

      const plan = generatePlan(user.id, {
        subject: data.subject,
        topics,
        goal: data.goal,
        total_days: data.total_days,
        daily_hours: data.daily_hours,
        class_level: data.class_level,
      });

      toast.success('Study plan generated!');
      setGenerateOpen(false);
      reset();
      setDetailPlan(plan);
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (planId: string) => {
    deletePlan(planId);
    toast.success('Study plan deleted');
    if (detailPlan?.id === planId) setDetailPlan(null);
  };

  const daysUntil = (endDate: string) => {
    const diff = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return 'Ended';
    if (diff === 0) return 'Ends today';
    return `${diff} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Study Plan</h1>
          <p className="text-muted-foreground">AI-generated study schedules with task tracking</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Generate Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No study plans yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Generate a personalized AI study schedule based on your subjects, topics, and goals.
              Track your progress day by day.
            </p>
            <Button className="mt-4" onClick={() => setGenerateOpen(true)}>
              <Sparkles className="w-4 h-4 mr-1" />
              Generate Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setDetailPlan(plan)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="capitalize">
                    {plan.subject}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(plan.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <h3 className="font-semibold text-lg mb-1">{plan.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {GOALS.find((g) => g.value === plan.goal)?.label || plan.goal}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(plan.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      —{' '}
                      {new Date(plan.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                      {daysUntil(plan.end_date)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Study Plan
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <Label htmlFor="topics">Topics (comma or line separated)</Label>
              <textarea
                id="topics"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. Photosynthesis, Cell Structure, Genetics"
                {...register('topics')}
              />
              {errors.topics && (
                <p className="text-sm text-red-500">{errors.topics.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Goal</Label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((goal) => (
                  <Button
                    key={goal.value}
                    type="button"
                    variant={watch('goal') === goal.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('goal', goal.value)}
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
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

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Duration</Label>
                <span className="text-sm font-medium">{totalDays} days</span>
              </div>
              <Slider
                value={[totalDays]}
                onValueChange={(value) =>
                  setValue('total_days', Array.isArray(value) ? value[0] : value)
                }
                min={7}
                max={90}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Daily Study Hours</Label>
                <span className="text-sm font-medium">{dailyHours} hrs</span>
              </div>
              <Slider
                value={[dailyHours]}
                onValueChange={(value) =>
                  setValue('daily_hours', Array.isArray(value) ? value[0] : value)
                }
                min={1}
                max={8}
                step={0.5}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Study Plan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {detailPlan && (
        <StudyPlanDetailDialog plan={detailPlan} onClose={() => setDetailPlan(null)} />
      )}
    </div>
  );
}

function StudyPlanDetailDialog({
  plan,
  onClose,
}: {
  plan: StudyPlan;
  onClose: () => void;
}) {
  const { toggleTask, deletePlan } = useStudyPlanStore();
  const [activeDay, setActiveDay] = useState(1);

  const schedule: DailySchedule[] = [];
  for (let d = 1; d <= plan.total_days; d++) {
    const date = new Date(plan.start_date);
    date.setDate(date.getDate() + (d - 1));
    schedule.push({
      day: d,
      date: date.toISOString().split('T')[0],
      tasks: plan.tasks.filter((t) => t.day === d),
    });
  }

  const activeSchedule = schedule.find((s) => s.day === activeDay) || schedule[0];
  const completedTasks = plan.tasks.filter((t) => t.completed && t.type !== 'break').length;
  const totalTasks = plan.tasks.filter((t) => t.type !== 'break').length;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">{plan.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {GOALS.find((g) => g.value === plan.goal)?.label} • Class {plan.class_level || ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Overview */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{plan.progress}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{plan.daily_hours}h</p>
              <p className="text-xs text-muted-foreground">Daily Target</p>
            </div>
          </div>

          <Progress value={plan.progress} className="h-2 mt-4" />

          {/* Day Selector */}
          <div className="mt-5">
            <p className="text-sm font-medium mb-2">Select Day</p>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-1.5 pb-1">
                {schedule.map((s) => {
                  const dayTasks = s.tasks.filter((t) => t.type !== 'break');
                  const dayCompleted = dayTasks.filter((t) => t.completed).length;
                  const allDone = dayTasks.length > 0 && dayCompleted === dayTasks.length;
                  return (
                    <button
                      key={s.day}
                      onClick={() => setActiveDay(s.day)}
                      className={`flex flex-col items-center min-w-[60px] px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activeDay === s.day
                          ? 'bg-primary text-primary-foreground'
                          : allDone
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span className="font-medium">Day {s.day}</span>
                      <span className="opacity-80">
                        {new Date(s.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

        {/* Tasks for Active Day */}
        <ScrollArea className="flex-1 max-h-[400px]">
          <div className="p-6 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Day {activeSchedule.day} —{' '}
                {new Date(activeSchedule.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <span className="text-xs text-muted-foreground">
                {activeSchedule.tasks.reduce((sum, t) => sum + t.duration_minutes, 0)} min total
              </span>
            </div>

            {activeSchedule.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks for this day.</p>
            ) : (
              activeSchedule.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  planId={plan.id}
                  onToggle={() => toggleTask(plan.id, task.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              deletePlan(plan.id);
              toast.success('Study plan deleted');
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Plan
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskItem({
  task,
  planId,
  onToggle,
}: {
  task: StudyPlanTask;
  planId: string;
  onToggle: () => void;
}) {
  const Icon = TASK_TYPE_ICONS[task.type] || BookOpen;
  const isBreak = task.type === 'break';

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        task.completed && !isBreak
          ? 'bg-green-50/50 border-green-200 dark:bg-green-950/10 dark:border-green-900/30'
          : 'bg-card border-border hover:bg-muted/50'
      } ${isBreak ? 'opacity-70' : ''}`}
    >
      {!isBreak && (
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
      )}
      {isBreak && <Clock className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            className={`font-medium text-sm ${
              task.completed && !isBreak ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </h4>
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-5 ${TASK_TYPE_COLORS[task.type] || ''}`}
          >
            {task.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3 inline mr-1" />
          {task.duration_minutes} min
        </p>
      </div>
    </div>
  );
}

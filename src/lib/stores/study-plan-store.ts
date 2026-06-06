'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudyPlan, StudyPlanTask, StudyPlanGenerateInput, TaskType, PlanSelection } from '@/lib/types/study-plan';

interface StudyPlanState {
  plans: StudyPlan[];
  generatePlan: (studentId: number, input: StudyPlanGenerateInput) => StudyPlan;
  toggleTask: (planId: string, taskId: string) => void;
  deletePlan: (planId: string) => void;
  getPlan: (planId: string) => StudyPlan | undefined;
}

function generateId(): string {
  return 'sp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function generateTaskId(): string {
  return 't_' + Math.random().toString(36).slice(2, 10);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

function flattenTopics(selections: PlanSelection[]): string[] {
  const topics: string[] = [];
  for (const sel of selections) {
    if (sel.topic && sel.topic.trim()) {
      topics.push(sel.topic.trim());
    } else if (sel.chapterName && sel.chapterName.trim()) {
      topics.push(sel.chapterName.trim());
    } else {
      topics.push(sel.subject.charAt(0).toUpperCase() + sel.subject.slice(1));
    }
  }
  return topics;
}

function buildSubjectLabel(selections: PlanSelection[]): string {
  const unique = Array.from(new Set(selections.map((s) => s.subject)));
  if (unique.length === 1) return unique[0];
  if (unique.length <= 2) return unique.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' & ');
  return 'Multi-Subject';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const GOAL_LABELS: Record<string, string> = {
  exam_prep: 'Exam Preparation',
  daily_revision: 'Daily Revision',
  weak_topics: 'Weak Topic Focus',
  complete_syllabus: 'Complete Syllabus',
};

const TASK_TEMPLATES: Record<string, { titles: string[]; descriptions: string[] }> = {
  study: {
    titles: [
      'Read & Understand',
      'Concept Review',
      'Chapter Study',
      'Learn Fundamentals',
      'Deep Dive',
      'Theory Session',
    ],
    descriptions: [
      'Go through the textbook and understand core concepts. Take notes on key points.',
      'Review class notes and highlight important formulas or definitions.',
      'Study the assigned chapter carefully. Focus on examples provided.',
      'Build a strong foundation by understanding basic principles thoroughly.',
      'Explore advanced aspects of the topic with real-world applications.',
      'Focus on theoretical understanding before moving to problem-solving.',
    ],
  },
  practice: {
    titles: [
      'Problem Solving',
      'Practice Questions',
      'Exercise Set',
      'Mock Problems',
      'Application Drill',
      'Worksheet Practice',
    ],
    descriptions: [
      'Solve 5-10 problems from the textbook or past papers.',
      'Attempt practice questions to test your understanding.',
      'Complete the exercise set at the end of the chapter.',
      'Work through mock exam problems under time pressure.',
      'Apply concepts to solve real-world scenario problems.',
      'Finish the assigned worksheet and check your answers.',
    ],
  },
  review: {
    titles: [
      'Revision Session',
      'Flashcard Review',
      'Summary Notes',
      'Quick Recap',
      'Error Analysis',
      'Concept Map',
    ],
    descriptions: [
      'Go over all previously studied material and consolidate learning.',
      'Use flashcards to test your memory of key facts and formulas.',
      'Create a one-page summary of everything learned this week.',
      'Quickly review main points before moving to the next topic.',
      'Analyze mistakes from previous practice sessions and correct them.',
      'Draw a concept map connecting all related ideas visually.',
    ],
  },
  break: {
    titles: [
      'Short Break',
      'Rest & Recharge',
      'Brain Break',
      'Light Refreshment',
    ],
    descriptions: [
      'Take a 10-minute walk or stretch. Avoid screens.',
      'Rest your eyes and mind. Hydrate and relax.',
      'Do something enjoyable for a few minutes to refresh.',
      'Step away from your desk. Breathe deeply and relax.',
    ],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDailyTasks(
  day: number,
  totalDays: number,
  subject: string,
  topics: string[],
  dailyMinutes: number
): StudyPlanTask[] {
  const tasks: StudyPlanTask[] = [];
  const topic = topics[Math.min(day - 1, topics.length - 1)] || topics[0] || subject;

  // Determine day type based on position in plan
  let dayType: 'intro' | 'core' | 'review' | 'exam';
  if (day <= 2) dayType = 'intro';
  else if (day >= totalDays - 2) dayType = 'exam';
  else if (day % 7 === 0) dayType = 'review';
  else dayType = 'core';

  const studyMinutes = Math.floor(dailyMinutes * 0.55);
  const practiceMinutes = Math.floor(dailyMinutes * 0.30);
  const reviewMinutes = Math.floor(dailyMinutes * 0.10);
  const breakMinutes = dailyMinutes - studyMinutes - practiceMinutes - reviewMinutes;

  if (dayType === 'intro') {
    const tmpl = TASK_TEMPLATES.study;
    tasks.push({
      id: generateTaskId(),
      day,
      title: `${pickRandom(tmpl.titles)}: ${topic}`,
      description: pickRandom(tmpl.descriptions),
      subject,
      duration_minutes: studyMinutes + reviewMinutes,
      completed: false,
      type: 'study',
    });
    if (breakMinutes > 0) {
      const bTmpl = TASK_TEMPLATES.break;
      tasks.push({
        id: generateTaskId(),
        day,
        title: pickRandom(bTmpl.titles),
        description: pickRandom(bTmpl.descriptions),
        subject,
        duration_minutes: breakMinutes,
        completed: false,
        type: 'break',
      });
    }
  } else if (dayType === 'exam') {
    const pTmpl = TASK_TEMPLATES.practice;
    tasks.push({
      id: generateTaskId(),
      day,
      title: `Mock Test: ${subject}`,
      description: 'Complete a full mock test under exam conditions. Time yourself strictly.',
      subject,
      duration_minutes: studyMinutes + practiceMinutes,
      completed: false,
      type: 'practice',
    });
    const rTmpl = TASK_TEMPLATES.review;
    tasks.push({
      id: generateTaskId(),
      day,
      title: pickRandom(rTmpl.titles),
      description: 'Review all weak areas identified during the mock test.',
      subject,
      duration_minutes: reviewMinutes,
      completed: false,
      type: 'review',
    });
  } else if (dayType === 'review') {
    const rTmpl = TASK_TEMPLATES.review;
    tasks.push({
      id: generateTaskId(),
      day,
      title: pickRandom(rTmpl.titles),
      description: pickRandom(rTmpl.descriptions),
      subject,
      duration_minutes: studyMinutes + reviewMinutes,
      completed: false,
      type: 'review',
    });
    const pTmpl = TASK_TEMPLATES.practice;
    tasks.push({
      id: generateTaskId(),
      day,
      title: pickRandom(pTmpl.titles),
      description: pickRandom(pTmpl.descriptions),
      subject,
      duration_minutes: practiceMinutes,
      completed: false,
      type: 'practice',
    });
  } else {
    // core day
    const sTmpl = TASK_TEMPLATES.study;
    tasks.push({
      id: generateTaskId(),
      day,
      title: `${pickRandom(sTmpl.titles)}: ${topic}`,
      description: pickRandom(sTmpl.descriptions),
      subject,
      duration_minutes: studyMinutes,
      completed: false,
      type: 'study',
    });
    const pTmpl = TASK_TEMPLATES.practice;
    tasks.push({
      id: generateTaskId(),
      day,
      title: pickRandom(pTmpl.titles),
      description: pickRandom(pTmpl.descriptions),
      subject,
      duration_minutes: practiceMinutes,
      completed: false,
      type: 'practice',
    });
    const rTmpl = TASK_TEMPLATES.review;
    tasks.push({
      id: generateTaskId(),
      day,
      title: pickRandom(rTmpl.titles),
      description: pickRandom(rTmpl.descriptions),
      subject,
      duration_minutes: reviewMinutes,
      completed: false,
      type: 'review',
    });
    if (breakMinutes > 5) {
      const bTmpl = TASK_TEMPLATES.break;
      tasks.push({
        id: generateTaskId(),
        day,
        title: pickRandom(bTmpl.titles),
        description: pickRandom(bTmpl.descriptions),
        subject,
        duration_minutes: breakMinutes,
        completed: false,
        type: 'break',
      });
    }
  }

  return tasks;
}

function generateStudyPlan(studentId: number, input: StudyPlanGenerateInput): StudyPlan {
  const startDate = new Date().toISOString().split('T')[0];
  const totalDays = daysBetween(startDate, input.deadline);
  const endDate = addDays(startDate, totalDays - 1);
  const dailyMinutes = input.daily_hours * 60;
  const topics = flattenTopics(input.selections);
  const subjectLabel = buildSubjectLabel(input.selections);

  const allTasks: StudyPlanTask[] = [];
  for (let day = 1; day <= totalDays; day++) {
    const dayTasks = generateDailyTasks(
      day,
      totalDays,
      subjectLabel,
      topics,
      dailyMinutes
    );
    allTasks.push(...dayTasks);
  }

  const plan: StudyPlan = {
    id: generateId(),
    student_id: studentId,
    title: `${subjectLabel} Study Plan`,
    subject: subjectLabel.toLowerCase(),
    goal: input.goal,
    topics,
    class_level: input.class_level,
    start_date: startDate,
    end_date: endDate,
    total_days: totalDays,
    daily_hours: input.daily_hours,
    tasks: allTasks,
    progress: 0,
    created_at: new Date().toISOString(),
  };

  return plan;
}

export const useStudyPlanStore = create<StudyPlanState>()(
  persist(
    (set, get) => ({
      plans: [],

      generatePlan: (studentId, input) => {
        const plan = generateStudyPlan(studentId, input);
        set((state) => ({ plans: [plan, ...state.plans] }));
        return plan;
      },

      toggleTask: (planId, taskId) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            const updatedTasks = plan.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            const completedCount = updatedTasks.filter((t) => t.completed && t.type !== 'break').length;
            const totalCount = updatedTasks.filter((t) => t.type !== 'break').length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            return { ...plan, tasks: updatedTasks, progress };
          }),
        }));
      },

      deletePlan: (planId) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
        }));
      },

      getPlan: (planId) => {
        return get().plans.find((p) => p.id === planId);
      },
    }),
    {
      name: 'study-plan-storage',
      skipHydration: true,
      partialize: (state) => ({ plans: state.plans }),
    }
  )
);

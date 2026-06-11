import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamQuestion, AnswerSubmission, ExamResponse, ExamSubmitResponse } from '@/lib/types/exam';

interface ExamState {
  exam: ExamResponse | null;
  answers: Record<string, string>;
  currentQuestionIndex: number;
  timeRemaining: number;
  isSubmitted: boolean;
  tabSwitchCount: number;
  isTimerPaused: boolean;
  lastResult: ExamSubmitResponse | null;
  isDemo: boolean;
  hasHydrated: boolean;

  setExam: (exam: ExamResponse, customTimeLimitSeconds?: number, isDemo?: boolean) => void;
  setAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  decrementTimer: () => void;
  incrementTabSwitch: () => void;
  setTimerPaused: (value: boolean) => void;
  submitExam: () => void;
  setLastResult: (result: ExamSubmitResponse | null) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      exam: null,
      answers: {},
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isSubmitted: false,
      tabSwitchCount: 0,
      isTimerPaused: false,
      lastResult: null,
      isDemo: false,
      hasHydrated: false,

      setExam: (exam, customTimeLimitSeconds?, isDemo = false) =>
        set({
          exam,
          answers: {},
          currentQuestionIndex: 0,
          timeRemaining: customTimeLimitSeconds ?? exam.questions.length * 2 * 60, // 2 min per question default
          isSubmitted: false,
          tabSwitchCount: 0,
          isTimerPaused: false,
          lastResult: null,
          isDemo,
        }),

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            (state.exam?.questions.length || 1) - 1
          ),
        })),

      prevQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
        })),

      goToQuestion: (index) =>
        set((state) => ({
          currentQuestionIndex: Math.max(
            0,
            Math.min(index, (state.exam?.questions.length || 1) - 1)
          ),
        })),

      decrementTimer: () =>
        set((state) => ({
          timeRemaining: Math.max(state.timeRemaining - 1, 0),
        })),

      incrementTabSwitch: () =>
        set((state) => ({
          tabSwitchCount: state.tabSwitchCount + 1,
        })),

      setTimerPaused: (value) => set({ isTimerPaused: value }),

      submitExam: () => set({ isSubmitted: true }),

      setLastResult: (result) => set({ lastResult: result }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      reset: () =>
        set({
          exam: null,
          answers: {},
          currentQuestionIndex: 0,
          timeRemaining: 0,
          isSubmitted: false,
          tabSwitchCount: 0,
          isTimerPaused: false,
          lastResult: null,
          isDemo: false,
        }),
    }),
    {
      name: 'exam-store',
      partialize: (state) => ({
        exam: state.exam,
        lastResult: state.lastResult,
        isDemo: state.isDemo,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

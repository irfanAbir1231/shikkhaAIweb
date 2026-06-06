import { create } from 'zustand';
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

  setExam: (exam: ExamResponse) => void;
  setAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  decrementTimer: () => void;
  incrementTabSwitch: () => void;
  setTimerPaused: (value: boolean) => void;
  submitExam: () => void;
  setLastResult: (result: ExamSubmitResponse | null) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()((set, get) => ({
  exam: null,
  answers: {},
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isSubmitted: false,
  tabSwitchCount: 0,
  isTimerPaused: false,
  lastResult: null,

  setExam: (exam) =>
    set({
      exam,
      answers: {},
      currentQuestionIndex: 0,
      timeRemaining: exam.questions.length * 2 * 60, // 2 min per question default
      isSubmitted: false,
      tabSwitchCount: 0,
      isTimerPaused: false,
      lastResult: null,
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
    }),
}));

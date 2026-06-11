/* ===================================================================
   App Tour Configuration — multi-phase guided onboarding
   =================================================================== */

export type TourPhase =
  | 'dashboard'
  | 'exam-config'
  | 'exam-session'
  | 'exam-result'
  | 'library'
  | 'study-plan'
  | 'study-companion'
  | 'spaces'
  | 'completed';

export interface TourState {
  phase: TourPhase;
  completed: boolean;
  startedAt: string | null;
}

const STORAGE_KEY = 'shikkhaai-tour-v1';

export function getTourState(): TourState {
  if (typeof window === 'undefined') {
    return { phase: 'dashboard', completed: false, startedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TourState;
  } catch {
    // ignore
  }
  return { phase: 'dashboard', completed: false, startedAt: null };
}

export function setTourState(state: TourState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markTourCompleted() {
  setTourState({ phase: 'completed', completed: true, startedAt: getTourState().startedAt });
}

export function advanceTourPhase(next: TourPhase) {
  const current = getTourState();
  setTourState({ ...current, phase: next });
}

export function resetTour() {
  setTourState({ phase: 'dashboard', completed: false, startedAt: new Date().toISOString() });
}

/* ------------------------------------------------------------------ */
/*  Step definitions per phase                                         */
/* ------------------------------------------------------------------ */

export interface TourStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  };
}

export const tourSteps: Record<TourPhase, TourStep[]> = {
  dashboard: [
    {
      element: '[data-tour="dashboard-welcome"]',
      popover: {
        title: 'Welcome to ShikkhaAI! 👋',
        description:
          'Your AI-powered adaptive learning companion. This dashboard is your command center — track progress, spot weak areas, and launch into personalized study sessions.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="dashboard-quick-actions"]',
      popover: {
        title: 'Quick Actions',
        description:
          'Jump straight into studying. Click "Take Exam" to generate a curriculum-aligned quiz, or try the Study Companion for AI help.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="dashboard-stats"]',
      popover: {
        title: 'Your Learning Stats',
        description:
          'Track your mastery percentage, study streak, exams taken, and how many weak areas need attention.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="dashboard-focus"]',
      popover: {
        title: 'Focus Areas',
        description:
          'These are topics where you need the most improvement. ShikkhaAI will generate targeted practice for these weak areas.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="dashboard-recent"]',
      popover: {
        title: 'Recent Exams',
        description:
          'Review your past attempts. Click any exam to see detailed feedback and weak subtopics. Ready to start? Click "Take Exam"!',
        side: 'top',
        align: 'start',
      },
    },
  ],

  'exam-config': [
    {
      element: '[data-tour="exam-class"]',
      popover: {
        title: 'Class 8 — Currently Available',
        description:
          'ShikkhaAI currently covers Class 8 Science curriculum (Bangladesh NCTB). More classes and subjects are coming soon!',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="exam-subject"]',
      popover: {
        title: 'Select Subject, Chapter & Topic',
        description:
          'Pick a subject, then choose a chapter from your textbook and a specific topic. The AI will generate questions based on the actual curriculum content.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="exam-settings"]',
      popover: {
        title: 'Customize Your Exam',
        description:
          'Set difficulty (Easy / Medium / Hard), number of questions, and time limit. Adjust these to match your study goals.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="exam-generate"]',
      popover: {
        title: 'Generate Your Exam',
        description:
          'Click here and the AI will create a personalized exam using Retrieval-Augmented Generation (RAG) from your curriculum PDFs.',
        side: 'top',
        align: 'center',
      },
    },
  ],

  'exam-session': [
    {
      element: '[data-tour="session-timer"]',
      popover: {
        title: 'Exam Timer',
        description:
          'Keep an eye on the clock! The timer shows how much time you have left. Red means you are running low on time.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="session-question"]',
      popover: {
        title: 'Answer the Questions',
        description:
          'MCQs are auto-graded instantly. For short-answer questions, type your response — the AI will evaluate it against the curriculum.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="session-tab-warning"]',
      popover: {
        title: '⚠️ Tab Switch Warning',
        description:
          'During exams, switching tabs triggers a warning. You get at most 3 warnings before the exam integrity is flagged. Stay focused!',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '[data-tour="session-submit"]',
      popover: {
        title: 'Submit When Ready',
        description:
          'Review all your answers, then submit. You will instantly see your score, weak subtopics, and AI-generated feedback.',
        side: 'top',
        align: 'center',
      },
    },
  ],

  'exam-result': [
    {
      element: '[data-tour="result-score"]',
      popover: {
        title: 'Your Results',
        description:
          'Here is your overall score and grade. The AI breaks down your performance by topic so you know exactly where you stand.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="result-weak"]',
      popover: {
        title: 'Weak Subtopics Identified',
        description:
          'ShikkhaAI does not just show weak topics — it pinpoints specific subtopics you missed. This granular insight helps you target exactly what to study.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="result-notes"]',
      popover: {
        title: 'Focused Study Notes',
        description:
          'Instead of full-topic notes, you get AI-generated notes focused ONLY on your weak subtopics. Save them to your library for later!',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="result-practice"]',
      popover: {
        title: 'Practice Weak Areas',
        description:
          'Click here to generate a practice exam targeting only the subtopics you got wrong. This adaptive loop accelerates your learning.',
        side: 'top',
        align: 'center',
      },
    },
  ],

  library: [
    {
      element: '[data-tour="library-tabs"]',
      popover: {
        title: 'Your Library',
        description:
          'All your saved notes and quizzes live here. Switch between Notes and Saved Quizzes to review anytime.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="library-notes"]',
      popover: {
        title: 'Saved Notes',
        description:
          'Every AI-generated note you save appears here. They are organized by topic so you can find them easily. Click to read, edit, or delete.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="library-exams"]',
      popover: {
        title: 'Saved Quizzes',
        description:
          'Bookmark any exam to revisit it later. Great for revision before finals! You can also retake saved quizzes.',
        side: 'right',
        align: 'start',
      },
    },
  ],

  'study-plan': [
    {
      element: '[data-tour="study-plan"]',
      popover: {
        title: 'Your Personalized Study Plan',
        description:
          'Based on your weak topics, ShikkhaAI builds a daily study plan. Each task targets a specific area. Click a task to mark it complete and watch your progress grow!',
        side: 'bottom',
        align: 'start',
      },
    },
  ],

  'study-companion': [
    {
      element: '[data-tour="companion-messages"]',
      popover: {
        title: 'Study Companion',
        description:
          'Your AI tutor! Ask anything about your curriculum — definitions, explanations, examples, problem-solving. Every answer is grounded in your actual textbook via RAG.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="companion-input"]',
      popover: {
        title: 'Ask Anything',
        description:
          'Type your question here. Try: "Explain photosynthesis in simple Bengali" or "Solve this math problem step by step."',
        side: 'top',
        align: 'start',
      },
    },
  ],

  spaces: [
    {
      element: '[data-tour="spaces-upload"]',
      popover: {
        title: 'Upload Your PDFs',
        description:
          'Create a study space by uploading any PDF — notes, past papers, reference books. ShikkhaAI will index it for private chat.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="spaces-chat"]',
      popover: {
        title: 'Chat With Your PDF',
        description:
          'Ask questions directly from your uploaded document. The AI only uses the content of this PDF — perfect for focused revision on specific materials.',
        side: 'top',
        align: 'start',
      },
    },
  ],

  completed: [],
};

/* ------------------------------------------------------------------ */
/*  Next phase mapping                                                 */
/* ------------------------------------------------------------------ */

export const nextPhase: Record<TourPhase, TourPhase> = {
  dashboard: 'exam-config',
  'exam-config': 'exam-session',
  'exam-session': 'exam-result',
  'exam-result': 'library',
  library: 'study-plan',
  'study-plan': 'study-companion',
  'study-companion': 'spaces',
  spaces: 'completed',
  completed: 'completed',
};

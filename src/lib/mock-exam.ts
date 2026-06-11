/* ===================================================================
   Mock Exam Data — used for the app tour demo flow
   =================================================================== */

import type { ExamQuestion, ExamResponse, ExamSubmitResponse, GeneratedNote } from '@/lib/types/exam';

export const DEMO_EXAM_ID = 0;

export const demoExam: ExamResponse = {
  exam_id: DEMO_EXAM_ID,
  student_id: 0,
  subject: 'science',
  topic: 'Force and Motion',
  difficulty: 'medium',
  source: 'mock',
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      topic: 'Force and Motion',
      subtopics: ['Newton\'s First Law'],
      subtopic_ids: [1],
      prompt: 'What does Newton\'s First Law of Motion state?',
      options: [
        'A. An object in motion stays in motion unless acted upon by a force',
        'B. Force equals mass times acceleration',
        'C. Every action has an equal and opposite reaction',
        'D. Heavier objects fall faster than lighter ones',
      ],
      marks: 1,
      correct_answer: 'A. An object in motion stays in motion unless acted upon by a force',
      explanation: 'Newton\'s First Law states that an object will remain at rest or in uniform motion unless an external force acts on it.',
    },
    {
      id: 'q2',
      type: 'mcq',
      topic: 'Force and Motion',
      subtopics: ['Friction'],
      subtopic_ids: [2],
      prompt: 'Which force opposes the relative motion between two surfaces in contact?',
      options: [
        'A. Gravitational force',
        'B. Magnetic force',
        'C. Frictional force',
        'D. Electrostatic force',
      ],
      marks: 1,
      correct_answer: 'C. Frictional force',
      explanation: 'Friction is the force that resists the relative motion of solid surfaces sliding against each other.',
    },
    {
      id: 'q3',
      type: 'short_answer',
      topic: 'Force and Motion',
      subtopics: ['Acceleration'],
      subtopic_ids: [3],
      prompt: 'Define acceleration and give its SI unit.',
      options: [],
      marks: 2,
      correct_answer: 'Acceleration is the rate of change of velocity with time. Its SI unit is m/s².',
      explanation: 'Acceleration measures how quickly velocity changes. It is calculated as change in velocity divided by change in time.',
    },
    {
      id: 'q4',
      type: 'mcq',
      topic: 'Force and Motion',
      subtopics: ['Newton\'s Second Law'],
      subtopic_ids: [4],
      prompt: 'If a force of 10 N is applied to a 2 kg mass, what is the acceleration?',
      options: [
        'A. 5 m/s²',
        'B. 20 m/s²',
        'C. 8 m/s²',
        'D. 12 m/s²',
      ],
      marks: 1,
      correct_answer: 'A. 5 m/s²',
      explanation: 'Using F = ma, a = F/m = 10 N / 2 kg = 5 m/s².',
    },
  ],
};

export const demoGeneratedNotes: GeneratedNote[] = [
  {
    id: 1,
    title: 'Newton\'s First Law of Motion',
    content: `# Newton's First Law of Motion

**Law of Inertia:** An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.

**Key Points:**
- Inertia is the tendency of objects to resist changes in motion
- The more mass an object has, the more inertia it has
- Real-world examples: passengers moving forward when a bus brakes, a book staying on a table

**Why it matters:** This law explains why we need seatbelts and why heavy objects are harder to move.`,
    topic: 'Force and Motion',
    subject: 'science',
    class_level: '8',
    source: 'ai_generated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Understanding Acceleration',
    content: `# Understanding Acceleration

**Definition:** Acceleration is the rate at which an object's velocity changes over time.

**Formula:** a = (v - u) / t

Where:
- a = acceleration
- v = final velocity
- u = initial velocity
- t = time taken

**Key Points:**
- Positive acceleration means speeding up
- Negative acceleration (deceleration) means slowing down
- SI unit is meters per second squared (m/s²)

**Practice Tip:** Always check the units before calculating. Convert km/h to m/s when needed.`,
    topic: 'Force and Motion',
    subject: 'science',
    class_level: '8',
    source: 'ai_generated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoSubmitResult: ExamSubmitResponse = {
  attempt_id: 0,
  student_id: 0,
  exam_id: DEMO_EXAM_ID,
  score_percentage: 50,
  mcq_correct: 1,
  mcq_total: 3,
  short_answer_total_marks: 2,
  short_answer_awarded_marks: 1,
  weak_topics: [],
  weak_subtopics: [
    {
      subtopic_id: 1,
      name: 'Newton\'s First Law',
      topic: 'Force and Motion',
      score: 0,
      reason: 'Incorrect MCQ answer on Newton\'s First Law',
    },
    {
      subtopic_id: 3,
      name: 'Acceleration',
      topic: 'Force and Motion',
      score: 50,
      reason: 'Partial credit on short-answer definition',
    },
  ],
  readiness_score: 50,
  short_answer_feedback: [
    {
      question_id: 'q3',
      status: 'partial',
      feedback: 'You mentioned the basic idea of acceleration but missed the SI unit.',
      awarded_marks: 1,
    },
  ],
  mcq_feedback: [
    {
      question_id: 'q1',
      correct: false,
      correct_answer: 'A. An object in motion stays in motion unless acted upon by a force',
      submitted_answer: '',
    },
    {
      question_id: 'q2',
      correct: true,
      correct_answer: 'C. Frictional force',
      submitted_answer: 'C. Frictional force',
    },
    {
      question_id: 'q4',
      correct: false,
      correct_answer: 'A. 5 m/s²',
      submitted_answer: '',
    },
  ],
  generated_notes: demoGeneratedNotes,
};

export function getDemoResultForAnswers(answers: Record<string, string>): ExamSubmitResponse {
  const questions = demoExam.questions;
  let mcqCorrect = 0;
  const mcqFeedback = demoSubmitResult.mcq_feedback.map((fb) => {
    const submitted = answers[fb.question_id] || '';
    const isCorrect = submitted === fb.correct_answer;
    if (isCorrect) mcqCorrect++;
    return {
      ...fb,
      submitted_answer: submitted,
      correct: isCorrect,
    };
  });

  const saAnswer = answers['q3'] || '';
  const saCorrectKeywords = ['rate of change of velocity', 'm/s²', 'm/s2', 'meter per second squared'];
  const saHasUnit = saCorrectKeywords.some((kw) => saAnswer.toLowerCase().includes(kw.toLowerCase()));
  const saAwarded = saHasUnit ? 2 : saAnswer.length > 10 ? 1 : 0;

  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const earnedMarks = mcqCorrect + saAwarded;
  const scorePercentage = Math.round((earnedMarks / totalMarks) * 100);

  return {
    ...demoSubmitResult,
    score_percentage: scorePercentage,
    mcq_correct: mcqCorrect,
    short_answer_awarded_marks: saAwarded,
    mcq_feedback: mcqFeedback,
    short_answer_feedback: [
      {
        question_id: 'q3',
        status: saAwarded === 2 ? 'correct' : saAwarded === 1 ? 'partial' : 'incorrect',
        feedback:
          saAwarded === 2
            ? 'Excellent! You defined acceleration correctly and included the SI unit.'
            : saAwarded === 1
              ? 'You mentioned the basic idea of acceleration but missed the SI unit (m/s²).'
              : 'Acceleration is the rate of change of velocity. Its SI unit is m/s².',
        awarded_marks: saAwarded,
      },
    ],
  };
}

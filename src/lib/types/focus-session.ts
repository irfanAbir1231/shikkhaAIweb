/**
 * Focus Session & Focus Garden Type Definitions
 */

/** A single tab-switch / visibility violation during a session */
export interface FocusViolation {
  id: string;
  timestamp: number; // ms epoch
  durationAwayMs: number; // how long the tab was hidden
  resolved: boolean; // did they return within grace period?
}

/** The integrity score for a single focus session attempt */
export interface IntegrityScore {
  totalViolations: number;
  unresolvedViolations: number;
  maxConsecutiveViolations: number;
  scorePercent: number; // 0-100
  flagged: boolean; // true if unreliable
  violations: FocusViolation[];
}

/** Current state of a plant in the Focus Garden */
export interface PlantState {
  id: string;
  name: string;
  type: 'seed' | 'sprout' | 'sapling' | 'mature' | 'withered';
  stage: number; // 0–4 mapped to type
  color: string; // Tailwind color class reference
  unlockedAt: string; // ISO date
  sessionCount: number; // how many completed sessions contributed to growth
  withered: boolean;
}

/** A single focus session attempt */
export interface FocusSession {
  id: string;
  studentId: string;
  mode: 'exam' | 'study' | 'pomodoro';
  durationMinutes: number;
  startTime: string; // ISO
  endTime?: string; // ISO
  status: 'idle' | 'running' | 'paused' | 'completed' | 'aborted' | 'timed_out';
  violations: FocusViolation[];
  integrityScore: IntegrityScore;
  plantId?: string; // associated garden plant
  notes?: string;
}

/** Student's garden profile */
export interface GardenProfile {
  studentId: string;
  totalSessionsCompleted: number;
  currentStreakDays: number;
  longestStreakDays: number;
  plants: PlantState[];
  unlockedPlantTypes: string[];
  lastSessionDate?: string; // ISO date only
}

/** Input to start a new focus session */
export interface StartFocusSessionInput {
  mode: 'exam' | 'study' | 'pomodoro';
  durationMinutes: number;
  studentId: string;
  notes?: string;
}

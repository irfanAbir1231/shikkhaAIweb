'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  FocusSession,
  FocusViolation,
  IntegrityScore,
  StartFocusSessionInput,
} from '@/lib/types/focus-session';

const DEFAULT_GRACE_PERIOD_MS = 10_000; // 10 seconds
const MAX_VIOLATIONS_BEFORE_FLAG = 3;
const FLAG_THRESHOLD_PERCENT = 60;

export interface FocusSessionHookState {
  session: FocusSession | null;
  timeRemainingMs: number;
  isRunning: boolean;
  isPaused: boolean;
  gracePeriodActive: boolean;
  graceTimeRemainingMs: number;
  warningVisible: boolean;
  integrityScore: IntegrityScore | null;
}

export interface FocusSessionActions {
  start: (input: StartFocusSessionInput) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Orchestrates a focus session with:
 * - Countdown timer
 * - Page visibility monitoring
 * - Grace period on tab switch
 * - Integrity score calculation
 * - Auto-completion / timeout logic
 */
export function useFocusSession(
  gracePeriodMs: number = DEFAULT_GRACE_PERIOD_MS,
  onComplete?: (session: FocusSession) => void,
  onAbort?: (session: FocusSession) => void,
  onTimeout?: (session: FocusSession) => void
): [FocusSessionHookState, FocusSessionActions] {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gracePeriodActive, setGracePeriodActive] = useState(false);
  const [graceTimeRemainingMs, setGraceTimeRemainingMs] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<FocusSession | null>(null);
  const violationsRef = useRef<FocusViolation[]>([]);
  const hiddenAtRef = useRef<number | null>(null);
  const consecutiveViolationsRef = useRef(0);
  const maxConsecutiveRef = useRef(0);

  // Keep ref in sync
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const calculateIntegrityScore = useCallback((): IntegrityScore => {
    const violations = violationsRef.current;
    const total = violations.length;
    const unresolved = violations.filter((v) => !v.resolved).length;
    const maxConsecutive = maxConsecutiveRef.current;

    // Score formula: start at 100, subtract 15 per unresolved violation, 5 per resolved
    let score = 100;
    violations.forEach((v) => {
      score -= v.resolved ? 5 : 15;
    });
    score = Math.max(0, Math.min(100, score));

    const flagged =
      unresolved > MAX_VIOLATIONS_BEFORE_FLAG || score < FLAG_THRESHOLD_PERCENT;

    return {
      totalViolations: total,
      unresolvedViolations: unresolved,
      maxConsecutiveViolations: maxConsecutive,
      scorePercent: Math.round(score),
      flagged,
      violations: [...violations],
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  }, []);

  const finalizeSession = useCallback(
    (status: FocusSession['status']) => {
      clearTimers();
      const now = new Date().toISOString();
      const integrity = calculateIntegrityScore();

      setSession((prev) => {
        if (!prev) return null;
        const finalized: FocusSession = {
          ...prev,
          endTime: now,
          status,
          integrityScore: integrity,
        };
        sessionRef.current = finalized;
        return finalized;
      });

      setIsRunning(false);
      setIsPaused(false);
      setGracePeriodActive(false);
      setWarningVisible(false);

      // Callbacks fire on next tick after state settles
      setTimeout(() => {
        const s = sessionRef.current;
        if (!s) return;
        if (status === 'completed' && onComplete) onComplete(s);
        if (status === 'aborted' && onAbort) onAbort(s);
        if (status === 'timed_out' && onTimeout) onTimeout(s);
      }, 0);
    },
    [clearTimers, calculateIntegrityScore, onComplete, onAbort, onTimeout]
  );

  const start = useCallback(
    (input: StartFocusSessionInput) => {
      clearTimers();
      violationsRef.current = [];
      hiddenAtRef.current = null;
      consecutiveViolationsRef.current = 0;
      maxConsecutiveRef.current = 0;

      const durationMs = input.durationMinutes * 60_000;
      const newSession: FocusSession = {
        id: `focus_${Date.now()}`,
        studentId: input.studentId,
        mode: input.mode,
        durationMinutes: input.durationMinutes,
        startTime: new Date().toISOString(),
        status: 'running',
        violations: [],
        integrityScore: {
          totalViolations: 0,
          unresolvedViolations: 0,
          maxConsecutiveViolations: 0,
          scorePercent: 100,
          flagged: false,
          violations: [],
        },
        notes: input.notes,
      };

      sessionRef.current = newSession;
      setSession(newSession);
      setTimeRemainingMs(durationMs);
      setIsRunning(true);
      setIsPaused(false);
      setGracePeriodActive(false);
      setWarningVisible(false);

      timerRef.current = setInterval(() => {
        setTimeRemainingMs((prev) => {
          if (prev <= 1000) {
            // Time's up
            finalizeSession('completed');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    },
    [clearTimers, finalizeSession]
  );

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    clearTimers();
    setIsPaused(true);
    setSession((prev) => (prev ? { ...prev, status: 'paused' } : null));
  }, [isRunning, isPaused, clearTimers]);

  const resume = useCallback(() => {
    if (!isRunning || !isPaused) return;
    setIsPaused(false);
    setSession((prev) => (prev ? { ...prev, status: 'running' } : null));

    timerRef.current = setInterval(() => {
      setTimeRemainingMs((prev) => {
        if (prev <= 1000) {
          finalizeSession('completed');
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  }, [isRunning, isPaused, finalizeSession]);

  const stop = useCallback(() => {
    finalizeSession('aborted');
  }, [finalizeSession]);

  const reset = useCallback(() => {
    clearTimers();
    setSession(null);
    setTimeRemainingMs(0);
    setIsRunning(false);
    setIsPaused(false);
    setGracePeriodActive(false);
    setWarningVisible(false);
    violationsRef.current = [];
    hiddenAtRef.current = null;
    consecutiveViolationsRef.current = 0;
    maxConsecutiveRef.current = 0;
  }, [clearTimers]);

  // Page Visibility listener
  useEffect(() => {
    const handleVisibility = () => {
      if (!sessionRef.current || sessionRef.current.status !== 'running') return;

      const now = Date.now();
      if (document.hidden) {
        // Tab hidden — start grace period
        hiddenAtRef.current = now;
        setWarningVisible(true);
        setGracePeriodActive(true);
        setGraceTimeRemainingMs(gracePeriodMs);

        // Pause main timer during grace
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Grace countdown
        const startTime = now;
        graceTimerRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, gracePeriodMs - elapsed);
          setGraceTimeRemainingMs(remaining);

          if (remaining <= 0) {
            // Grace expired → abort / timeout
            if (graceTimerRef.current) clearInterval(graceTimerRef.current);
            graceTimerRef.current = null;

            const awayMs = Date.now() - (hiddenAtRef.current ?? now);
            const violation: FocusViolation = {
              id: `vio_${Date.now()}`,
              timestamp: hiddenAtRef.current ?? now,
              durationAwayMs: awayMs,
              resolved: false,
            };
            violationsRef.current.push(violation);
            consecutiveViolationsRef.current += 1;
            maxConsecutiveRef.current = Math.max(
              maxConsecutiveRef.current,
              consecutiveViolationsRef.current
            );

            setWarningVisible(false);
            setGracePeriodActive(false);
            finalizeSession('timed_out');
          }
        }, 200);
      } else {
        // Tab visible again
        const hiddenAt = hiddenAtRef.current;
        if (!hiddenAt) return;

        const awayMs = now - hiddenAt;
        hiddenAtRef.current = null;

        // Clear grace timer
        if (graceTimerRef.current) {
          clearInterval(graceTimerRef.current);
          graceTimerRef.current = null;
        }

        // Mark violation as resolved because they returned in time
        const violation: FocusViolation = {
          id: `vio_${Date.now()}`,
          timestamp: hiddenAt,
          durationAwayMs: awayMs,
          resolved: true,
        };
        violationsRef.current.push(violation);
        consecutiveViolationsRef.current = 0; // reset consecutive because they returned

        setWarningVisible(false);
        setGracePeriodActive(false);

        // Resume main timer
        if (!timerRef.current && timeRemainingMs > 0) {
          timerRef.current = setInterval(() => {
            setTimeRemainingMs((prev) => {
              if (prev <= 1000) {
                finalizeSession('completed');
                return 0;
              }
              return prev - 1000;
            });
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [gracePeriodMs, finalizeSession, timeRemainingMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const integrityScore = session ? calculateIntegrityScore() : null;

  return [
    {
      session,
      timeRemainingMs,
      isRunning,
      isPaused,
      gracePeriodActive,
      graceTimeRemainingMs,
      warningVisible,
      integrityScore,
    },
    { start, pause, resume, stop, reset },
  ];
}

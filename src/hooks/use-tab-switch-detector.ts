'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useExamStore } from '@/lib/stores/exam-store';

export interface UseTabSwitchDetectorOptions {
  /** Whether tab-switch detection is active. Set to false after exam submission. */
  enabled: boolean;
  /** Callback fired on the 3rd (or greater) tab switch to auto-submit the exam. */
  onAutoSubmit: () => void;
}

export interface UseTabSwitchDetectorReturn {
  /** Current number of tab-switch violations detected. */
  tabSwitchCount: number;
  /** Whether the blocking warning modal is currently open. */
  isWarningOpen: boolean;
  /** Whether the exam timer is currently paused due to a tab-switch violation. */
  isTimerPaused: boolean;
  /** Call this to dismiss the warning modal and resume the exam timer. */
  acknowledgeAndResume: () => void;
}

const MAX_WARNINGS_BEFORE_AUTO_SUBMIT = 3;

/**
 * Detects tab switches using the Page Visibility API and enforces a
 * 3-strike penalty policy:
 *
 * - 1st & 2nd offense: Pause timer, show a blocking warning modal.
 *   The student must click "Acknowledge & Resume" to continue.
 * - 3rd offense: Immediately trigger auto-submission. No modal.
 *
 * The hook reads and increments the global `tabSwitchCount` from the
 * Zustand exam store so the existing banner UI stays in sync.
 */
export function useTabSwitchDetector(
  options: UseTabSwitchDetectorOptions
): UseTabSwitchDetectorReturn {
  const { enabled, onAutoSubmit } = options;

  const incrementTabSwitch = useExamStore((state) => state.incrementTabSwitch);
  const setTimerPaused = useExamStore((state) => state.setTimerPaused);
  const tabSwitchCount = useExamStore((state) => state.tabSwitchCount);

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isTimerPaused, setIsTimerPausedLocal] = useState(false);

  // Use a ref to avoid stale closure issues inside the event listener
  const isWarningOpenRef = useRef(isWarningOpen);
  const isTimerPausedRef = useRef(isTimerPaused);
  const tabSwitchCountRef = useRef(tabSwitchCount);
  const enabledRef = useRef(enabled);
  const onAutoSubmitRef = useRef(onAutoSubmit);

  // Keep refs in sync with latest state / props
  useEffect(() => {
    isWarningOpenRef.current = isWarningOpen;
  }, [isWarningOpen]);

  useEffect(() => {
    isTimerPausedRef.current = isTimerPaused;
  }, [isTimerPaused]);

  useEffect(() => {
    tabSwitchCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const handleVisibilityChange = useCallback(() => {
    if (!enabledRef.current) return;

    // We only care about the tab becoming hidden (user leaves)
    if (!document.hidden) return;

    // Increment violation count in the global store
    incrementTabSwitch();
    const newCount = tabSwitchCountRef.current + 1;
    tabSwitchCountRef.current = newCount;

    if (newCount >= MAX_WARNINGS_BEFORE_AUTO_SUBMIT) {
      // 3rd strike — auto-submit immediately, bypass modal
      onAutoSubmitRef.current();
    } else {
      // 1st or 2nd strike — pause timer and show blocking warning
      setTimerPaused(true);
      setIsTimerPausedLocal(true);
      setIsWarningOpen(true);
    }
  }, [incrementTabSwitch, setTimerPaused]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const acknowledgeAndResume = useCallback(() => {
    setIsWarningOpen(false);
    setTimerPaused(false);
    setIsTimerPausedLocal(false);
  }, [setTimerPaused]);

  return {
    tabSwitchCount,
    isWarningOpen,
    isTimerPaused,
    acknowledgeAndResume,
  };
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PageVisibilityState {
  visible: boolean;
  hiddenAt: number | null;
  visibleAt: number | null;
  awayDurationMs: number;
  violationCount: number;
}

/**
 * Tracks page visibility using the Web Page Visibility API.
 * Provides real-time state about whether the student is on the tab
 * and how long they've been away.
 */
export function usePageVisibility() {
  const [state, setState] = useState<PageVisibilityState>({
    visible: true,
    hiddenAt: null,
    visibleAt: null,
    awayDurationMs: 0,
    violationCount: 0,
  });

  const hiddenAtRef = useRef<number | null>(null);
  const violationCountRef = useRef(0);

  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    const isHidden = document.hidden;

    if (isHidden) {
      hiddenAtRef.current = now;
      setState((prev) => ({
        ...prev,
        visible: false,
        hiddenAt: now,
      }));
    } else {
      const hiddenAt = hiddenAtRef.current;
      const awayMs = hiddenAt ? now - hiddenAt : 0;
      if (hiddenAt) {
        violationCountRef.current += 1;
      }
      hiddenAtRef.current = null;
      setState((prev) => ({
        ...prev,
        visible: true,
        visibleAt: now,
        awayDurationMs: awayMs,
        violationCount: violationCountRef.current,
      }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const reset = useCallback(() => {
    hiddenAtRef.current = null;
    violationCountRef.current = 0;
    setState({
      visible: true,
      hiddenAt: null,
      visibleAt: null,
      awayDurationMs: 0,
      violationCount: 0,
    });
  }, []);

  return { ...state, reset };
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
  getTourState,
  setTourState,
  markTourCompleted,
  advanceTourPhase,
  nextPhase,
  tourSteps,
  type TourPhase,
} from '@/lib/tour';

const phaseToPath: Record<TourPhase, string> = {
  dashboard: '/',
  'exam-config': '/exam/config',
  'exam-session': '/exam/session',
  'exam-result': '/exam/result',
  library: '/library',
  'study-plan': '/study-plan',
  'study-companion': '/study-companion',
  spaces: '/spaces',
  completed: '/',
};

export function useAppTour() {
  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<Driver | null>(null);

  const cleanup = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
  }, []);

  const startPhase = useCallback(
    (phase: TourPhase) => {
      cleanup();

      const steps = tourSteps[phase];
      if (!steps || steps.length === 0) return;

      const isLastPhase = phase === 'spaces';

      const d = driver({
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        allowClose: true,
        stagePadding: 4,
        stageRadius: 12,
        popoverClass: 'shikkhaai-tour',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: isLastPhase ? 'Finish Tour 🎉' : 'Next Feature →',
        steps: steps.map((s) => ({
          element: s.element,
          popover: {
            title: s.popover.title,
            description: s.popover.description,
            side: s.popover.side,
            align: s.popover.align,
          },
        })),
        onDestroyStarted: () => {
          // When user clicks the X (close) button
          if (driverRef.current) {
            driverRef.current.destroy();
          }
        },
        onDestroyed: () => {
          driverRef.current = null;
        },
        onNextClick: () => {
          // Check if we're on the last step
          const activeIndex = driverRef.current?.getActiveIndex?.() ?? 0;
          const isLastStep = activeIndex === steps.length - 1;
          if (isLastStep) {
            const np = nextPhase[phase];
            if (np === 'completed') {
              markTourCompleted();
              if (driverRef.current) driverRef.current.destroy();
            } else {
              advanceTourPhase(np);
              const targetPath = phaseToPath[np];
              // Navigate to next page for the tour
              if (targetPath !== pathname) {
                router.push(targetPath);
              }
              if (driverRef.current) driverRef.current.destroy();
            }
          } else {
            if (driverRef.current) driverRef.current.moveNext();
          }
        },
        onPrevClick: () => {
          if (driverRef.current) driverRef.current.movePrevious();
        },
      });

      driverRef.current = d;

      // Small delay to ensure DOM elements are rendered
      setTimeout(() => {
        d.drive();
      }, 300);
    },
    [cleanup, router, pathname]
  );

  // Auto-start tour when page matches current phase
  useEffect(() => {
    const state = getTourState();
    if (state.completed) return;

    const currentPath = pathname;

    // Check if current path matches the expected path for the current phase
    let pathMatches = false;
    switch (state.phase) {
      case 'dashboard':
        pathMatches = currentPath === '/';
        break;
      case 'exam-config':
        pathMatches = currentPath === '/exam/config';
        break;
      case 'exam-session':
        pathMatches = currentPath.startsWith('/exam/session');
        break;
      case 'exam-result':
        pathMatches = currentPath.startsWith('/exam/result');
        break;
      case 'library':
        pathMatches = currentPath === '/library';
        break;
      case 'study-plan':
        pathMatches = currentPath === '/study-plan';
        break;
      case 'study-companion':
        pathMatches = currentPath === '/study-companion';
        break;
      case 'spaces':
        pathMatches = currentPath === '/spaces' || currentPath.startsWith('/spaces/');
        break;
    }

    if (pathMatches) {
      const timer = setTimeout(() => {
        startPhase(state.phase);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [pathname, startPhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    startPhase,
    cleanup,
    getState: getTourState,
    reset: () => {
      cleanup();
      setTourState({ phase: 'dashboard', completed: false, startedAt: new Date().toISOString() });
      window.location.reload();
    },
  };
}

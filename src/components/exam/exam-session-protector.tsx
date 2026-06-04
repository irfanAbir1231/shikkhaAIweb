'use client';

import * as React from 'react';
import {
  useTabSwitchDetector,
  type UseTabSwitchDetectorOptions,
} from '@/hooks/use-tab-switch-detector';
import { IntegrityWarningModal } from './integrity-warning-modal';

export interface ExamSessionProtectorProps {
  /** The exam UI content to render and protect. */
  children: React.ReactNode;
  /** Callback fired on the 3rd tab-switch to auto-submit the exam. */
  onAutoSubmit: UseTabSwitchDetectorOptions['onAutoSubmit'];
  /** Whether detection is active. Defaults to true. Set to false after submission. */
  enabled?: boolean;
}

/**
 * Wraps an exam session with anti-cheat protection.
 *
 * - Detects tab switches via the Page Visibility API
 * - Pauses the timer and shows a blocking warning on the 1st & 2nd offense
 * - Auto-submits the exam on the 3rd offense
 *
 * Usage:
 * ```tsx
 * <ExamSessionProtector onAutoSubmit={handleSubmit} enabled={!isSubmitted}>
 *   <ExamSessionContent />
 * </ExamSessionProtector>
 * ```
 */
export function ExamSessionProtector({
  children,
  onAutoSubmit,
  enabled = true,
}: ExamSessionProtectorProps) {
  const { tabSwitchCount, isWarningOpen, acknowledgeAndResume } =
    useTabSwitchDetector({
      enabled,
      onAutoSubmit,
    });

  return (
    <>
      {children}
      <IntegrityWarningModal
        open={isWarningOpen}
        onAcknowledge={acknowledgeAndResume}
        strikeCount={tabSwitchCount}
        maxStrikes={3}
      />
    </>
  );
}

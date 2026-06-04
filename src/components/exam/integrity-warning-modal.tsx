'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { ShieldAlert, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface IntegrityWarningModalProps {
  /** Controls modal visibility. */
  open: boolean;
  /** Called when the student clicks "Acknowledge & Resume". */
  onAcknowledge: () => void;
  /** Current strike count (1 or 2). */
  strikeCount: number;
  /** Maximum allowed strikes before auto-submit (default 3). */
  maxStrikes?: number;
}

/**
 * A blocking, non-dismissible warning modal shown when a student switches
 * tabs during an exam. Uses @base-ui/react/dialog primitives with a
 * z-index high enough to fully obscure the exam page (z-50 → z-[100]).
 *
 * The modal cannot be closed via Escape key, backdrop click, or a close
 * button. The student MUST click "Acknowledge & Resume" to continue.
 */
export function IntegrityWarningModal({
  open,
  onAcknowledge,
  strikeCount,
  maxStrikes = 3,
}: IntegrityWarningModalProps) {
  const remainingStrikes = maxStrikes - strikeCount;

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        {/* Backdrop — darker than normal dialogs to signal severity */}
        <DialogPrimitive.Backdrop
          data-slot="dialog-overlay"
          className={cn(
            'fixed inset-0 isolate z-[100] bg-black/60 duration-200',
            'supports-backdrop-filter:backdrop-blur-sm',
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0'
          )}
        />

        {/* Modal content */}
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            'fixed top-1/2 left-1/2 z-[101] w-full max-w-[calc(100%-2rem)]',
            '-translate-x-1/2 -translate-y-1/2 rounded-2xl bg-popover',
            'p-6 text-sm text-popover-foreground ring-1 ring-foreground/10',
            'shadow-2xl outline-none sm:max-w-md',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95'
          )}
        >
          {/* Icon header */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>

          {/* Title */}
          <DialogPrimitive.Title
            data-slot="dialog-title"
            className="text-center font-heading text-lg font-semibold leading-snug"
          >
            Exam Integrity Violation
          </DialogPrimitive.Title>

          {/* Description */}
          <DialogPrimitive.Description
            data-slot="dialog-description"
            className="mt-2 text-center text-muted-foreground"
          >
            You have left the exam tab. Leaving the exam environment is a
            violation of exam integrity rules.
          </DialogPrimitive.Description>

          {/* Strike counter */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: maxStrikes }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-colors',
                  i < strikeCount
                    ? 'bg-destructive'
                    : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Strike {strikeCount} of {maxStrikes}
            {remainingStrikes === 1
              ? ' — one more will auto-submit your exam'
              : remainingStrikes > 1
                ? ` — ${remainingStrikes} remaining`
                : ''}
          </p>

          {/* Timer paused notice */}
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Exam timer is paused until you acknowledge</span>
          </div>

          {/* Action button — full width, forced interaction */}
          <div className="mt-6">
            <Button
              onClick={onAcknowledge}
              className="w-full"
              size="lg"
            >
              Acknowledge & Resume
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

'use client';


import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusWarningModalProps {
  open: boolean;
  graceTimeRemainingMs: number;
  totalGraceMs: number;
  onReturnNow?: () => void;
}

function formatSeconds(ms: number): string {
  return Math.ceil(ms / 1000).toString();
}

export function FocusWarningModal({
  open,
  graceTimeRemainingMs,
  totalGraceMs,
  onReturnNow,
}: FocusWarningModalProps) {
  const progress = totalGraceMs > 0 ? graceTimeRemainingMs / totalGraceMs : 0;
  const showPulse = open && graceTimeRemainingMs <= 3000;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={
              `w-full max-w-sm mx-4 p-6 rounded-2xl glass border shadow-2xl ` +
              `text-center space-y-5 ` +
              `${showPulse ? 'ring-2 ring-red-500 animate-pulse' : 'ring-1 ring-border'}`
            }
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center shadow-glow">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tab Switch Detected</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Return to this tab quickly or your session will be forfeited.
                </p>
              </div>
            </div>

            {/* Countdown circle */}
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 264} 264`}
                  className={`transition-all duration-200 ${showPulse ? 'text-red-500' : 'text-brand-from'}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-3xl font-bold tabular-nums ${
                    showPulse ? 'text-red-500' : 'text-foreground'
                  }`}
                >
                  {formatSeconds(graceTimeRemainingMs)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              variant={showPulse ? 'destructive' : 'gradient'}
              className="w-full gap-2"
              onClick={onReturnNow}
            >
              I&apos;m Back — Resume Session
            </Button>

            <p className="text-xs text-muted-foreground">
              Repeated tab switches will lower your integrity score and may flag this attempt.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

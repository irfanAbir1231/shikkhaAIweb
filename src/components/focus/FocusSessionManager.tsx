'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFocusSession } from '@/hooks/use-focus-session';
import { useFocusGardenStore } from '@/lib/stores/focus-garden-store';
import { FocusTimer } from './FocusTimer';
import { FocusGarden } from './FocusGarden';
import { FocusWarningModal } from './FocusWarningModal';
import { IntegrityScoreCard } from './IntegrityScoreCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, GraduationCap, Timer, BookMarked } from 'lucide-react';
import type { StartFocusSessionInput } from '@/lib/types/focus-session';

const GRACE_MS = 10_000;

interface FocusSessionManagerProps {
  initialTopic?: string;
  initialDuration?: number;
  autoStart?: boolean;
}

export function FocusSessionManager({
  initialTopic,
  initialDuration,
  autoStart,
}: FocusSessionManagerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<StartFocusSessionInput['mode']>('study');
  const [durationMinutes, setDurationMinutes] = useState(
    initialDuration && initialDuration > 0 ? initialDuration : 25
  );
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const { startPlant, completeSession, abortSession, currentPlant } = useFocusGardenStore();

  const handleComplete = useCallback(
    (session: import('@/lib/types/focus-session').FocusSession) => {
      completeSession(session);
      setSessionCompleted(true);
    },
    [completeSession]
  );

  const handleAbort = useCallback(
    (session: import('@/lib/types/focus-session').FocusSession) => {
      abortSession(session);
      setSessionCompleted(true);
    },
    [abortSession]
  );

  const handleTimeout = useCallback(
    (session: import('@/lib/types/focus-session').FocusSession) => {
      abortSession(session);
      setSessionCompleted(true);
    },
    [abortSession]
  );

  const [state, actions] = useFocusSession(GRACE_MS, handleComplete, handleAbort, handleTimeout);

  const {
    session,
    timeRemainingMs,
    isRunning,
    isPaused,
    gracePeriodActive,
    graceTimeRemainingMs,
    warningVisible,
    integrityScore,
  } = state;

  const totalDurationMs = session ? session.durationMinutes * 60_000 : 0;
  const sessionProgress =
    totalDurationMs > 0 ? ((totalDurationMs - timeRemainingMs) / totalDurationMs) * 100 : 0;

  const handleStart = useCallback(() => {
    setSessionCompleted(false);
    const input: StartFocusSessionInput = {
      mode,
      durationMinutes,
      studentId: 'guest', // Replace with actual user ID from auth
      notes: initialTopic,
    };
    actions.start(input);
    startPlant({ ...input, id: `temp_${Date.now()}`, startTime: new Date().toISOString(), status: 'running', violations: [], integrityScore: { totalViolations: 0, unresolvedViolations: 0, maxConsecutiveViolations: 0, scorePercent: 100, flagged: false, violations: [] } });
    // Clear query params so refresh doesn't re-trigger
    router.replace('/focus-session', { scroll: false });
  }, [mode, durationMinutes, initialTopic, actions, startPlant, router]);

  // Auto-start when coming from study plan
  useEffect(() => {
    if (autoStart && initialTopic && initialDuration && initialDuration > 0 && !isRunning && !session) {
      const timer = setTimeout(() => {
        handleStart();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoStart, initialTopic, initialDuration, isRunning, session, handleStart]);

  const handleReset = useCallback(() => {
    actions.reset();
    setSessionCompleted(false);
  }, [actions]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Setup Card */}
      {!isRunning && !sessionCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Timer className="w-5 h-5 text-emerald-500" />
              Start Focus Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {initialTopic && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <BookMarked className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{initialTopic}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Session Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as StartFocusSessionInput['mode'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Study
                      </span>
                    </SelectItem>
                    <SelectItem value="exam">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Exam
                      </span>
                    </SelectItem>
                    <SelectItem value="pomodoro">
                      <span className="flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Pomodoro
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
              </div>
            </div>
            <Button size="lg" className="w-full gap-2" onClick={handleStart}>
              <Timer className="w-5 h-5" />
              Start Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Session */}
      {isRunning && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center justify-center p-6">
            <FocusGarden
              plant={currentPlant}
              isRunning={isRunning}
              sessionProgress={sessionProgress}
            />
          </Card>
          <Card className="flex flex-col items-center justify-center p-6">
            {session?.notes && (
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-[200px] truncate">
                <BookMarked className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                {session.notes}
              </p>
            )}
            <FocusTimer
              timeRemainingMs={timeRemainingMs}
              isRunning={isRunning}
              isPaused={isPaused}
              totalDurationMs={totalDurationMs}
              onPause={actions.pause}
              onResume={actions.resume}
              onStop={actions.stop}
              onReset={handleReset}
            />
          </Card>
        </div>
      )}

      {/* Session Results */}
      {sessionCompleted && session && (
        <Card>
          <CardHeader>
            <CardTitle>
              {session.status === 'completed' ? 'Session Complete!' : 'Session Ended'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntegrityScoreCard score={integrityScore} />

            <div className="flex flex-col items-center gap-4 py-4">
              <FocusGarden
                plant={currentPlant}
                isRunning={false}
                sessionProgress={100}
              />
              {session.status === 'completed' && currentPlant && !currentPlant.withered && (
                <p className="text-emerald-600 font-medium">
                  Your {currentPlant.name} grew into a {currentPlant.type}!
                </p>
              )}
              {session.status !== 'completed' && currentPlant && currentPlant.withered && (
                <p className="text-red-500 font-medium">
                  Your {currentPlant.name} withered because the session ended early.
                </p>
              )}
            </div>

            <Button className="w-full" onClick={handleReset}>
              Start New Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Warning Modal */}
      <FocusWarningModal
        open={warningVisible}
        graceTimeRemainingMs={graceTimeRemainingMs}
        totalGraceMs={GRACE_MS}
        onReturnNow={() => {
          // User clicked "I'm Back" — the visibility change handler will resume automatically
          // when they are actually back on the tab. This button is mainly for UX feedback.
          window.focus();
        }}
      />
    </div>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FocusSessionManager } from '@/components/focus/FocusSessionManager';
import { GardenGallery } from '@/components/focus/GardenGallery';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Reveal } from '@/components/motion/reveal';
import { Timer, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function FocusSessionContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || undefined;
  const durationParam = searchParams.get('duration');
  const duration = durationParam ? Number(durationParam) : undefined;
  const autoStart = searchParams.get('autoStart') === 'true';
  const [activeTab, setActiveTab] = useState('session');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 glass">
        <TabsTrigger value="session" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Timer className="w-4 h-4" />
          Focus Session
        </TabsTrigger>
        <TabsTrigger value="garden" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Flower2 className="w-4 h-4" />
          My Garden
        </TabsTrigger>
      </TabsList>

      {/* Render both panels always; toggle with CSS so state is preserved */}
      <div className={cn('mt-6', activeTab !== 'session' && 'hidden')}>
        <FocusSessionManager
          initialTopic={topic}
          initialDuration={duration}
          autoStart={autoStart}
        />
      </div>

      <div className={cn('mt-6', activeTab !== 'garden' && 'hidden')}>
        <GardenGallery />
      </div>
    </Tabs>
  );
}

export default function FocusSessionPage() {
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <Reveal>
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Focus Session</h1>
          <p className="text-muted-foreground">
            Stay in the zone, grow your garden, and track your focus integrity.
          </p>
        </div>
      </Reveal>

      <Suspense fallback={null}>
        <FocusSessionContent />
      </Suspense>
    </div>
  );
}

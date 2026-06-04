'use client';

import { FocusSessionManager } from '@/components/focus/FocusSessionManager';
import { GardenGallery } from '@/components/focus/GardenGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, Flower2 } from 'lucide-react';

export default function FocusSessionPage() {
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Focus Session</h1>
        <p className="text-muted-foreground">
          Stay in the zone, grow your garden, and track your focus integrity.
        </p>
      </div>

      <Tabs defaultValue="session" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="session" className="gap-2">
            <Timer className="w-4 h-4" />
            Focus Session
          </TabsTrigger>
          <TabsTrigger value="garden" className="gap-2">
            <Flower2 className="w-4 h-4" />
            My Garden
          </TabsTrigger>
        </TabsList>

        <TabsContent value="session" className="mt-6">
          <FocusSessionManager />
        </TabsContent>

        <TabsContent value="garden" className="mt-6">
          <GardenGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}

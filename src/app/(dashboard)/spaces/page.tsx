'use client';

import { SpacesGrid } from '@/components/spaces/spaces-grid';
import { CreateSpaceButton } from '@/components/spaces/create-space-modal';
import { useSpaces } from '@/lib/api/spaces';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Reveal } from '@/components/motion/reveal';

export default function SpacesPage() {
  const { data: spaces, isLoading, error } = useSpaces();

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load study spaces');
    }
  }, [error]);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Study Spaces</h1>
            <p className="text-muted-foreground">
              Organize your study materials and chat with AI about your documents
            </p>
          </div>
          <CreateSpaceButton />
        </div>
      </Reveal>

      <SpacesGrid spaces={spaces} isLoading={isLoading} />
    </div>
  );
}

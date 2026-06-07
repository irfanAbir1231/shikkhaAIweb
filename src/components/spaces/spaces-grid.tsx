'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StudySpace } from '@/lib/types/spaces';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { BookOpen, FileText } from 'lucide-react';

interface SpacesGridProps {
  spaces: StudySpace[] | undefined;
  isLoading: boolean;
}

function SpaceCard({ space }: { space: StudySpace }) {
  return (
    <Link href={`/spaces/${space.id}`} className="block">
      <Card variant="glass" interactive className="h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="capitalize glass">
              {space.subject || 'General'}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {space.document_count} doc{space.document_count !== 1 ? 's' : ''}
            </span>
          </div>

          <h3 className="font-semibold text-lg mb-1">{space.name}</h3>

          {space.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
              {space.description}
            </p>
          )}

          {!space.description && <div className="flex-1" />}

          {space.class_level ? (
            <p className="text-xs text-muted-foreground">
              Class {space.class_level}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {space.document_count} document{space.document_count !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function SpacesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl glass p-5 space-y-3 h-full">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-20 skeleton-shimmer" />
            <Skeleton className="h-4 w-16 skeleton-shimmer" />
          </div>
          <Skeleton className="h-6 w-3/4 skeleton-shimmer" />
          <Skeleton className="h-4 w-full skeleton-shimmer" />
          <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
          <Skeleton className="h-3 w-16 skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SpacesGrid({ spaces, isLoading }: SpacesGridProps) {
  if (isLoading) {
    return <SpacesSkeleton />;
  }

  if (!spaces || spaces.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">No study spaces yet</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Create your first study space to upload PDFs, organize your materials, and chat with AI about your documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" gap={0.06}>
      {spaces.map((space) => (
        <StaggerItem key={space.id}>
          <SpaceCard space={space} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

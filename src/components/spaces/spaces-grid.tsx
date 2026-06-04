'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StudySpace } from '@/lib/types/spaces';
import { BookOpen, FileText } from 'lucide-react';

interface SpacesGridProps {
  spaces: StudySpace[] | undefined;
  isLoading: boolean;
}

function SpaceCard({ space }: { space: StudySpace }) {
  return (
    <Link href={`/spaces/${space.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="capitalize">
              {space.subject}
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

          {space.class_level && (
            <p className="text-xs text-muted-foreground">
              Class {space.class_level}
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
        <Card key={i} className="h-full">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
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
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No study spaces yet</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Create your first study space to upload PDFs, organize your materials, and chat with AI about your documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {spaces.map((space) => (
        <SpaceCard key={space.id} space={space} />
      ))}
    </div>
  );
}

'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useNotes } from '@/hooks/use-notes';
import { useSavedNotes, useSaveNote } from '@/lib/api/notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Bookmark, Save, FileText, Sparkles, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';


export default function PersonalizedNotesPage() {
  const user = useAuthStore((s) => s.user);
  // Fetch focused practice notes
  const { data: notes, isLoading } = useNotes('focused_practice');
  const { data: savedNotes } = useSavedNotes();
  const saveNote = useSaveNote();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please log in to view personalized notes.</p>
      </div>
    );
  }

  const focusedNotes = notes?.filter((n) => n.source === 'focused_practice') || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Reveal>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Personalized Notes
            </h1>
            <p className="text-muted-foreground">
              AI-generated notes focused only on your weak subtopics.
            </p>
          </div>
        </div>
      </Reveal>

      <Tabs defaultValue="focused" className="w-full">
        <Reveal delay={0.1}>
          <TabsList className="glass">
            <TabsTrigger value="focused" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              Focused Notes
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bookmark className="w-3.5 h-3.5" />
              Saved Notes
            </TabsTrigger>
          </TabsList>
        </Reveal>

        <TabsContent value="focused" className="space-y-4 mt-4">
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl glass p-4 space-y-3"
                >
                  <Skeleton className="h-5 w-2/3 skeleton-shimmer" />
                  <Skeleton className="h-3 w-1/3 skeleton-shimmer" />
                  <Skeleton className="h-32 w-full skeleton-shimmer" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20 skeleton-shimmer" />
                    <Skeleton className="h-8 w-24 skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && focusedNotes.length === 0 && (
            <Reveal>
              <Card variant="glass" className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">No Focused Notes Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2 text-sm leading-relaxed">
                    Take exams and submit answers. Focused notes will be
                    auto-generated for your weak subtopics.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          )}

          <Stagger className="grid gap-4 md:grid-cols-2" gap={0.08}>
            {focusedNotes.map((note) => (
              <StaggerItem key={note.id}>
                <Card variant="glass" className="overflow-hidden hover-lift">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">
                        {note.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="shrink-0 bg-primary/10 text-primary border-primary/20"
                      >
                        Focused
                      </Badge>
                    </div>
                    {note.topic && (
                      <p className="text-xs text-muted-foreground">
                        Topic: {note.topic}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="prose prose-sm dark:prose-invert max-h-48 overflow-y-auto pr-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {note.content}
                      </ReactMarkdown>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          saveNote.mutate({
                            noteId: note.id,
                            bookmarked: false,
                          })
                        }
                        className="glass hover-lift"
                      >
                        <Save className="w-3 h-3 mr-1.5" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          saveNote.mutate({
                            noteId: note.id,
                            bookmarked: true,
                          })
                        }
                        className="hover-lift"
                      >
                        <Bookmark className="w-3 h-3 mr-1.5" />
                        Bookmark
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4 mt-4">
          {!savedNotes || savedNotes.length === 0 ? (
            <Reveal>
              <Card variant="glass" className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">No Saved Notes</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2 text-sm leading-relaxed">
                    Save notes from the Focused Notes tab to see them here.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ) : (
            <Stagger className="grid gap-4 md:grid-cols-2" gap={0.08}>
              {savedNotes.map((saved) => (
                <StaggerItem key={saved.id}>
                  <Card
                    variant={saved.bookmarked ? 'gradient' : 'glass'}
                    className="overflow-hidden hover-lift"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base leading-snug">
                          {saved.title}
                        </CardTitle>
                        {saved.bookmarked && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Bookmark className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                              Bookmarked
                            </span>
                          </div>
                        )}
                      </div>
                      {saved.topic && (
                        <p className="text-xs text-muted-foreground">
                          Topic: {saved.topic}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Saved on{' '}
                          {new Date(saved.saved_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

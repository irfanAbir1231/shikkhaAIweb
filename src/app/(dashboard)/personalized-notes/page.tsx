'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useNotes } from '@/hooks/use-notes';
import { useSavedNotes, useSaveNote } from '@/lib/api/notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Bookmark, Save, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PersonalizedNotesPage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id ?? 0;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personalized Notes</h1>
          <p className="text-muted-foreground mt-1">
            AI-generated notes focused only on your weak subtopics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="focused" className="w-full">
        <TabsList>
          <TabsTrigger value="focused">Focused Notes</TabsTrigger>
          <TabsTrigger value="saved">Saved Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="focused" className="space-y-4">
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          )}

          {!isLoading && focusedNotes.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Focused Notes Yet</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Take exams and submit answers. Focused notes will be auto-generated for your weak subtopics.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {focusedNotes.map((note) => (
              <Card key={note.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <Badge variant="secondary">Focused</Badge>
                  </div>
                  {note.topic && (
                    <p className="text-xs text-muted-foreground">Topic: {note.topic}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="prose prose-sm dark:prose-invert max-h-48 overflow-y-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content}
                    </ReactMarkdown>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveNote.mutate({ noteId: note.id, bookmarked: false })}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveNote.mutate({ noteId: note.id, bookmarked: true })}
                    >
                      <Bookmark className="w-3 h-3 mr-1" />
                      Bookmark
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {!savedNotes || savedNotes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Saved Notes</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Save notes from the Focused Notes tab to see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedNotes.map((saved) => (
                <Card key={saved.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{saved.title}</CardTitle>
                      {saved.bookmarked && <Bookmark className="w-4 h-4 text-primary fill-primary" />}
                    </div>
                    {saved.topic && (
                      <p className="text-xs text-muted-foreground">Topic: {saved.topic}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Saved on {new Date(saved.saved_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteResponse } from '@/lib/types/notes';
import { SavedExam } from '@/lib/types/exam';
import { toast } from 'sonner';
import { useSavedExams, useUnsaveExam, useToggleExamBookmark } from '@/lib/api/exams';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { BookOpen, Plus, Search, Trash2, FileText, Bookmark, BookmarkX, Trash } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


async function fetchNotes(): Promise<NoteResponse[]> {
  const res = await fetch('/api/proxy/notes');
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch notes');
  return data.data;
}

export default function LibraryPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteResponse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
    enabled: !!user,
  });

  const createNote = useMutation({
    mutationFn: async (note: { title: string; content: string; topic: string; subject: string }) => {
      const res = await fetch('/api/proxy/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNewNoteOpen(false);
      toast.success('Note created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/proxy/notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
  });

  const filteredNotes = data?.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notesByTopic = filteredNotes?.reduce((acc, note) => {
    const topic = note.topic || 'Uncategorized';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(note);
    return acc;
  }, {} as Record<string, NoteResponse[]>);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Library</h1>
            <p className="text-muted-foreground">Your saved notes and quizzes</p>
          </div>
          <Dialog open={newNoteOpen} onOpenChange={setNewNoteOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Note</DialogTitle>
              </DialogHeader>
              <NewNoteForm onSubmit={(data) => createNote.mutate(data)} isLoading={createNote.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </Reveal>

      <AIInsightCard>
        Your library is your personal knowledge base. Notes from weak-topic practice and exam reviews are auto-saved here. Use the search to quickly find what you need.
      </AIInsightCard>

      <Tabs defaultValue="notes">
        <TabsList className="glass">
          <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Notes
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Saved Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-10 glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : !filteredNotes || filteredNotes.length === 0 ? (
            <Card variant="glass">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">No notes yet.</p>
                <p className="text-sm text-muted-foreground">
                  Create notes manually or generate them from exam results.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(notesByTopic || {}).map(([topic, notes]) => (
                <div key={topic}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">{topic}</h3>
                  <Stagger className="grid gap-3 md:grid-cols-2" gap={0.06}>
                    {notes.map((note) => (
                      <StaggerItem key={note.id}>
                        <Card
                          variant="glass"
                          interactive
                          className="cursor-pointer"
                          onClick={() => setSelectedNote(note)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{note.title}</h4>
                                <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-2 text-sm text-muted-foreground mt-1">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {note.content}
                                  </ReactMarkdown>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs glass">
                                    {note.source}
                                  </Badge>
                                  {note.subject && (
                                    <Badge variant="outline" className="text-xs glass">
                                      {note.subject}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 hover-lift"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote.mutate(note.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4 mt-4">
          <SavedQuizzesTab />
        </TabsContent>
      </Tabs>

      {/* Note Detail Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
            <DialogDescription>
              {selectedNote?.topic && (
                <Badge variant="secondary" className="mt-1 glass">
                  {selectedNote.topic}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selectedNote?.content || ''}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SavedQuizzesTab() {
  const { data: savedExams, isLoading } = useSavedExams();
  const unsave = useUnsaveExam();
  const toggleBookmark = useToggleExamBookmark();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (!savedExams || savedExams.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Saved Quizzes</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Save exams from your history or result page to revisit them later.
          </p>
          <Link href="/exam/history" className="inline-block mt-4">
            <Button>Go to Exam History</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stagger className="grid gap-3 md:grid-cols-2" gap={0.06}>
      {savedExams.map((exam) => (
        <StaggerItem key={exam.id}>
          <SavedQuizCard
            exam={exam}
            onUnsave={() => unsave.mutate(exam.exam_id)}
            onToggleBookmark={() => toggleBookmark.mutate(exam.exam_id)}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function SavedQuizCard({
  exam,
  onUnsave,
  onToggleBookmark,
}: {
  exam: SavedExam;
  onUnsave: () => void;
  onToggleBookmark: () => void;
}) {
  return (
    <Card variant="glass" className="hover-lift transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{exam.subject} — {exam.topic}</h4>
              <Badge variant="outline" className="text-xs capitalize glass">{exam.difficulty}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {exam.num_questions} questions • Saved on {new Date(exam.saved_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleBookmark}
              title={exam.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              className="hover-lift"
            >
              {exam.bookmarked ? (
                <Bookmark className="w-4 h-4 text-primary fill-primary" />
              ) : (
                <BookmarkX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUnsave}
              title="Remove from saved"
              className="hover-lift"
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <Link href={`/exam/result/${exam.exam_id}`}>
            <Button size="sm" variant="outline" className="w-full glass hover-lift">
              View Result
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function NewNoteForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { title: string; content: string; topic: string; subject: string }) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, topic, subject });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Note'}
      </Button>
    </form>
  );
}

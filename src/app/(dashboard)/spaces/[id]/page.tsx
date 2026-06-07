'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSpaceDocuments } from '@/lib/api/spaces';
import { PdfUploader } from '@/components/spaces/pdf-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIInsightCard } from '@/components/ui/ai-insight-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function SpaceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const {
    data: documents,
    isLoading: docsLoading,
    error: docsError,
  } = useSpaceDocuments(id);

  useEffect(() => {
    if (docsError) {
      toast.error(docsError.message || 'Failed to load documents');
    }
  }, [docsError]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Reveal>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/spaces')} className="hover-lift">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Study Space</h1>
            <p className="text-sm text-muted-foreground">
              Manage your documents and upload new materials
            </p>
          </div>
        </div>
      </Reveal>

      {/* AI Insight */}
      <Reveal>
        <AIInsightCard>
          Upload your class notes, textbooks, or reference PDFs. The AI will index them so you can ask questions, generate summaries, and get explanations tailored to your materials.
        </AIInsightCard>
      </Reveal>

      {/* Upload Section */}
      <Reveal>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Upload PDF Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PdfUploader spaceId={id} />
          </CardContent>
        </Card>
      </Reveal>

      {/* Documents List */}
      <Reveal>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              Documents
              {documents && (
                <Badge variant="secondary" className="ml-1">
                  {documents.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass">
                    <Skeleton className="h-8 w-8 rounded-lg skeleton-shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
                      <Skeleton className="h-3 w-24 skeleton-shimmer" />
                    </div>
                    <Skeleton className="h-5 w-16 skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center mx-auto mb-3 shadow-glow">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <p className="text-muted-foreground font-medium">No documents yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload PDFs above to start building your knowledge base.
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <Stagger gap={0.04} className="space-y-2">
                  {documents.map((doc) => (
                    <StaggerItem key={doc.id}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl glass hover-lift transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0 shadow-glow">
                          <FileText className="w-4 h-4 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.original_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.file_size_bytes)}
                          </p>
                        </div>

                        {doc.is_indexed ? (
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-400/20"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Indexed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 border-amber-400/30 text-amber-600 bg-amber-500/5">
                            <Clock className="w-3 h-3 mr-1" />
                            Processing
                          </Badge>
                        )}
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSpaceDocuments, useUploadDocument } from '@/lib/api/spaces';
import { PdfUploader } from '@/components/spaces/pdf-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/spaces')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Study Space</h1>
          <p className="text-sm text-muted-foreground">
            Manage your documents and upload new materials
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" />
            Upload PDF Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PdfUploader spaceId={id} />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-5 h-5 text-primary" />
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
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No documents yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload PDFs above to start building your knowledge base.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
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
                        className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Indexed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Processing
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

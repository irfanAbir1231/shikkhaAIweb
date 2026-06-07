'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploadDocument } from '@/lib/api/spaces';
import { AILoader } from '@/components/ui/ai-loader';
import { Upload, FileCheck, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPE = 'application/pdf';

interface PdfUploaderProps {
  spaceId: string;
}

export function PdfUploader({ spaceId }: PdfUploaderProps) {
  const uploadMutation = useUploadDocument(spaceId);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadMutation.isPending;

  const validateFile = (file: File): string | null => {
    if (file.type !== ALLOWED_TYPE && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File exceeds the 50 MB maximum size limit.';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadProgress(0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  }, [isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [isUploading, handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(
        { file: selectedFile, onProgress: setUploadProgress },
        {
          onSuccess: () => {
            toast.success(`"${selectedFile.name}" uploaded successfully`);
            setSelectedFile(null);
            setUploadProgress(0);
          },
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message);
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          isDragging && !isUploading && 'border-primary bg-primary/5',
          !isDragging && !isUploading && 'border-border/50 glass hover:bg-muted/20 hover:border-brand-from/30',
          isUploading && 'cursor-not-allowed opacity-60'
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <AILoader compact label="Uploading..." />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse — PDF only, max 50 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected file preview */}
      {selectedFile && !isUploading && (
        <div className="flex items-center gap-3 p-3 rounded-xl glass hover-lift">
          <FileCheck className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover-lift" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate max-w-[70%]">
              Uploading {selectedFile?.name}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {uploadProgress}%
            </span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !isUploading && (
        <Button onClick={handleUpload} variant="gradient" className="w-full">
          <Upload className="w-4 h-4 mr-1" />
          Upload PDF
        </Button>
      )}

      {/* Error hint */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Only PDF files up to 50 MB are supported.</span>
      </div>
    </div>
  );
}

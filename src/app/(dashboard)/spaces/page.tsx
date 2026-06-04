'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function SpacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Spaces</h1>
        <p className="text-muted-foreground">Create spaces for your study materials</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Study Spaces feature coming soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will let you upload PDFs, create topic-specific collections, and chat with AI about your documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

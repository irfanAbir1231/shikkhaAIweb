'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateSpace } from '@/lib/api/spaces';
import { SUBJECTS, GRADE_LEVELS } from '@/lib/utils/constants';
import { Plus, Loader2 } from 'lucide-react';

const createSpaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  subject: z.string().min(1, 'Subject is required'),
  class_level: z.string().min(1, 'Class level is required'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
});

type CreateSpaceForm = z.infer<typeof createSpaceSchema>;

export function CreateSpaceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="gradient">
        <Plus className="w-4 h-4 mr-1" />
        Create Space
      </Button>
      <CreateSpaceModal open={open} onOpenChange={setOpen} />
    </>
  );
}

interface CreateSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceModal({ open, onOpenChange }: CreateSpaceModalProps) {
  const createSpace = useCreateSpace();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClassLevel, setSelectedClassLevel] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateSpaceForm>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: '',
      subject: '',
      class_level: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateSpaceForm) => {
    try {
      await createSpace.mutateAsync({
        name: data.name,
        subject: data.subject,
        class_level: data.class_level,
        description: data.description || '',
      });
      toast.success('Study space created successfully');
      reset();
      setSelectedSubject('');
      setSelectedClassLevel('');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create space';
      toast.error(message);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setValue('subject', subject, { shouldValidate: true });
  };

  const handleClassLevelSelect = (level: string) => {
    setSelectedClassLevel(level);
    setValue('class_level', level, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Study Space</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Space Name</Label>
            <Input
              id="name"
              placeholder="e.g. Biology Chapter 5 Notes"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.slice(0, 5).map((subject) => (
                <Button
                  key={subject}
                  type="button"
                  variant={selectedSubject === subject ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </Button>
              ))}
            </div>
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          {/* Class Level */}
          <div className="space-y-2">
            <Label>Class Level</Label>
            <div className="flex flex-wrap gap-2">
              {GRADE_LEVELS.map((grade) => (
                <Button
                  key={grade}
                  type="button"
                  variant={selectedClassLevel === grade ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => handleClassLevelSelect(grade)}
                >
                  Class {grade}
                </Button>
              ))}
            </div>
            {errors.class_level && (
              <p className="text-sm text-red-500">{errors.class_level.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Add a short description about this study space..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={createSpace.isPending}
          >
            {createSpace.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Space'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

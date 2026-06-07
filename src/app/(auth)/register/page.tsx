'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AILoader } from '@/components/ui/ai-loader';
import { GraduationCap } from 'lucide-react';
import { GRADE_LEVELS } from '@/lib/utils/constants';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name too long'),
  email: z.string().email('Invalid email address'),
  grade_level: z.string().min(1, 'Grade level is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error || 'Registration failed');
        return;
      }

      setUser(result.data.student);
      toast.success('Account created successfully!');
      router.push('/onboarding');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="border-0 shadow-soft">
      {/* Mobile-only logo */}
      <CardHeader className="text-center pb-2">
        <div className="lg:hidden mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <GraduationCap className="size-7" />
        </div>
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>Join ShikkhaAI and start learning smarter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              autoFocus
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="h-11 transition-all duration-200 focus-visible:scale-[1.01] focus-visible:shadow-glow"
              {...register('name')}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="h-11 transition-all duration-200 focus-visible:scale-[1.01] focus-visible:shadow-glow"
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade Level</Label>
            <Select
              onValueChange={(value: string | null) => {
                if (value) setValue('grade_level', value, { shouldValidate: true });
              }}
            >
              <SelectTrigger
                id="grade"
                aria-invalid={errors.grade_level ? 'true' : 'false'}
                aria-describedby={errors.grade_level ? 'grade-error' : undefined}
                className="h-11 transition-all duration-200 focus:scale-[1.01] focus:shadow-glow"
              >
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_LEVELS.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    Class {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.grade_level && (
              <p id="grade-error" className="text-sm text-destructive" role="alert">
                {errors.grade_level.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              autoComplete="new-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="h-11 transition-all duration-200 focus-visible:scale-[1.01] focus-visible:shadow-glow"
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <AILoader compact label="Creating account…" />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

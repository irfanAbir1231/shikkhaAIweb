'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AILoader } from '@/components/ui/ai-loader';
import { GradientText } from '@/components/ui/gradient-text';
import { GraduationCap, Eye, EyeOff, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error || 'Login failed');
        return;
      }

      setUser(result.data.student);
      toast.success('Welcome back!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
          <GraduationCap className="size-5 text-primary" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight">ShikkhaAI</span>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="font-display text-2xl font-bold">
          Welcome <GradientText animated>back</GradientText>
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your ShikkhaAI account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="h-11 bg-white/[0.03] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 transition-all"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive animate-shake" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
            <Link 
              href="#" 
              className="text-xs text-primary/80 hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Password reset coming soon!');
              }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="h-11 pr-10 bg-white/[0.03] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 transition-all"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive animate-shake" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="xl"
          className="w-full font-semibold h-11"
          disabled={isLoading}
        >
          {isLoading ? (
            <AILoader compact label="Signing in…" />
          ) : (
            <>
              <Sparkles className="size-4 mr-2" />
              Sign In
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}

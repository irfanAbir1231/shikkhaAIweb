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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AILoader } from '@/components/ui/ai-loader';
import { GradientText } from '@/components/ui/gradient-text';
import { GraduationCap, Eye, EyeOff, Sparkles, Check, X } from 'lucide-react';
import { GRADE_LEVELS } from '@/lib/utils/constants';
import { triggerSuccess } from '@/lib/utils/confetti';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name too long'),
  email: z.string().email('Invalid email address'),
  grade_level: z.string().min(1, 'Grade level is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
});

type RegisterForm = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ characters', met: password.length >= 6 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;
  const colors = ['bg-destructive', 'bg-warning', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

  return (
    <div className="space-y-2">
      <div className="flex gap-1 h-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`flex items-center gap-1 text-[11px] transition-colors ${
              check.met ? 'text-emerald-400' : 'text-white/30'
            }`}
          >
            {check.met ? <Check className="size-3" /> : <X className="size-3" />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

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
      triggerSuccess();
      toast.success('Account created successfully!');
      router.push('/onboarding');
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
          Create <GradientText animated>account</GradientText>
        </h1>
        <p className="text-sm text-muted-foreground">
          Join ShikkhaAI and start learning smarter
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-foreground/80">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            autoComplete="name"
            autoFocus
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className="h-11 bg-white/[0.03] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 transition-all"
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive animate-shake" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
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
          <Label htmlFor="grade" className="text-sm font-medium text-foreground/80">Grade Level</Label>
          <Select
            onValueChange={(value: string | null) => {
              if (value) setValue('grade_level', value, { shouldValidate: true });
            }}
          >
            <SelectTrigger
              id="grade"
              aria-invalid={errors.grade_level ? 'true' : 'false'}
              aria-describedby={errors.grade_level ? 'grade-error' : undefined}
              className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all"
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
            <p id="grade-error" className="text-sm text-destructive animate-shake" role="alert">
              {errors.grade_level.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              autoComplete="new-password"
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
          {password.length > 0 && <PasswordStrength password={password} />}
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
            <AILoader compact label="Creating account…" />
          ) : (
            <>
              <Sparkles className="size-4 mr-2" />
              Create Account
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0c0a18] px-3 text-muted-foreground uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-10 bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
          onClick={() => toast.info('Google login coming soon!')}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          className="h-10 bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
          onClick={() => toast.info('Apple login coming soon!')}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.57-.99 4.15-.84 1.57.13 2.73.74 3.53 1.89-3.27 1.78-2.13 5.98.22 7.13-.57 1.5-1.31 2.99-2.98 5.05zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

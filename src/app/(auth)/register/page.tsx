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

      <p className="mt-5 text-center text-sm text-muted-foreground">
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

'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { GraduationCap, Sparkles, BrainCircuit, Target, BookOpen } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';

const VALUE_PROPS = [
  { text: 'Adaptive exams that learn with you', icon: BrainCircuit },
  { text: 'AI-powered study recommendations', icon: Sparkles },
  { text: 'Track your mastery in real-time', icon: Target },
  { text: 'Curriculum-aligned for Bangladesh', icon: BookOpen },
];

function RotatingValueProps() {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % VALUE_PROPS.length), 3000);
    return () => clearInterval(id);
  }, [reduce]);

  const item = VALUE_PROPS[index];
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <span className="grid size-8 place-items-center rounded-lg bg-white/15 backdrop-blur-sm">
        <Icon className="size-4 text-white" />
      </span>
      <div className="h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {item.text}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-1/3 flex-col justify-between overflow-hidden bg-brand-gradient p-10">
        {/* Subtle grain + vignette overlay for depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,0,0,0.25), transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/15 backdrop-blur-sm shadow-lg">
              <GraduationCap className="size-6 text-white" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-white">ShikkhaAI</span>
          </div>
        </div>

        {/* Middle: Tagline */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Learn smarter,{' '}
            <GradientText as="span" animated className="text-white">
              not harder
            </GradientText>
          </h1>
          <p className="max-w-xs text-base leading-relaxed text-white/70">
            Your personal AI companion for Bangladesh curriculum — adaptive exams, instant feedback, and mastery tracking.
          </p>
        </div>

        {/* Bottom: rotating value prop */}
        <div className="relative z-10">
          <RotatingValueProps />
          <p className="mt-6 text-xs text-white/40">
            &copy; {new Date().getFullYear()} ShikkhaAI. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

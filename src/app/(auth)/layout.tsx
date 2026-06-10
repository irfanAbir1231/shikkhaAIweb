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

/* Pure CSS mountain + aurora scene */
function AuroraScene() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Deep night sky base */}
      <div className="absolute inset-0 bg-[#0c0a18]" />

      {/* Aurora bands */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[80%] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.35) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute -top-1/4 right-0 w-[120%] h-[70%] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.3) 0%, transparent 55%)',
          filter: 'blur(90px)',
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-[80%] h-[60%] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.25) 0%, transparent 50%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            opacity: Math.random() * 0.6 + 0.2,
          }}
        />
      ))}

      {/* Mountain silhouettes */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: '45%' }}
      >
        <path
          fill="rgba(10,10,25,0.95)"
          d="M0,320 L0,180 C80,160 160,200 240,170 C320,140 400,100 480,130 C560,160 640,220 720,200 C800,180 880,110 960,90 C1040,70 1120,120 1200,150 C1280,180 1360,160 1440,140 L1440,320 Z"
        />
        <path
          fill="rgba(15,12,35,0.85)"
          d="M0,320 L0,220 C100,200 200,240 300,210 C400,180 500,130 600,160 C700,190 800,250 900,230 C1000,210 1100,140 1200,120 C1300,100 1380,140 1440,130 L1440,320 Z"
        />
        <path
          fill="rgba(20,15,40,0.7)"
          d="M0,320 L0,260 C120,240 240,280 360,250 C480,220 600,170 720,200 C840,230 960,280 1080,260 C1200,240 1320,190 1440,180 L1440,320 Z"
        />
      </svg>

      {/* Bottom vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(12,10,24,0.9) 0%, transparent 40%)',
        }}
      />
    </div>
  );
}

function FloatingParticles() {
  const particles = React.useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/15"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

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
    <div className="flex items-center gap-3 text-sm text-white/60">
      <span className="grid size-7 place-items-center rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="size-3.5 text-white/80" />
      </span>
      <div className="h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
    <div className="relative flex min-h-screen bg-[#0c0a18]">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between overflow-hidden">
        <AuroraScene />
        <FloatingParticles />

        {/* Noise texture overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Top: Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-10"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <GraduationCap className="size-5 text-white" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-white/90">ShikkhaAI</span>
          </div>
        </motion.div>

        {/* Middle spacer */}
        <div className="flex-1" />

        {/* Bottom: Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 p-10 space-y-5"
        >
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
            Learn smarter,{' '}
            <GradientText as="span" animated>not harder</GradientText>
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-white/50">
            Your personal AI companion for Bangladesh curriculum — adaptive exams, instant feedback, and mastery tracking.
          </p>
          <RotatingValueProps />
          <p className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} ShikkhaAI
          </p>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}

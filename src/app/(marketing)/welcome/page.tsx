'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  BrainCircuit,
  Sparkles,
  Target,
  Zap,
  Users,
  MessageSquare,
  TrendingUp,
  Brain,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

import { GradientText } from '@/components/ui/gradient-text';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { KnowledgeGraph } from '@/components/adaptive';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Lazy-load below-fold heavy adaptive components                     */
/* ------------------------------------------------------------------ */

const LearningPath = dynamic(
  () => import('@/components/adaptive').then((m) => ({ default: m.LearningPath })),
  { ssr: false }
);

/* ------------------------------------------------------------------ */
/*  Dummy data                                                         */
/* ------------------------------------------------------------------ */

const heroGraphNodes = [
  { id: 'b1', name: 'বাংলা ব্যাকরণ', mastery: 85, group: 'Bangla' },
  { id: 'b2', name: 'পদ প্রকরণ', mastery: 72, group: 'Bangla' },
  { id: 'b3', name: 'বাক্য সংকোচন', mastery: 45, isWeak: true, group: 'Bangla' },
  { id: 'e1', name: 'Vocabulary', mastery: 78, group: 'English' },
  { id: 'e2', name: 'Grammar', mastery: 60, group: 'English' },
  { id: 'e3', name: 'Reading Comprehension', mastery: 55, isWeak: true, group: 'English' },
  { id: 'm1', name: 'Algebra', mastery: 92, group: 'Math' },
  { id: 'm2', name: 'Geometry', mastery: 68, group: 'Math' },
  { id: 'm3', name: 'Trigonometry', mastery: 40, isWeak: true, group: 'Math' },
  { id: 'm4', name: 'Calculus', mastery: 35, isWeak: true, group: 'Math' },
  { id: 'p1', name: 'Mechanics', mastery: 75, group: 'Physics' },
  { id: 'p2', name: 'Thermodynamics', mastery: 50, isWeak: true, group: 'Physics' },
  { id: 'c1', name: 'Organic Chemistry', mastery: 82, group: 'Chemistry' },
  { id: 'c2', name: 'Periodic Table', mastery: 65, group: 'Chemistry' },
  { id: 'c3', name: 'Chemical Bonds', mastery: 70, group: 'Chemistry' },
];

const learningPathSteps = [
  { id: '1', name: 'Bangla Grammar', status: 'completed' as const, mastery: 85 },
  { id: '2', name: 'English Vocab', status: 'completed' as const, mastery: 78 },
  { id: '3', name: 'Basic Math', status: 'current' as const, mastery: 62 },
  { id: '4', name: 'Physics Mechanics', status: 'locked' as const },
  { id: '5', name: 'Chemistry Bonds', status: 'locked' as const },
];

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

function HeroSection() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);

  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-28 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              <span>AI-Powered Adaptive Learning</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <GradientText as="span" animated>
                Your Personal AI
              </GradientText>
              <br />
              <span className="text-foreground">Learning Companion</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              ShikkhaAI adapts to your strengths and weaknesses, guiding you through a
              personalized study journey that maximizes every minute you spend learning.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: 'gradient', size: 'xl' }), 'gap-2')}
              >
                Get Started Free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}
              >
                Sign In
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" />
                SSC & HSC aligned
              </span>
            </div>
          </motion.div>

          {/* Right: knowledge graph visual with parallax */}
          <motion.div
            style={{ y: parallaxY }}
            className="relative flex justify-center"
            aria-hidden="true"
          >
            <div className="relative w-full max-w-lg">
              {/* Ambient glow behind graph */}
              <div className="absolute inset-0 -z-10 rounded-full bg-brand-from/10 blur-3xl" />
              <KnowledgeGraph
                nodes={heroGraphNodes}
                width={520}
                height={360}
                className="rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Band                                                         */
/* ------------------------------------------------------------------ */

function StatsBand() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
          <StaggerItem>
            <StatCard
              label="Active Students"
              value="50K+"
              icon={Users}
              tone="brand"
              hint="Across Bangladesh"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Questions Answered"
              value="2M+"
              icon={MessageSquare}
              tone="brand"
              hint="AI-generated & curated"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Exam Pass Rate"
              value="94"
              suffix="%"
              icon={TrendingUp}
              trend={12}
              tone="success"
              hint="Among active learners"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Personalization"
              value="AI"
              icon={Brain}
              tone="brand"
              hint="Tailored to every student"
            />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Showcase                                                   */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: BrainCircuit,
    title: 'Adaptive Exams',
    description:
      'AI-generated questions that adapt to your skill level in real time. Harder when you excel, supportive when you struggle.',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description:
      'Personalized recommendations pinpoint exactly where to focus. No more guessing what to study next.',
  },
  {
    icon: Target,
    title: 'Mastery Tracking',
    description:
      'Visual knowledge maps show your progress across every topic. See exactly how close you are to mastery.',
  },
  {
    icon: Zap,
    title: 'Focus Sessions',
    description:
      'Timed, distraction-free study blocks with smart break reminders. Build sustainable study habits.',
  },
];

function FeatureShowcase() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{' '}
            <GradientText as="span" animated>
              ace your exams
            </GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A complete learning ecosystem designed for Bangladeshi SSC & HSC students.
          </p>
        </Reveal>

        <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" gap={0.1}>
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <Card variant="glass" interactive className="h-full p-6">
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-brand-gradient text-white">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Learning Journey                                                   */
/* ------------------------------------------------------------------ */

function LearningJourneySection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your personalized{' '}
            <GradientText as="span" animated>
              learning path
            </GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            ShikkhaAI builds a unique roadmap for every student. Complete topics,
            unlock new challenges, and watch your knowledge graph grow.
          </p>
        </Reveal>

        <Reveal>
          <Card variant="glass" className="p-6 sm:p-8">
            <LearningPath steps={learningPathSteps} />
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust / Final CTA                                                  */
/* ------------------------------------------------------------------ */

function TrustCTASection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-white shadow-glow-lg sm:p-12 lg:p-16">
            {/* Decorative dots */}
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <pattern
                  id="dot-pattern"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#dot-pattern)" />
              </svg>
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Start learning smarter today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
                Join 50,000+ students already using ShikkhaAI to prepare for their
                exams with confidence.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: 'xl' }),
                    'gap-2 bg-white text-primary hover:bg-white/90'
                  )}
                >
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'xl' }),
                    'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white'
                  )}
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  SSC & HSC aligned
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  Works offline
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-border/40 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShikkhaAI. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="#" className="hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-gradient-to-b from-brand-from/[0.07] to-transparent" />

      <main className="relative">
        <HeroSection />
        <StatsBand />
        <FeatureShowcase />
        <LearningJourneySection />
        <TrustCTASection />
      </main>

      <Footer />
    </div>
  );
}

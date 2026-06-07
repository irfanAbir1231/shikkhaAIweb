'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import {
  BookOpen,
  Brain,
  Trophy,
  ArrowRight,
  SkipForward,
  GraduationCap,
  Check,
} from 'lucide-react';

const steps = [
  {
    title: 'Welcome to ShikkhaAI',
    description:
      'Your personal AI-powered learning companion for Bangladesh curriculum.',
    icon: BookOpen,
  },
  {
    title: 'Smart Exam Generation',
    description:
      'Generate curriculum-aligned questions with AI. Get instant grading and feedback.',
    icon: Brain,
  },
  {
    title: 'Track Your Progress',
    description:
      'Visualize your strengths and weaknesses. Get personalized study recommendations.',
    icon: Trophy,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push('/');
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card variant="glass" className="border-0 shadow-soft overflow-hidden">
      <CardContent className="p-6 sm:p-10">
        {/* Header: logo + skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-lg font-bold">ShikkhaAI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-4 h-4 mr-1.5" />
            Skip
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              const StepIcon = s.icon;
              return (
                <div key={s.title} className="flex items-center gap-2">
                  <div
                    className={
                      'grid size-8 place-items-center rounded-full text-xs font-semibold transition-all duration-300 ' +
                      (isCompleted
                        ? 'bg-brand-gradient text-white shadow-glow'
                        : isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                          : 'bg-muted text-muted-foreground')
                    }
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="size-4" />
                    ) : (
                      <StepIcon className="size-3.5" />
                    )}
                  </div>
                  <span
                    className={
                      'hidden sm:block text-xs font-medium transition-colors ' +
                      (isCurrent ? 'text-foreground' : 'text-muted-foreground')
                    }
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-6"
          >
            <Reveal direction="up" delay={0.05}>
              <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary/10 ring-1 ring-primary/20">
                <Icon className="size-10 text-primary" />
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.12}>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">{step.title}</h2>
                <p className="max-w-sm mx-auto text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Reveal>
          </motion.div>
        </AnimatePresence>

        {/* Action */}
        <div className="mt-10">
          <Button
            onClick={handleNext}
            variant="gradient"
            size="xl"
            className="w-full"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Mobile dot indicators */}
          <div className="flex justify-center gap-2 mt-6 lg:hidden">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

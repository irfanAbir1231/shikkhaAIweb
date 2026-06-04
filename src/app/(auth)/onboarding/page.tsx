'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, Trophy, ArrowRight, SkipForward } from 'lucide-react';

const steps = [
  {
    title: 'Welcome to ShikkhaAI',
    description: 'Your personal AI-powered learning companion for Bangladesh curriculum.',
    icon: BookOpen,
  },
  {
    title: 'Smart Exam Generation',
    description: 'Generate curriculum-aligned questions with AI. Get instant grading and feedback.',
    icon: Brain,
  },
  {
    title: 'Track Your Progress',
    description: 'Visualize your strengths and weaknesses. Get personalized study recommendations.',
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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="w-10 h-10 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 space-y-4">
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext} className="w-full">
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

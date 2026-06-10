'use client';

import { motion } from 'framer-motion';
import { Star, Crown, Trophy, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const levelIcons = [Star, Star, Star, Award, Award, Trophy, Trophy, Crown];
const levelColors = [
  'text-slate-400 bg-slate-400/10 ring-slate-400/20',
  'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20',
  'text-blue-400 bg-blue-400/10 ring-blue-400/20',
  'text-violet-400 bg-violet-400/10 ring-violet-400/20',
  'text-amber-400 bg-amber-400/10 ring-amber-400/20',
  'text-orange-400 bg-orange-400/10 ring-orange-400/20',
  'text-rose-400 bg-rose-400/10 ring-rose-400/20',
  'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
];

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function LevelBadge({ level, size = 'md', showLabel = true, className }: LevelBadgeProps) {
  const tier = Math.min(levelIcons.length - 1, Math.max(0, Math.floor((level - 1) / 5)));
  const Icon = levelIcons[tier];
  const colorClass = levelColors[tier];

  const sizeClasses = {
    sm: 'h-6 px-1.5 gap-1 text-[10px]',
    md: 'h-8 px-2.5 gap-1.5 text-xs',
    lg: 'h-10 px-3 gap-2 text-sm',
  };

  const iconSizes = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1',
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>Lv.{level}</span>}
    </motion.div>
  );
}

'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlantState } from '@/lib/types/focus-session';
import { Sprout, Flower2, TreePine, TreeDeciduous, Skull } from 'lucide-react';

const STAGE_ICONS = [
  Sprout,    // seed
  Flower2,   // sprout
  TreePine,  // sapling
  TreeDeciduous, // mature
  Skull,     // withered
];

const STAGE_LABELS = ['Seed', 'Sprout', 'Sapling', 'Mature', 'Withered'];

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-300',  glow: 'shadow-amber-200/50' },
  rose:   { bg: 'bg-rose-50',   text: 'text-rose-600',   ring: 'ring-rose-300',   glow: 'shadow-rose-200/50' },
  emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',ring: 'ring-emerald-300',glow: 'shadow-emerald-200/50' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-300', glow: 'shadow-violet-200/50' },
  lime:   { bg: 'bg-lime-50',   text: 'text-lime-600',   ring: 'ring-lime-300',   glow: 'shadow-lime-200/50' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-600',   ring: 'ring-pink-300',   glow: 'shadow-pink-200/50' },
};

interface FocusGardenProps {
  plant: PlantState | null;
  isRunning: boolean;
  sessionProgress: number; // 0-100
}

export function FocusGarden({ plant, isRunning, sessionProgress }: FocusGardenProps) {
  const colors = useMemo(() => {
    if (!plant) return COLOR_MAP.emerald;
    return COLOR_MAP[plant.color] ?? COLOR_MAP.emerald;
  }, [plant]);

  const stageIndex = plant ? (plant.withered ? 4 : Math.min(3, plant.stage)) : 0;
  const StageIcon = STAGE_ICONS[stageIndex];
  const stageLabel = plant ? STAGE_LABELS[stageIndex] : 'Ready';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Garden plot */}
      <div
        className={`
          relative w-56 h-56 rounded-2xl flex items-center justify-center
          ${colors.bg} ring-2 ${colors.ring}
          transition-all duration-700
          ${isRunning ? `shadow-xl ${colors.glow}` : 'shadow-md'}
        `}
      >
        <AnimatePresence mode="wait">
          {plant ? (
            <motion.div
              key={plant.id + '-' + plant.stage + '-' + plant.withered}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{
                scale: plant.withered ? 0.85 : 1,
                opacity: 1,
                rotate: plant.withered ? 15 : 0,
              }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-2"
            >
              <StageIcon
                className={`w-24 h-24 ${colors.text} transition-all duration-500`}
                strokeWidth={1.5}
              />
              <span className={`text-sm font-semibold ${colors.text}`}>
                {plant.name} — {stageLabel}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <Sprout className="w-16 h-16 opacity-40" />
              <span className="text-sm">Start a session to plant a seed</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Growth progress overlay during session */}
        {isRunning && plant && !plant.withered && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-2 bg-muted/30 rounded-b-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`h-full ${colors.text.replace('text-', 'bg-')}`}
              style={{ width: `${sessionProgress}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </motion.div>
        )}
      </div>

      {/* Stage dots */}
      {plant && (
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-500
                ${s <= stageIndex && !plant.withered
                  ? `${colors.text.replace('text-', 'bg-')} scale-110`
                  : 'bg-muted'}
                ${plant.withered ? 'bg-red-400 scale-90' : ''}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

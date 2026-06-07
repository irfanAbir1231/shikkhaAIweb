'use client';

import { motion } from 'framer-motion';
import { useFocusGardenStore } from '@/lib/stores/focus-garden-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { Sprout, TreePine, TreeDeciduous, Skull, Flame, BookOpen, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_ICON_MAP = {
  seed: Sprout,
  sprout: TreePine,
  sapling: TreePine,
  mature: TreeDeciduous,
  withered: Skull,
};

export function GardenGallery() {
  const { profile } = useFocusGardenStore();
  const { plants, totalSessionsCompleted, currentStreakDays, longestStreakDays } = profile;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-4" gap={0.06}>
        <StaggerItem>
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{totalSessionsCompleted}</div>
              <p className="text-xs text-muted-foreground">Sessions Completed</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold flex items-center gap-1">
                {currentStreakDays}
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{longestStreakDays}</div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{plants.length}</div>
              <p className="text-xs text-muted-foreground">Plants Grown</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>

      {/* Plants grid */}
      {plants.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Sprout className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Your garden is empty</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete focus sessions to grow your first plant.
          </p>
        </Card>
      ) : (
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" gap={0.06}>
          {plants.map((plant, i) => {
            const Icon = STAGE_ICON_MAP[plant.type];
            const isWithered = plant.withered;

            return (
              <StaggerItem key={plant.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    variant="glass"
                    className={cn(
                      'overflow-hidden transition-all hover-lift',
                      isWithered && 'border-red-500/20 bg-red-500/5'
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{plant.name}</CardTitle>
                        <div className="flex items-center gap-1.5">
                          {plant.source === 'exam' && (
                            <FileQuestion className="w-3.5 h-3.5 text-orange-500" />
                          )}
                          {plant.source !== 'exam' && (
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              isWithered
                                ? 'border-red-400/30 text-red-500 bg-red-500/10'
                                : 'glass'
                            )}
                          >
                            {plant.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-center py-4">
                        <Icon
                          className={cn(
                            'w-16 h-16',
                            isWithered
                              ? 'text-red-400'
                              : `text-${plant.color}-500`
                          )}
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Growth</span>
                          <span>{plant.stage} / 3</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              isWithered ? 'bg-red-400' : `bg-${plant.color}-500`
                            )}
                            style={{ width: `${(plant.stage / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unlocked {new Date(plant.unlockedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}

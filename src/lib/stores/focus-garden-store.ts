'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GardenProfile, PlantState, FocusSession } from '@/lib/types/focus-session';

const PLANT_TEMPLATES: Omit<PlantState, 'id' | 'unlockedAt' | 'sessionCount' | 'withered' | 'source'>[] = [
  { name: 'Sunflower', type: 'seed', stage: 0, color: 'amber' },
  { name: 'Rose', type: 'seed', stage: 0, color: 'rose' },
  { name: 'Bamboo', type: 'seed', stage: 0, color: 'emerald' },
  { name: 'Lavender', type: 'seed', stage: 0, color: 'violet' },
  { name: 'Cactus', type: 'seed', stage: 0, color: 'lime' },
  { name: 'Cherry Blossom', type: 'seed', stage: 0, color: 'pink' },
];

const EXAM_PLANT_TEMPLATES: Omit<PlantState, 'id' | 'unlockedAt' | 'sessionCount' | 'withered' | 'source'>[] = [
  { name: 'Scholar Oak', type: 'mature', stage: 3, color: 'orange' },
  { name: 'Wisdom Pine', type: 'mature', stage: 3, color: 'teal' },
  { name: 'Victory Maple', type: 'mature', stage: 3, color: 'red' },
  { name: 'Knowledge Willow', type: 'mature', stage: 3, color: 'cyan' },
];

function getNextPlantType(unlocked: string[]): string | null {
  for (const p of PLANT_TEMPLATES) {
    if (!unlocked.includes(p.name)) return p.name;
  }
  return null;
}

function advancePlant(plant: PlantState): PlantState {
  if (plant.withered || plant.stage >= 3) return plant;
  const nextStage = plant.stage + 1;
  const types: PlantState['type'][] = ['seed', 'sprout', 'sapling', 'mature'];
  return {
    ...plant,
    stage: nextStage,
    type: types[nextStage],
    sessionCount: plant.sessionCount + 1,
  };
}

function witherPlant(plant: PlantState): PlantState {
  return { ...plant, type: 'withered', withered: true };
}

function isSameDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

interface FocusGardenState {
  profile: GardenProfile;
  currentPlant: PlantState | null;
  startPlant: (session: FocusSession) => PlantState;
  completeSession: (session: FocusSession) => void;
  abortSession: (session: FocusSession) => void;
  awardExamTree: (examName?: string) => void;
  resetGarden: () => void;
}

const emptyProfile = (studentId: string): GardenProfile => ({
  studentId,
  totalSessionsCompleted: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
  plants: [],
  unlockedPlantTypes: [],
});

export const useFocusGardenStore = create<FocusGardenState>()(
  persist(
    (set, get) => ({
      profile: emptyProfile('guest'),
      currentPlant: null,

      startPlant: (session) => {
        const { profile } = get();
        const today = new Date().toISOString().slice(0, 10);

        // Determine streak
        let newStreak = profile.currentStreakDays;
        if (profile.lastSessionDate) {
          const last = new Date(profile.lastSessionDate);
          const todayDate = new Date(today);
          const diff = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) newStreak += 1;
          else if (diff > 1) newStreak = 1;
        } else {
          newStreak = 1;
        }

        const longest = Math.max(profile.longestStreakDays, newStreak);

        // Pick a plant: reuse latest non-withered if available, else unlock new
        let plant: PlantState;
        const latest = profile.plants[profile.plants.length - 1];
        if (latest && !latest.withered && latest.stage < 3) {
          plant = { ...latest, id: `${latest.id}_${Date.now()}` };
        } else {
          const nextType = getNextPlantType(profile.unlockedPlantTypes);
          const template = PLANT_TEMPLATES.find((p) => p.name === nextType) ?? PLANT_TEMPLATES[0];
          const newUnlocked = nextType && !profile.unlockedPlantTypes.includes(nextType)
            ? [...profile.unlockedPlantTypes, nextType]
            : profile.unlockedPlantTypes;

          set((state) => ({
            profile: {
              ...state.profile,
              unlockedPlantTypes: newUnlocked,
            },
          }));

          plant = {
            id: `plant_${Date.now()}`,
            name: template.name,
            type: 'seed',
            stage: 0,
            color: template.color,
            unlockedAt: new Date().toISOString(),
            sessionCount: 0,
            withered: false,
            source: 'focus',
          };
        }

        set((state) => ({
          profile: {
            ...state.profile,
            currentStreakDays: newStreak,
            longestStreakDays: longest,
          },
          currentPlant: plant,
        }));

        return plant;
      },

      completeSession: (session) => {
        const { currentPlant, profile } = get();
        const today = new Date().toISOString();
        const todayDate = today.slice(0, 10);

        if (!currentPlant) return;

        const grown = advancePlant(currentPlant);

        // Replace or append the plant in the profile list
        const plantIndex = profile.plants.findIndex((p) => p.id === currentPlant.id.split('_')[0]);
        const newPlants =
          plantIndex >= 0
            ? profile.plants.map((p, i) => (i === plantIndex ? grown : p))
            : [...profile.plants, grown];

        set({
          profile: {
            ...profile,
            totalSessionsCompleted: profile.totalSessionsCompleted + 1,
            plants: newPlants,
            lastSessionDate: todayDate,
          },
          currentPlant: null,
        });
      },

      abortSession: (session) => {
        const { currentPlant, profile } = get();
        if (!currentPlant) return;

        const dead = witherPlant(currentPlant);

        const plantIndex = profile.plants.findIndex((p) => p.id === currentPlant.id.split('_')[0]);
        const newPlants =
          plantIndex >= 0
            ? profile.plants.map((p, i) => (i === plantIndex ? dead : p))
            : [...profile.plants, dead];

        set({
          profile: {
            ...profile,
            plants: newPlants,
          },
          currentPlant: null,
        });
      },

      awardExamTree: (examName) => {
        const { profile } = get();
        const examPlantCount = profile.plants.filter((p) => p.source === 'exam').length;
        const template = EXAM_PLANT_TEMPLATES[examPlantCount % EXAM_PLANT_TEMPLATES.length];

        const tree: PlantState = {
          id: `exam_tree_${Date.now()}`,
          name: examName ? `${examName} — ${template.name}` : template.name,
          type: 'mature',
          stage: 3,
          color: template.color,
          unlockedAt: new Date().toISOString(),
          sessionCount: 1,
          withered: false,
          source: 'exam',
        };

        set({
          profile: {
            ...profile,
            totalSessionsCompleted: profile.totalSessionsCompleted + 1,
            plants: [...profile.plants, tree],
          },
        });
      },

      resetGarden: () => {
        const { profile } = get();
        set({
          profile: emptyProfile(profile.studentId),
          currentPlant: null,
        });
      },
    }),
    { name: 'focus-garden-storage', skipHydration: true }
  )
);

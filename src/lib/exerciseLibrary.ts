import type { Exercise, Mode } from "../types/gym";

export type Category = "Strength" | "Cardio" | "Core" | "Flexibility";
export const categories: Category[] = ["Strength", "Cardio", "Core", "Flexibility"];

export type LibExercise = Exercise & {
  category: Category;
  level: Mode;
  avoid: string[];
};

const rank: Record<Mode, number> = { rest: 0, easy: 1, hard: 2 };

export const library: LibExercise[] = [
  { id: "Lsq1", name: "Squats", sets: 3, reps: "10", restSec: 45, category: "Strength", level: "hard", avoid: ["heavy"] },
  { id: "Lsq2", name: "Chair squats", sets: 2, reps: "8", restSec: 40, category: "Strength", level: "easy", avoid: [] },
  { id: "Lpu1", name: "Push-ups", sets: 3, reps: "10", restSec: 45, category: "Strength", level: "hard", avoid: ["heavy"] },
  { id: "Lpu2", name: "Wall push-ups", sets: 2, reps: "10", restSec: 40, category: "Strength", level: "easy", avoid: [] },
  { id: "Lrw1", name: "Bent-over rows", sets: 3, reps: "10", restSec: 45, category: "Strength", level: "hard", avoid: ["heavy", "balance"] },

  { id: "Lwk1", name: "Slow walk", sets: 1, reps: "10 min", restSec: 20, category: "Cardio", level: "rest", avoid: [] },
  { id: "Lwk2", name: "Brisk walk", sets: 1, reps: "15 min", restSec: 30, category: "Cardio", level: "easy", avoid: [] },
  { id: "Lwk3", name: "Fast walk intervals", sets: 2, reps: "5 min", restSec: 45, category: "Cardio", level: "hard", avoid: ["fast"] },

  { id: "Lpl1", name: "Knee plank", sets: 2, reps: "20 sec", restSec: 30, category: "Core", level: "easy", avoid: [] },
  { id: "Lpl2", name: "Plank", sets: 3, reps: "45 sec", restSec: 30, category: "Core", level: "hard", avoid: [] },

  { id: "Lst1", name: "Gentle stretching", sets: 1, reps: "10 min", restSec: 20, category: "Flexibility", level: "rest", avoid: [] },
  { id: "Lst2", name: "Neck and shoulder stretch", sets: 1, reps: "5 min", restSec: 20, category: "Flexibility", level: "rest", avoid: [] },
  { id: "Lbr1", name: "Deep breathing", sets: 1, reps: "5 min", restSec: 20, category: "Flexibility", level: "rest", avoid: [] },
  { id: "Lst3", name: "Standing side stretch", sets: 2, reps: "30 sec", restSec: 20, category: "Flexibility", level: "easy", avoid: ["balance"] },
];

export function allowed(e: LibExercise, cap: Mode, avoid: string[]): boolean {
  return rank[e.level] <= rank[cap] && !e.avoid.some((t) => avoid.includes(t));
}

export function findByIds(ids: string[]): LibExercise[] {
  return ids
    .map((id) => library.find((e) => e.id === id))
    .filter((e): e is LibExercise => !!e);
}
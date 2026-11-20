import { colors } from "../constants/colors";
import { getMeds } from "./health";
import { saveData, loadData, KEYS, getTodayKeyPart } from "./storage";
import type { Exercise, Mode } from "../types/gym";

// Mock data for now. Later this comes from Vitals Watch and Rx Autopilot.
export const vitals = { sleepHours: 6.5, restingHr: 74 };
export const medicineNote =
  "Cetirizine tonight may cause drowsiness. Avoid heavy lifting after 9 PM.";

// Streak now persists. Starts at 4 as demo data until a saved value loads.
export let streakDays = 4;

export async function initStreak() {
  const saved = await loadData<number>(KEYS.STREAK, 4);
  const n = Number(saved);
  if (!Number.isNaN(n)) {
    streakDays = n;
  }
}

export function setStreak(n: number) {
  streakDays = n;
  saveData(KEYS.STREAK, n);
}

const dosesToday = () => getMeds().length;
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Call when a workout is finished. Counts at most once per day.
// Yesterday -> streak + 1. Older gap -> restarts at 1. No saved day (demo data) -> streak + 1.
export async function completeWorkoutToday(): Promise<{ streak: number; counted: boolean }> {
  const today = await getTodayKeyPart();
  const last = await loadData<string>(KEYS.LAST_ACTIVE_DAY, "");
  if (last === today) {
    return { streak: streakDays, counted: false };
  }
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const next = last === "" || last === dayKey(y) ? streakDays + 1 : 1;
  setStreak(next);
  await saveData(KEYS.LAST_ACTIVE_DAY, today);
  return { streak: next, counted: true };
}

export function getReadiness(): {
  score: number;
  label: string;
  color: string;
  mode: Mode;
} {
  let score = 100;
  if (vitals.sleepHours < 7) score -= 20;
  if (vitals.sleepHours < 5) score -= 20;
  if (vitals.restingHr > 70) score -= 10;
  if (vitals.restingHr > 85) score -= 15;
  if (medicineNote) score -= 5;
  if (score >= 80) return { score, label: "Go hard", color: colors.teal, mode: "hard" };
  if (score >= 55) return { score, label: "Go easy", color: colors.accent, mode: "easy" };
  return { score, label: "Rest day", color: colors.purple, mode: "rest" };
}

export const plans: Record<Mode, { title: string; exercises: Exercise[] }> = {
  hard: {
    title: "Strength day",
    exercises: [
      { id: "h1", name: "Squats", sets: 4, reps: "8", restSec: 60 },
      { id: "h2", name: "Push-ups", sets: 4, reps: "12", restSec: 45 },
      { id: "h3", name: "Bent-over rows", sets: 3, reps: "10", restSec: 60 },
      { id: "h4", name: "Plank", sets: 3, reps: "45 sec", restSec: 30 },
    ],
  },
  easy: {
    title: "Light day",
    exercises: [
      { id: "e1", name: "Bodyweight squats", sets: 3, reps: "10", restSec: 45 },
      { id: "e2", name: "Wall push-ups", sets: 3, reps: "10", restSec: 45 },
      { id: "e3", name: "Brisk walk", sets: 1, reps: "15 min", restSec: 30 },
    ],
  },
  rest: {
    title: "Recovery day",
    exercises: [
      { id: "r1", name: "Gentle stretching", sets: 1, reps: "10 min", restSec: 30 },
      { id: "r2", name: "Deep breathing", sets: 1, reps: "5 min", restSec: 30 },
    ],
  },
};

export function getBadge(streak: number) {
  if (streak >= 60) return { name: "Platinum", color: "#E5E4E2", next: 60, nextName: "Max level" };
  if (streak >= 21) return { name: "Gold", color: "#FACC15", next: 60, nextName: "Platinum" };
  if (streak >= 7) return { name: "Silver", color: "#CBD5E1", next: 21, nextName: "Gold" };
  return { name: "No badge yet", color: colors.sub, next: 7, nextName: "Silver" };
}

// ---- Bonus exercises (never above the user's limit) ----
export function bonusLevel(mode: Mode): Mode {
  if (mode === "rest") return "rest";
  if (dosesToday() >= 5 && mode === "hard") return "easy";
  return mode;
}

export const bonusPool: Record<Mode, Exercise[]> = {
  rest: [
    { id: "xr1", name: "Neck and shoulder stretch", sets: 1, reps: "5 min", restSec: 20 },
    { id: "xr2", name: "Slow breathing", sets: 1, reps: "3 min", restSec: 20 },
  ],
  easy: [
    { id: "xe1", name: "Slow walk", sets: 1, reps: "10 min", restSec: 20 },
    { id: "xe2", name: "Chair squats", sets: 2, reps: "8", restSec: 40 },
    { id: "xe3", name: "Wall push-ups (extra)", sets: 2, reps: "8", restSec: 40 },
  ],
  hard: [
    { id: "xh1", name: "Plank", sets: 2, reps: "30 sec", restSec: 30 },
    { id: "xh2", name: "Push-ups (extra)", sets: 2, reps: "10", restSec: 45 },
    { id: "xh3", name: "Bent-over rows (extra)", sets: 2, reps: "10", restSec: 45 },
  ],
};

export function bonusReason(mode: Mode): string {
  if (dosesToday() >= 5 && mode !== "rest") {
    return `You have ${dosesToday()} medicine doses today, so I keep extras light.`;
  }
  if (mode === "rest") {
    return "Today is a recovery day, so I only suggest very gentle extras.";
  }
  if (mode === "easy") {
    return "Your readiness says go easy, so these extras are light and safe.";
  }
  return "You are ready today, so these are a bit stronger but still within your limit.";
}
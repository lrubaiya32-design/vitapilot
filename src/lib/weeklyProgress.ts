// src/lib/weeklyProgress.ts
import { streakDays, getBadge } from "./gymData";

export type WeeklyStats = {
  streak: number;
  badge: string;
  sessionsThisWeek: number;
  message: string;
};

// sessionsThisWeek is a placeholder count until real persistence (AsyncStorage/Supabase) is added.
export function getWeeklyStats(sessionsThisWeek: number = 0): WeeklyStats {
  const badge = getBadge(streakDays);
  let message = "Keep going — every session counts.";
  if (streakDays >= 21) message = "You're building a real habit. Impressive consistency.";
  else if (streakDays >= 7) message = "A full week-plus streak. Nice momentum.";

  return {
    streak: streakDays,
    badge: badge.name,
    sessionsThisWeek,
    message,
  };
}
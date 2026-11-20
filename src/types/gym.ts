export type Mode = "hard" | "easy" | "rest";

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
};
// src/lib/healthTips.ts
// Generic, non-diagnostic health & safety tips. Not medical advice.

export type ConditionTag = "drowsy" | "dizzy" | "fever" | "normal";

export const SAFETY_TIPS: Record<string, string> = {
  squat: "Keep your back straight and knees over your toes.",
  pushup: "Keep your core tight; don't let your hips sag.",
  wallpushup: "Keep your feet a little away from the wall for control.",
  row: "Pull with your back, not just your arms.",
  plank: "Breathe steadily; don't hold your breath.",
  walk: "Keep a relaxed pace you can hold a conversation at.",
  stretch: "Move slowly; stop if you feel sharp pain.",
  breathe: "Exhale longer than you inhale to relax.",
};

export const CONDITION_TIPS: Record<ConditionTag, string> = {
  drowsy: "You logged drowsiness today — go easy, skip high-intensity moves.",
  dizzy: "You logged dizziness — avoid sudden position changes like fast squats.",
  fever: "You logged a fever — rest is better than exercise today.",
  normal: "No flags today — a normal session is fine.",
};

export function getSafetyTip(exerciseKind: string): string {
  return SAFETY_TIPS[exerciseKind] ?? "Move at a pace that feels controlled.";
}

export function getConditionTip(tag: ConditionTag): string {
  return CONDITION_TIPS[tag];
}

const ENCOURAGEMENTS = [
  "Nice work — that's one more session done.",
  "Consistency beats intensity. Good job showing up.",
  "Your streak is building. Keep it steady.",
  "Well done — small steps add up.",
];

export function getEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}
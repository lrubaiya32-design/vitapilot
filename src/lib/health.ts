import type { Mode } from "../types/gym";
import { scheduleDoseAlarms } from "./notifications";
import { KEYS, loadData, saveData } from "./storage";

export type Effect = "drowsy" | "dizzy" | "fever";
export type Med = { name: string; dosage: string; time: string; effect: Effect | null };
export type Limit = { cap: Mode; avoid: string[]; notes: string[] };
export type Source = "medical" | "hydration";

const rank: Record<Mode, number> = { rest: 0, easy: 1, hard: 2 };
export const minMode = (a: Mode, b: Mode): Mode => (rank[a] <= rank[b] ? a : b);

const EFFECT_WORDS: Record<Effect, string[]> = {
  drowsy: ["cetirizine", "levocetirizine", "chlorpheniramine", "promethazine", "diphenhydramine", "benadryl", "alprazolam", "clonazepam"],
  dizzy: ["amlodipine", "atenolol", "metoprolol", "telmisartan", "nifedipine", "glimepiride", "insulin"],
  fever: ["paracetamol", "acetaminophen", "dolo", "crocin", "calpol", "ibuprofen"],
};

function effectFor(name: string): Effect | null {
  const n = name.toLowerCase();
  for (const e of Object.keys(EFFECT_WORDS) as Effect[]) {
    if (EFFECT_WORDS[e].some((w) => n.includes(w))) return e;
  }
  return null;
}

// ---- Medicines (mock until you scan a prescription and tap "Use for today's plan") ----
let meds: Med[] = [
  { name: "Amoxicillin 500 mg", dosage: "1 tablet", time: "08:00", effect: null },
  { name: "Amoxicillin 500 mg", dosage: "1 tablet", time: "20:00", effect: null },
  { name: "Metformin 500 mg", dosage: "1 tablet", time: "08:00", effect: null },
  { name: "Metformin 500 mg", dosage: "1 tablet", time: "20:00", effect: null },
  { name: "Vitamin D", dosage: "1 capsule", time: "09:00", effect: null },
  { name: "Cetirizine 10 mg", dosage: "1 tablet", time: "21:00", effect: "drowsy" },
];

export const getMeds = () => meds;

export async function saveTodayDoses(
  doses: { medicine: string; dosage: string; time: string }[]
): Promise<number> {
  meds = doses.map((d) => ({
    name: d.medicine,
    dosage: d.dosage,
    time: d.time,
    effect: effectFor(d.medicine),
  }));
  saveData(KEYS.MEDS, meds);
  return await scheduleDoseAlarms(meds);
}

export function medicalLimit(): Limit {
  let cap: Mode = "hard";
  const avoid: string[] = [];
  const notes: string[] = [];
  const seen = new Set<string>();
  for (const m of meds) {
    if (!m.effect || seen.has(m.name)) continue;
    seen.add(m.name);
    if (m.effect === "fever") {
      cap = minMode(cap, "rest");
      notes.push(`${m.name} is used for fever or pain, so rest is best today.`);
    }
    if (m.effect === "drowsy") {
      cap = minMode(cap, "easy");
      avoid.push("heavy", "balance");
      notes.push(`${m.name} may cause drowsiness, so no heavy or balance moves.`);
    }
    if (m.effect === "dizzy") {
      cap = minMode(cap, "easy");
      avoid.push("balance", "fast");
      notes.push(`${m.name} may cause dizziness, so no balance or fast moves.`);
    }
  }
  if (meds.length >= 5) {
    cap = minMode(cap, "easy");
    notes.push(`You have ${meds.length} doses today, so I keep it light.`);
  }
  if (notes.length === 0) notes.push("No medicine today limits your exercise.");
  return { cap, avoid, notes };
}

// ---- Hydration ----
export const hydration = { drankMl: 1200, goalMl: 3000 };
export const getHydration = () => hydration;
export function addWater(ml: number) {
  hydration.drankMl = Math.min(hydration.drankMl + ml, hydration.goalMl * 2);
  saveData(KEYS.HYDRATION, hydration);
}

export function hydrationLimit(): Limit {
  const pct = hydration.drankMl / hydration.goalMl;
  const said = `You drank ${hydration.drankMl} of ${hydration.goalMl} ml.`;
  if (pct < 0.3) {
    return { cap: "rest", avoid: [], notes: [`${said} That is low. Drink 500 ml first, then try only gentle moves.`] };
  }
  if (pct < 0.6) {
    return { cap: "easy", avoid: [], notes: [`${said} Keep it light until you drink more.`] };
  }
  return { cap: "hard", avoid: [], notes: [`${said} Hydration is good.`] };
}

export function combineLimits(sources: Source[]): Limit {
  let cap: Mode = "hard";
  const avoid: string[] = [];
  const notes: string[] = [];
  const list: Source[] = sources.length ? sources : ["medical"];
  for (const s of list) {
    const l = s === "medical" ? medicalLimit() : hydrationLimit();
    cap = minMode(cap, l.cap);
    avoid.push(...l.avoid);
    notes.push(...l.notes);
  }
  return { cap, avoid, notes };
}

// ---- Condition tag, for healthTips.ts ----
export function getConditionTag(): "drowsy" | "dizzy" | "fever" | "normal" {
  const seen = meds.find((m) => m.effect !== null);
  return seen?.effect ?? "normal";
}

// ---- Tomorrow's suggestion (uses today's data until persistence/step 5 is added) ----
export type TomorrowSuggestion = { cap: Mode; reason: string };

export function getTomorrowSuggestion(): TomorrowSuggestion {
  const med = medicalLimit();
  const hyd = hydrationLimit();
  const cap = minMode(med.cap, hyd.cap);

  let reason = "Today looked balanced, so a normal session should be fine tomorrow.";
  if (cap === "rest") {
    reason = "Based on today's medicine or hydration, ease in gently tomorrow too.";
  } else if (cap === "easy") {
    reason = "Today was a lighter day, so start tomorrow light and reassess.";
  }

  return { cap, reason };
}

// ---- Load saved data on app start ----
let initialized = false;

export async function initHealthData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const savedMeds = await loadData<Med[]>(KEYS.MEDS, meds);
  meds = savedMeds;

  const savedHydration = await loadData(KEYS.HYDRATION, hydration);
  hydration.drankMl = savedHydration.drankMl;
  hydration.goalMl = savedHydration.goalMl;

  // Re-schedule dose alarms so they match the saved medicines.
  const count = await scheduleDoseAlarms(meds);
  console.log("ALARMS:", count, "times:", meds.map((m) => m.time).join(", "));
}
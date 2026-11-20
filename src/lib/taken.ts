import { KEYS, loadData, saveData, getTodayKeyPart } from "./storage";

type Log = { day: string; items: string[] };

export const takenKey = (name: string, time?: string) => `${name}|${time ?? ""}`;

// Doses marked taken today. Resets automatically on a new day.
export async function loadTaken(): Promise<string[]> {
  const day = await getTodayKeyPart();
  const log = await loadData<Log>(KEYS.TAKEN, { day, items: [] });
  return log.day === day ? log.items : [];
}

export async function markTaken(doses: { name: string; time?: string }[]) {
  const day = await getTodayKeyPart();
  const current = await loadTaken();
  const items = Array.from(
    new Set([...current, ...doses.map((d) => takenKey(d.name, d.time))])
  );
  await saveData<Log>(KEYS.TAKEN, { day, items });
}
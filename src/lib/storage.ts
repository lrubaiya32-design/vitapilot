// src/lib/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveData<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log("Storage save failed for", key, e);
  }
}

export async function loadData<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.log("Storage load failed for", key, e);
    return fallback;
  }
}

export async function getTodayKeyPart(): Promise<string> {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Storage keys used across the app
export const KEYS = {
  MEDS: "vitapilot_meds",
  HYDRATION: "vitapilot_hydration",
  STREAK: "vitapilot_streak",
  LAST_ACTIVE_DAY: "vitapilot_last_active_day",
  TAKEN: "vitapilot_taken",
};
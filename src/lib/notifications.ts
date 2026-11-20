import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

type DoseInput = { name: string; dosage: string; time: string };

// Show the alert even if the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Accepts "08:00", "8:00", "8:00 AM", "8:00 pm". Returns null if unreadable.
function parseTime(t: string): { hour: number; minute: number } | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && hour < 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

async function ensurePermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch (e) {
    console.log("permission check failed", e);
    return false;
  }
}

// Expo Go on Android can reject channel setup. Try it, and carry on if it fails.
let channelReady = false;
async function ensureChannel() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("doses", {
      name: "Dose reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
    channelReady = true;
  } catch (e) {
    channelReady = false;
    console.log("channel setup skipped", e);
  }
}

// Cancels old dose alarms and schedules one daily alarm per dose time.
// Doses at the same time are combined into one notification.
// Returns how many alarms were scheduled.
export async function scheduleDoseAlarms(doses: DoseInput[]): Promise<number> {
  try {
    const ok = await ensurePermission();
    if (!ok) return 0;

    await ensureChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();

    const byTime = new Map<string, DoseInput[]>();
    for (const d of doses) {
      const p = parseTime(d.time);
      if (!p) continue;
      const key = `${p.hour}:${p.minute}`;
      byTime.set(key, [...(byTime.get(key) ?? []), d]);
    }

    let count = 0;
    for (const [key, list] of byTime) {
      const [hour, minute] = key.split(":").map(Number);
      const body = list.map((d) => `${d.name} (${d.dosage})`).join(", ");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for your medicine",
          body,
          data: {
            doses: list.map((d) => ({ name: d.name, dosage: d.dosage, time: d.time })),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          ...(channelReady ? { channelId: "doses" } : {}),
        },
      });
      count++;
    }
    return count;
  } catch (e) {
    console.log("scheduleDoseAlarms failed", e);
    return 0;
  }
}

// For testing: fires one notification in 5 seconds.
export async function sendTestAlarm(): Promise<boolean> {
  try {
    const ok = await ensurePermission();
    if (!ok) return false;
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content: { title: "VitaPilot test", body: "Dose alarms are working." },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        ...(channelReady ? { channelId: "doses" } : {}),
      },
    });
    return true;
  } catch (e) {
    console.log("sendTestAlarm failed", e);
    return false;
  }
}
// For testing: adds a fake dose due in about 1-2 minutes and schedules it
// through the real scheduleDoseAlarms path, alongside your saved doses.
export async function scheduleDebugDose(doses: DoseInput[]): Promise<string> {
  const t = new Date();
  t.setSeconds(0, 0);
  t.setMinutes(t.getMinutes() + 2);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;
  const count = await scheduleDoseAlarms([
    ...doses,
    { name: "DEBUG dose", dosage: "1 test", time },
  ]);
  console.log("DEBUG ALARM set for", time, "total alarms:", count);
  return time;
}
// Rings again after a few minutes (used by the Snooze button).
export async function snoozeDoses(
  doses: { name: string; dosage: string; time?: string }[],
  minutes = 5
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for your medicine",
      body: doses.map((d) => `${d.name} (${d.dosage})`).join(", "),
      data: { doses },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
    },
  });
}
// Mock "family alert": fires if the dose isn't marked Taken in time.
// Set to 1 minute for testing. Change to 10 for the demo.
export const MISSED_MINUTES = 10;

export async function scheduleMissedAlert(
  doses: { name: string; dosage: string }[]
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Missed dose - family notified",
        body: `Alert sent to your family: ${doses.map((d) => d.name).join(", ")} not taken.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: MISSED_MINUTES * 60,
      },
    });
  } catch (e) {
    console.log("scheduleMissedAlert failed", e);
    return null;
  }
}

export async function cancelAlert(id: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}
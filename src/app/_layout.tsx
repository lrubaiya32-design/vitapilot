import { useEffect, useRef } from "react";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { colors } from "../constants/colors";
import { initHealthData } from "../lib/health";
import { initStreak } from "../lib/gymData";

export default function RootLayout() {
  const lastId = useRef<string>("");

  useEffect(() => {
    initHealthData();
    initStreak();

    const open = (n: Notifications.Notification) => {
      const id = n.request.identifier;
      if (id === lastId.current) return;
      const data: any = n.request.content.data;
      if (!data?.doses) return;
      lastId.current = id;
      router.push({
        pathname: "/alarm",
        params: { doses: JSON.stringify(data.doses) },
      });
    };

    // App open when the dose time hits.
    const sub1 = Notifications.addNotificationReceivedListener(open);
    // User taps the notification.
    const sub2 = Notifications.addNotificationResponseReceivedListener((r) =>
      open(r.notification)
    );
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="medical/index" options={{ title: "Rx Autopilot" }} />
      <Stack.Screen name="medical/scan" options={{ title: "Scan prescription" }} />
      <Stack.Screen name="gym/index" options={{ title: "Gym" }} />
      <Stack.Screen name="gym/workout" options={{ title: "Workout" }} />
      <Stack.Screen name="hydration" options={{ title: "Hydration" }} />
      <Stack.Screen name="progress" options={{ title: "This Week" }} />
      <Stack.Screen name="checkin" options={{ title: "Check-In" }} />
      <Stack.Screen
        name="alarm"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  );
}
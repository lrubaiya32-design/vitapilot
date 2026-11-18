import { Stack } from "expo-router";
import { colors } from "../constants/colors";

export default function RootLayout() {
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
      <Stack.Screen name="gym" options={{ title: "Gym" }} />
      <Stack.Screen name="hydration" options={{ title: "Hydration" }} />
    </Stack>
  );
}
import { Text, Pressable, StyleSheet, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

const sectors = [
  { title: "Rx Autopilot", sub: "Scan prescription, auto-schedule doses", color: colors.accent, route: "/medical" },
  { title: "Gym", sub: "Workouts and streaks", color: colors.teal, route: "/gym" },
  { title: "Hydration", sub: "Adaptive water reminders", color: colors.blue, route: "/hydration" },
  { title: "Coming soon", sub: "Another sector", color: colors.purple, route: null },
];

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: 64 }}
    >
      <Text style={s.hi}>Welcome back</Text>
      <Text style={s.sub}>Pick a sector</Text>
      {sectors.map((x) => (
        <Pressable
          key={x.title}
          style={[s.card, { borderLeftColor: x.color }]}
          onPress={() => x.route && router.push(x.route as any)}
        >
          <View>
            <Text style={s.cardTitle}>{x.title}</Text>
            <Text style={s.cardSub}>{x.sub}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hi: { fontSize: 30, fontWeight: "800", color: colors.text },
  sub: { color: colors.sub, marginBottom: 20, marginTop: 4 },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
    borderLeftWidth: 6,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  cardSub: { color: colors.sub, marginTop: 4 },
});
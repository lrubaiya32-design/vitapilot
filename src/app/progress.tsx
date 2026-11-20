import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { getWeeklyStats } from "../lib/weeklyProgress";
import TomorrowCard from "../components/TomorrowCard";

export default function Progress() {
  const stats = getWeeklyStats();

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.c}>
      <Text style={s.title}>This Week</Text>

      <View style={s.card}>
        <Text style={s.label}>STREAK</Text>
        <Text style={s.big}>{stats.streak} days</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>BADGE</Text>
        <Text style={s.big}>{stats.badge}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>SESSIONS THIS WEEK</Text>
        <Text style={s.big}>{stats.sessionsThisWeek}</Text>
      </View>

      <Text style={s.message}>{stats.message}</Text>

      <TomorrowCard />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: { color: colors.sub, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  big: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 6 },
  message: { color: colors.teal, fontSize: 15, marginTop: 20, lineHeight: 22, textAlign: "center" },
});
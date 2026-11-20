import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { getTomorrowSuggestion } from "../lib/health";

const levelName = { rest: "Gentle", easy: "Light", hard: "Strong" } as const;

export default function TomorrowCard() {
  const { cap, reason } = getTomorrowSuggestion();

  return (
    <View style={s.card}>
      <Text style={s.label}>TOMORROW'S SUGGESTION</Text>
      <Text style={s.big}>{levelName[cap]} intensity</Text>
      <Text style={s.reason}>{reason}</Text>
      <Text style={s.caveat}>Based on today's data — not yet saved day to day.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.blue,
  },
  label: { color: colors.sub, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  big: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 6 },
  reason: { color: colors.text, fontSize: 14, marginTop: 8, lineHeight: 20 },
  caveat: { color: colors.sub, fontSize: 11, marginTop: 10, fontStyle: "italic" },
});
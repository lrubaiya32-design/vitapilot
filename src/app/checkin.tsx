import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

const MOODS = [
  { emoji: "😣", label: "Low" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "💪", label: "Great" },
];

export default function CheckIn() {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <View style={s.c}>
      <Text style={s.title}>How are you feeling today?</Text>
      <View style={s.row}>
        {MOODS.map((m) => (
          <TouchableOpacity
            key={m.label}
            style={[s.moodBtn, picked === m.label && s.moodBtnActive]}
            onPress={() => setPicked(m.label)}
          >
            <Text style={s.emoji}>{m.emoji}</Text>
            <Text style={s.moodLabel}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {picked && (
        <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
          <Text style={s.btnText}>Save & continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: "center" },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  moodBtnActive: { borderColor: colors.teal },
  emoji: { fontSize: 28 },
  moodLabel: { color: colors.sub, marginTop: 6, fontSize: 12 },
  doneBtn: { backgroundColor: colors.teal, padding: 16, borderRadius: 14, marginTop: 28, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from "react-native";
import { colors } from "../../constants/colors";
import { useRouter, useFocusEffect } from "expo-router";
import { getConditionTag, getMeds } from "../../lib/health";
import { getConditionTip } from "../../lib/healthTips";
import { scheduleDebugDose } from "../../lib/notifications";
import { loadTaken, takenKey } from "../../lib/taken";

export default function Medical() {
  const router = useRouter();
  const [meds, setMeds] = useState(getMeds());
  const [tip, setTip] = useState(getConditionTip(getConditionTag()));
  const [taken, setTaken] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setMeds([...getMeds()]);
      setTip(getConditionTip(getConditionTag()));
      loadTaken().then(setTaken);
    }, [])
  );

  async function debugAlarm() {
    const time = await scheduleDebugDose(getMeds());
    Alert.alert("Debug alarm set", `A dose alarm is set for ${time}. Wait for it.`);
  }

  const sorted = [...meds].sort((a, b) => a.time.localeCompare(b.time));
  const doneCount = sorted.filter((m) => taken.includes(takenKey(m.name, m.time))).length;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.c}>
      <Pressable style={s.btn} onPress={() => router.push("/medical/scan")}>
        <Text style={s.btnText}>Scan prescription</Text>
      </Pressable>

      <Text style={s.h}>Today's doses</Text>
      {sorted.length > 0 && (
        <Text style={s.sub}>
          {doneCount} of {sorted.length} taken
        </Text>
      )}
      {sorted.length === 0 ? (
        <Text style={s.sub}>No medicines scheduled yet.</Text>
      ) : (
        sorted.map((m, i) => {
          const done = taken.includes(takenKey(m.name, m.time));
          return (
            <View key={i} style={[s.card, done && s.cardDone]}>
              <Text style={s.time}>{m.time}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{m.name}</Text>
                <Text style={s.sub}>{m.dosage}</Text>
              </View>
              {done ? <Text style={s.check}>✓</Text> : null}
            </View>
          );
        })
      )}

      <Text style={s.tip}>{tip}</Text>

      <Pressable style={s.debug} onPress={debugAlarm}>
        <Text style={s.debugText}>Debug: dose alarm in ~2 min</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { padding: 20 },
  btn: {
    backgroundColor: colors.accent,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  h: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 28 },
  sub: { color: colors.sub, marginTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  cardDone: { opacity: 0.6 },
  time: { color: colors.teal, fontWeight: "800", fontSize: 16, width: 64 },
  name: { color: colors.text, fontWeight: "700", fontSize: 15 },
  check: { color: colors.teal, fontSize: 24, fontWeight: "800" },
  tip: { color: colors.teal, marginTop: 16, fontSize: 14, lineHeight: 20 },
  debug: {
    marginTop: 28,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.teal,
    alignItems: "center",
  },
  debugText: { color: colors.teal, fontWeight: "700" },
});
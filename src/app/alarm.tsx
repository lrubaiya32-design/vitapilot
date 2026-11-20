import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Vibration, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { colors } from "../constants/colors";
import { snoozeDoses, scheduleMissedAlert, cancelAlert } from "../lib/notifications";
import { markTaken } from "../lib/taken";

type D = { name: string; dosage: string; time?: string };

export default function Alarm() {
  const router = useRouter();
  const { doses } = useLocalSearchParams<{ doses?: string }>();
  let list: D[] = [];
  try {
    list = doses ? JSON.parse(doses) : [];
  } catch {}

  const player = useAudioPlayer(require("../../assets/alarm.mp3"));
  const missedId = useRef<string | null>(null);

  const stop = () => {
    try {
      player.pause();
    } catch {}
    Vibration.cancel();
  };

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.loop = true;
    player.play();
    Vibration.vibrate([0, 800, 600], true);
    scheduleMissedAlert(list).then((id) => (missedId.current = id));
    const t = setTimeout(stop, 60000);
    return () => {
      clearTimeout(t);
      stop();
    };
  }, []);

  const close = () => {
    stop();
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  const taken = async () => {
    await cancelAlert(missedId.current);
    await markTaken(list);
    close();
  };

  const snooze = async () => {
    await cancelAlert(missedId.current);
    await snoozeDoses(list, 5);
    close();
  };

  return (
    <View style={s.c}>
      <Text style={s.pill}>💊</Text>
      <Text style={s.title}>Time for your medicine</Text>
      <ScrollView style={{ maxHeight: 280, alignSelf: "stretch" }}>
        {list.map((d, i) => (
          <View key={i} style={s.card}>
            <Text style={s.name}>{d.name}</Text>
            <Text style={s.dose}>Take: {d.dosage}</Text>
          </View>
        ))}
      </ScrollView>
      <Pressable style={s.taken} onPress={taken}>
        <Text style={s.takenText}>Taken</Text>
      </Pressable>
      <Pressable style={s.snooze} onPress={snooze}>
        <Text style={s.snoozeText}>Snooze 5 min</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: { fontSize: 96 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginVertical: 16 },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 14, marginTop: 10 },
  name: { color: colors.text, fontSize: 22, fontWeight: "800" },
  dose: { color: colors.teal, fontSize: 18, marginTop: 4 },
  taken: {
    backgroundColor: colors.teal,
    alignSelf: "stretch",
    padding: 18,
    borderRadius: 16,
    marginTop: 28,
  },
  takenText: { color: "#fff", fontWeight: "800", fontSize: 20, textAlign: "center" },
  snooze: {
    alignSelf: "stretch",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.sub,
  },
  snoozeText: { color: colors.text, fontWeight: "700", fontSize: 18, textAlign: "center" },
});
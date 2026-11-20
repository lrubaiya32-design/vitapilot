import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import { readPrescription } from "../../lib/gemini";
import { saveTodayDoses } from "../../lib/health";
import type { Dose } from "../../types/dose";

const isSos = (d: Dose) => /sos|as needed|prn/i.test(d.note ?? "");

export default function Scan() {
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [doses, setDoses] = useState<Dose[]>([]);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera permission is needed");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.4,
      base64: true,
    });
    if (!result.canceled) {
      setUri(result.assets[0].uri);
      setBase64(result.assets[0].base64 ?? null);
      setDoses([]);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.4,
      base64: true,
    });
    if (!result.canceled) {
      setUri(result.assets[0].uri);
      setBase64(result.assets[0].base64 ?? null);
      setDoses([]);
    }
  };

  const readIt = async () => {
    if (!base64) return;
    setLoading(true);
    try {
      const result = await readPrescription(base64);
      setDoses(result);
      if (result.length === 0) {
        Alert.alert("No medicines found", "Try a clearer photo.");
      }
    } catch (e: any) {
      Alert.alert("Could not read prescription", String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const update = (id: string, field: "medicine" | "dosage" | "time", value: string) => {
    setDoses((list) => list.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const remove = (id: string) => {
    setDoses((list) => list.filter((d) => d.id !== id));
  };

  const save = async () => {
    const timed = doses.filter((d) => !isSos(d));
    const bad = timed.find((d) => !/^\d{1,2}:\d{2}$/.test(d.time.trim()));
    if (bad) {
      Alert.alert("Check the time", `"${bad.time}" for ${bad.medicine} should look like 08:00 or 21:30.`);
      return;
    }
    const count = await saveTodayDoses(timed);
    const times = Array.from(new Set(timed.map((d) => d.time.trim()))).join(", ");
    const skipped = doses.length - timed.length;
    Alert.alert(
      "Saved",
      count > 0
        ? `${count} daily alarm${count > 1 ? "s" : ""} set (${times}).` +
            (skipped > 0 ? ` ${skipped} as-needed medicine(s) have no alarm.` : "")
        : "Medicines saved, but no alarms could be set. Check that notifications are allowed for Expo Go.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {uri ? (
        <Image source={{ uri }} style={styles.preview} />
      ) : (
        <Text style={styles.sub}>Take or pick a photo of your prescription</Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={takePhoto}>
        <Text style={styles.btnText}>Take photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.alt]} onPress={pickPhoto}>
        <Text style={styles.btnText}>Pick from gallery</Text>
      </TouchableOpacity>

      {base64 && (
        <TouchableOpacity
          style={[styles.btn, styles.read]}
          onPress={readIt}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.btnText}>Read prescription</Text>
          )}
        </TouchableOpacity>
      )}

      {doses.length > 0 && (
        <Text style={styles.hint}>
          Check each medicine. Fix anything wrong, or delete it.
        </Text>
      )}

      {doses.map((d) => (
        <View key={d.id} style={styles.card}>
          <TextInput
            style={styles.input}
            value={d.medicine}
            onChangeText={(t) => update(d.id, "medicine", t)}
            placeholder="Medicine"
            placeholderTextColor={colors.sub}
          />
          <TextInput
            style={styles.input}
            value={d.dosage}
            onChangeText={(t) => update(d.id, "dosage", t)}
            placeholder="Dosage"
            placeholderTextColor={colors.sub}
          />
          {isSos(d) ? (
            <Text style={styles.sos}>
              As needed ({d.note}) - no alarm will be set
            </Text>
          ) : (
            <TextInput
              style={styles.input}
              value={d.time}
              onChangeText={(t) => update(d.id, "time", t)}
              placeholder="Time, e.g. 08:00"
              placeholderTextColor={colors.sub}
              keyboardType="numbers-and-punctuation"
            />
          )}
          {d.note && !isSos(d) ? <Text style={styles.sub2}>{d.note}</Text> : null}
          <TouchableOpacity onPress={() => remove(d.id)}>
            <Text style={styles.del}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {doses.length > 0 && (
        <TouchableOpacity style={[styles.btn, styles.alt, { marginTop: 14 }]} onPress={save}>
          <Text style={styles.btnText}>Use for today's plan</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  sub: { color: colors.sub, textAlign: "center", marginBottom: 24 },
  hint: { color: colors.teal, marginTop: 8, marginBottom: 4 },
  preview: { width: "100%", height: 320, borderRadius: 16, marginBottom: 24 },
  btn: { backgroundColor: colors.accent, padding: 16, borderRadius: 14, marginBottom: 12 },
  alt: { backgroundColor: colors.teal },
  read: { backgroundColor: colors.purple },
  btnText: { color: colors.text, fontWeight: "700", textAlign: "center", fontSize: 16 },
  card: { backgroundColor: colors.card, padding: 14, borderRadius: 12, marginTop: 8 },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  sub2: { color: colors.sub, marginBottom: 6 },
  sos: { color: colors.teal, marginBottom: 6 },
  del: { color: "#ff6b6b", fontWeight: "700", textAlign: "right" },
});
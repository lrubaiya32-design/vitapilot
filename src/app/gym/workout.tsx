import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import {
  plans,
  completeWorkoutToday,
  bonusLevel,
  bonusPool,
  bonusReason,
} from "../../lib/gymData";
import type { Exercise, Mode } from "../../types/gym";
import ExerciseFigure from "../../components/ExerciseFigure";
import { findByIds } from "../../lib/exerciseLibrary";
import { getSafetyTip, getEncouragement } from "../../lib/healthTips";

const MAX_EXTRAS = 2;

export default function Workout() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; ids?: string; title?: string }>();
  const mode = (["hard", "easy", "rest"].includes(params.mode ?? "")
    ? params.mode
    : "easy") as Mode;
  const custom = params.ids ? findByIds(params.ids.split(",")) : [];
  const plan =
    custom.length > 0
      ? { title: params.title || "Your workout", exercises: custom }
      : plans[mode];
  const [extras, setExtras] = useState<Exercise[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [done, setDone] = useState<Record<string, number>>({});
  const [rest, setRest] = useState(0);

  useEffect(() => {
    if (rest <= 0) return;
    const t = setTimeout(() => setRest((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  const all = [...plan.exercises, ...extras];
  const totalSets = all.reduce((n, e) => n + e.sets, 0);
  const doneSets = Object.values(done).reduce((n, v) => n + v, 0);
  const finished = doneSets >= totalSets;

  const level = bonusLevel(mode);
  const options = bonusPool[level]
    .filter((o) => !extras.find((x) => x.id === o.id))
    .slice(0, 2);
  const canAddMore = extras.length < MAX_EXTRAS && options.length > 0;

  const completeSet = (id: string, sets: number, restSec: number) => {
    const current = done[id] ?? 0;
    if (current >= sets) return;
    setDone({ ...done, [id]: current + 1 });
    setRest(restSec);
  };

  const addExtra = (e: Exercise) => {
    if (extras.length >= MAX_EXTRAS) return;
    setExtras([...extras, e]);
  };

  const finish = async () => {
    const { streak, counted } = await completeWorkoutToday();
    Alert.alert(
      "Workout complete",
      counted
        ? `${getEncouragement()} Your streak is now ${streak} days.`
        : `${getEncouragement()} Already counted today. Your streak stays at ${streak} days.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const renderCard = (e: Exercise, bonus: boolean) => {
    const n = done[e.id] ?? 0;
    const complete = n >= e.sets;
    return (
      <View key={e.id} style={[s.card, complete && s.cardDone]}>
        <View style={s.row}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            {bonus && <Text style={s.bonusTag}>BONUS</Text>}
            <Text style={s.name}>{e.name}</Text>
            <Text style={s.sub}>
              {e.sets} sets x {e.reps}
            </Text>
            <Text style={s.sub}>
              Done {n}/{e.sets}
            </Text>
            <Text style={s.safetyTip}>{getSafetyTip(e.name.toLowerCase())}</Text>
            <TouchableOpacity
              style={[s.setBtn, complete && s.setBtnDone]}
              onPress={() => completeSet(e.id, e.sets, e.restSec)}
              disabled={complete}
            >
              <Text style={s.btnText}>{complete ? "All done" : "Complete set"}</Text>
            </TouchableOpacity>
          </View>
          <ExerciseFigure name={e.name} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.c}>
      <Text style={s.title}>{plan.title}</Text>
      <Text style={s.sub}>
        {doneSets} of {totalSets} sets done
      </Text>

      {rest > 0 && (
        <View style={s.rest}>
          <Text style={s.restTime}>Rest {rest}s</Text>
          <Text style={s.restTip}>Sip some water (about 250 ml).</Text>
          <TouchableOpacity onPress={() => setRest(0)}>
            <Text style={s.skip}>Skip rest</Text>
          </TouchableOpacity>
        </View>
      )}

      {plan.exercises.map((e) => renderCard(e, false))}
      {extras.map((e) => renderCard(e, true))}

      <View style={s.moreCard}>
        <Text style={s.moreLabel}>WANT TO DO A LITTLE MORE?</Text>
        <Text style={s.moreReason}>{bonusReason(mode)}</Text>

        {!showMore && canAddMore && (
          <TouchableOpacity style={s.moreBtn} onPress={() => setShowMore(true)}>
            <Text style={s.btnText}>Suggest more exercises</Text>
          </TouchableOpacity>
        )}

        {showMore &&
          canAddMore &&
          options.map((o) => (
            <View key={o.id} style={s.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.optName}>{o.name}</Text>
                <Text style={s.sub}>
                  {o.sets} sets x {o.reps}
                </Text>
              </View>
              <TouchableOpacity style={s.addBtn} onPress={() => addExtra(o)}>
                <Text style={s.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}

        {!canAddMore && (
          <Text style={s.moreDone}>
            That is enough for today. Recovery helps you get stronger.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[s.finishBtn, !finished && { opacity: 0.4 }]}
        onPress={finish}
        disabled={!finished}
      >
        <Text style={s.btnText}>Finish workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  sub: { color: colors.sub, marginTop: 4 },
  rest: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.blue,
    alignItems: "center",
  },
  restTime: { color: colors.blue, fontSize: 28, fontWeight: "800" },
  restTip: { color: colors.text, marginTop: 4 },
  skip: { color: colors.sub, marginTop: 8, fontWeight: "600" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardDone: { borderColor: colors.teal },
  row: { flexDirection: "row", alignItems: "flex-end" },
  bonusTag: { color: colors.purple, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  name: { color: colors.text, fontSize: 18, fontWeight: "700" },
  safetyTip: { color: colors.sub, fontSize: 12, marginTop: 6, fontStyle: "italic" },
  setBtn: { backgroundColor: colors.accent, padding: 12, borderRadius: 12, marginTop: 12, alignItems: "center" },
  setBtnDone: { backgroundColor: colors.teal },
  moreCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  moreLabel: { color: colors.purple, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  moreReason: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 8 },
  moreBtn: { backgroundColor: colors.purple, padding: 14, borderRadius: 12, marginTop: 12, alignItems: "center" },
  moreDone: { color: colors.sub, marginTop: 10 },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  optName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  addBtn: { backgroundColor: colors.teal, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12 },
  finishBtn: { backgroundColor: colors.purple, padding: 18, borderRadius: 16, marginTop: 20, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
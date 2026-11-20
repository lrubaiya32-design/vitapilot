import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { getHydration, addWater } from "../lib/health";

export default function Hydration() {
  const [, refresh] = useState(0);
  const h = getHydration();
  const pct = Math.min(h.drankMl / h.goalMl, 1);

  return (
    <View style={s.c}>
      <Text style={s.big}>{h.drankMl} ml</Text>
      <Text style={s.sub}>of {h.goalMl} ml today</Text>
      <View style={s.bar}>
        <View style={[s.fill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>
      <TouchableOpacity
        style={s.btn}
        onPress={() => {
          addWater(250);
          refresh((n) => n + 1);
        }}
      >
        <Text style={s.btnText}>+ 250 ml</Text>
      </TouchableOpacity>
      <Text style={s.note}>Your Gym plan uses this number in Connect mode.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  big: { color: colors.blue, fontSize: 52, fontWeight: "800", textAlign: "center" },
  sub: { color: colors.sub, textAlign: "center", marginTop: 4, fontSize: 16 },
  bar: { height: 14, backgroundColor: "#334155", borderRadius: 7, marginTop: 24, overflow: "hidden" },
  fill: { height: 14, backgroundColor: colors.blue },
  btn: { backgroundColor: colors.blue, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 28 },
  btnText: { color: "#0F172A", fontWeight: "800", fontSize: 18 },
  note: { color: colors.sub, textAlign: "center", marginTop: 20 },
});
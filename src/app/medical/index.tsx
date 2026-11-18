import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export default function Medical() {
  return (
    <View style={s.c}>
      <Pressable style={s.btn} onPress={() => alert("Scan comes next")}>
        <Text style={s.btnText}>Scan prescription</Text>
      </Pressable>
      <Text style={s.h}>Today's doses</Text>
      <Text style={s.sub}>No medicines scheduled yet.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  btn: {
    backgroundColor: colors.accent,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  h: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 28 },
  sub: { color: colors.sub, marginTop: 8 },
});
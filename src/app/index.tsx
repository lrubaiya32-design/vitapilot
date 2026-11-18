import { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

export default function Intro() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => router.replace("/login"), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.c}>
      <Animated.View style={{ opacity: fade, alignItems: "center" }}>
        <Text style={s.title}>VitaPilot</Text>
        <Text style={s.sub}>Don't just track your health. Let it run itself.</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 42, fontWeight: "800", color: colors.accent },
  sub: { fontSize: 15, color: colors.sub, marginTop: 10, textAlign: "center" },
});
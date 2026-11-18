import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <View style={s.c}>
      <Text style={s.title}>Welcome</Text>
      <TextInput
        style={s.input}
        placeholder="Email"
        placeholderTextColor={colors.sub}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={s.input}
        placeholder="Password"
        placeholderTextColor={colors.sub}
        value={pw}
        onChangeText={setPw}
        secureTextEntry
      />
      <Pressable style={s.btn} onPress={() => router.replace("/home")}>
        <Text style={s.btnText}>Log in</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 24 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
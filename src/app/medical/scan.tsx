import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../constants/colors";

export default function Scan() {
  const [uri, setUri] = useState<string | null>(null);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera permission is needed");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setUri(result.assets[0].uri);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setUri(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: "center" },
  sub: { color: colors.sub, textAlign: "center", marginBottom: 24 },
  preview: { width: "100%", height: 320, borderRadius: 16, marginBottom: 24 },
  btn: { backgroundColor: colors.accent, padding: 16, borderRadius: 14, marginBottom: 12 },
  alt: { backgroundColor: colors.teal },
  btnText: { color: colors.text, fontWeight: "700", textAlign: "center", fontSize: 16 },
});
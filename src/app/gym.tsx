import { View, Text } from "react-native";
import { colors } from "../constants/colors";

export default function Gym() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.text, fontSize: 20 }}>Gym coming soon</Text>
    </View>
  );
}
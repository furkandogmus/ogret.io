import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../src/constants/theme";

export default function SubscriptionScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Geri">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginLeft: spacing.md }}>İlk Sürüm</Text>
      </View>

      <View style={{ padding: spacing.md }}>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
          <Ionicons name="gift-outline" size={36} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", marginTop: spacing.md }}>Herkes için ücretsiz</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }}>
            İlk sürümde abonelik, paket satışı veya platform üzerinden ders ödemesi bulunmuyor.
            Öğrenci ve öğretmen ders ücretini, ödeme zamanını ve yöntemini doğrudan kendi aralarında belirler.
          </Text>
        </View>

        <View style={{ backgroundColor: "#fffbeb", borderRadius: radius.lg, borderWidth: 1, borderColor: "#fde68a", padding: spacing.md, marginTop: spacing.md }}>
          <Text style={{ color: "#78350f", fontSize: 13, lineHeight: 19 }}>
            öğret.io ödemenin tarafı, emanetçisi veya garantörü değildir. Ödeme öncesinde ders ve iptal koşullarını yazılı olarak netleştirin.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function PaymentMethodsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Geri">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginLeft: spacing.md }}>Ödeme Bilgisi</Text>
      </View>
      <View style={{ margin: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: spacing.lg }}>
        <Ionicons name="card-outline" size={36} color={colors.textMuted} />
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginTop: spacing.md }}>Platform içi ödeme kapalı</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }}>
          öğret.io kart veya banka hesabı bilgisi toplamaz. Ders ücreti ve ödeme koşulları öğrenci ile öğretmen arasında belirlenir.
        </Text>
      </View>
    </View>
  );
}

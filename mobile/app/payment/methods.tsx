import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useHaptics } from "../../src/hooks/useHaptics";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Ödeme Yöntemleri</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <TouchableOpacity
          onPress={() => haptics.light()}
          style={{
            backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
            borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.md,
          }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Kredi Kartı / Banka Kartı</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Visa, Mastercard, Troy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => haptics.light()}
          style={{
            backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.sm,
            borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.md,
          }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="logo-usd" size={24} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Havale / EFT</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Banka hesabına havale</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm }}>Ödeme Geçmişi</Text>
          <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: spacing.sm }}>Henüz ödeme yapılmadı</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

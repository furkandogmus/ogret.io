import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "../src/components/Button";
import { useToast } from "../src/components/Toast";
import { subscriptionApi } from "../src/api/services";
import { colors, spacing, radius } from "../src/constants/theme";

interface Plan {
  type: string; name: string; price: number;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[]; popular?: boolean;
}

const plans: Plan[] = [
  { type: "BASIC", name: "Basic", price: 49, icon: "rocket-outline", features: ["Standart profil", "10 ders talebi/ay", "Temel istatistikler"] },
  { type: "PREMIUM", name: "Premium", price: 99, icon: "diamond-outline", features: ["Öne çıkan profil", "Sınırsız talep", "Profil analitiği", "Öncelikli destek"], popular: true },
  { type: "VIP", name: "VIP", price: 199, icon: "star-outline", features: ["En üst sıra", "VIP rozeti", "Anında bildirim", "Öncelikli destek"] },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const toast = useToast();

  const handleSubscribe = async (planType: string) => {
    try {
      await subscriptionApi.subscribe(planType);
      toast.show("Abonelik başlatıldı", "success");
      router.back();
    } catch {
      toast.show("Abonelik başlatılamadı", "error");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginLeft: spacing.md }}>Abonelik</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.md }}>
        {plans.map((plan) => (
          <View
            key={plan.type}
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
              borderWidth: plan.popular ? 2 : 1,
              borderColor: plan.popular ? colors.primary : colors.border,
            }}
          >
            {plan.popular && (
              <View style={{ backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: spacing.sm }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>POPÜLER</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Ionicons name={plan.icon} size={24} color={plan.popular ? colors.primary : colors.textSecondary} />
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>{plan.name}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>₺{plan.price}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>/ay</Text>
              </View>
            </View>
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              {plan.features.map((f, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{f}</Text>
                </View>
              ))}
            </View>
            <Button title={`${plan.name} Başlat`} onPress={() => handleSubscribe(plan.type)} variant={plan.popular ? "primary" : "outline"} style={{ marginTop: spacing.md }} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

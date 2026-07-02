import { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../src/providers/AuthProvider";
import { useHaptics } from "../src/hooks/useHaptics";
import { colors, spacing, radius } from "../src/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const haptics = useHaptics();

  const handleLogout = () => {
    haptics.heavy();
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  };

  const sections = useMemo(() => [
    {
      title: "Genel",
      items: [
        { icon: "notifications-outline" as const, label: "Bildirimler", route: "/notifications" },
        { icon: "language-outline" as const, label: "Dil", value: "Türkçe", disabled: true },
        { icon: "lock-closed-outline" as const, label: "Şifre Değiştir", disabled: true },
      ],
    },
    {
      title: "Hesap",
      items: [
        ...(user?.role === "TUTOR" ? [
          { icon: "card-outline" as const, label: "Abonelik", route: "/subscription" },
          { icon: "id-card-outline" as const, label: "Kimlik Doğrulama", route: "/verification" },
        ] : []),
        { icon: "wallet-outline" as const, label: "Ödeme Yöntemleri", route: "/payment/methods" },
      ],
    },
    {
      title: "Destek",
      items: [
        { icon: "help-circle-outline" as const, label: "Yardım", onPress: () => Linking.openURL("https://ogret.io/yardim") },
        { icon: "document-text-outline" as const, label: "Kullanım Koşulları", onPress: () => Linking.openURL("https://ogret.io/kosullar") },
        { icon: "shield-outline" as const, label: "Gizlilik Politikası", onPress: () => Linking.openURL("https://ogret.io/gizlilik") },
      ],
    },
    {
      title: "Oturum",
      items: [
        { icon: "log-out-outline" as const, label: "Çıkış Yap", onPress: handleLogout, danger: true },
      ],
    },
  ], [handleLogout, user?.role]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }} accessibilityLabel="Geri" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Ayarlar</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}>
        {sections.map((section, si) => (
          <View key={si} style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm }}>{section.title}</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  onPress={() => {
                    if (item.disabled) return;
                    haptics.light();
                    if (item.onPress) item.onPress();
                    else if ((item as any).route) router.push((item as any).route as any);
                  }}
                  disabled={item.disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}${item.disabled ? ", kullanılamaz" : ""}`}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: spacing.md, paddingVertical: 14,
                    borderBottomWidth: ii < section.items.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <Ionicons name={item.icon} size={20} color={item.danger ? colors.error : colors.textSecondary} />
                    <Text style={{ color: item.danger ? colors.error : colors.text, fontSize: 14 }}>{item.label}</Text>
                  </View>
                  {(item as any).value ? (
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>{(item as any).value}</Text>
                  ) : !item.disabled ? (
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: spacing.lg }}>
          öğret.io v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

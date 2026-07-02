import { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../src/providers/AuthProvider";
import { useHaptics } from "../src/hooks/useHaptics";
import { colors, spacing, radius } from "../src/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
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
        { icon: "notifications-outline" as const, label: "Bildirim Tercihleri", route: "" },
        { icon: "language-outline" as const, label: "Dil", route: "", value: "Türkçe" },
        { icon: "moon-outline" as const, label: "Karanlık Mod", route: "", value: "Açık" },
      ],
    },
    {
      title: "Destek",
      items: [
        { icon: "help-circle-outline" as const, label: "Yardım", route: "", onPress: () => Linking.openURL("https://ogret.io/yardim") },
        { icon: "document-text-outline" as const, label: "Kullanım Koşulları", route: "", onPress: () => Linking.openURL("https://ogret.io/kosullar") },
        { icon: "shield-outline" as const, label: "Gizlilik Politikası", route: "", onPress: () => Linking.openURL("https://ogret.io/gizlilik") },
      ],
    },
    {
      title: "Hesap",
      items: [
        { icon: "log-out-outline" as const, label: "Çıkış Yap", onPress: handleLogout, danger: true },
      ],
    },
  ], [handleLogout]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
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
                  onPress={() => { haptics.light(); item.onPress?.(); }}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: spacing.md, paddingVertical: 14,
                    borderBottomWidth: ii < section.items.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <Ionicons name={item.icon} size={20} color={item.danger ? colors.error : colors.textSecondary} />
                    <Text style={{ color: item.danger ? colors.error : colors.text, fontSize: 14 }}>{item.label}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    {(item as any).value && <Text style={{ color: colors.textMuted, fontSize: 13 }}>{(item as any).value}</Text>}
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>
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

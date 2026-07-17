import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, TextInput, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../src/providers/AuthProvider";
import { useHaptics } from "../src/hooks/useHaptics";
import { useToast } from "../src/components/Toast";

import { Button } from "../src/components/Button";
import { authApi } from "../src/api/services";
import { colors, spacing, radius } from "../src/constants/theme";

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  route?: string;
  disabled?: boolean;
  danger?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const haptics = useHaptics();
  const toast = useToast();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    haptics.heavy();
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.show("Tüm alanları doldurun", "error");
      return;
    }
    if (newPassword.length < 12) {
      toast.show("Şifre en az 12 karakter olmalı", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.show("Yeni şifreler eşleşmiyor", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.show("Şifre başarıyla değiştirildi", "success");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.show("Şifre değiştirilemedi", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const sections = useMemo<{ title: string; items: SettingsItem[] }[]>(() => [
    {
      title: "Genel",
      items: [
        { icon: "language-outline" as const, label: "Dil", value: "Türkçe", disabled: true },
        { icon: "lock-closed-outline" as const, label: "Şifre Değiştir", onPress: () => { setShowPasswordModal(true); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } },
        { icon: "mail-outline" as const, label: "E-posta Doğrulama", onPress: () => Linking.openURL("https://ogret.io/email-dogrula") },
      ],
    },
    {
      title: "Hesap",
      items: [
        ...(user?.role === "TUTOR" ? [
          { icon: "id-card-outline" as const, label: "Kimlik Doğrulama", route: "/verification" },
        ] : []),
      ],
    },
    {
      title: "Destek",
      items: [
        { icon: "help-circle-outline" as const, label: "Yardım", onPress: () => Linking.openURL("https://ogret.io/sikca-sorulan-sorular") },
        { icon: "information-circle-outline" as const, label: "Hakkımızda", onPress: () => Linking.openURL("https://ogret.io/hakkimizda") },
        { icon: "call-outline" as const, label: "İletişim", onPress: () => Linking.openURL("https://ogret.io/iletisim") },
        { icon: "document-text-outline" as const, label: "Kullanım Koşulları", onPress: () => Linking.openURL("https://ogret.io/kullanim-kosullari") },
        { icon: "shield-outline" as const, label: "Gizlilik Politikası", onPress: () => Linking.openURL("https://ogret.io/gizlilik") },
        { icon: "warning-outline" as const, label: "Yasal Uyarı", onPress: () => Linking.openURL("https://ogret.io/yasal") },
        { icon: "flag-outline" as const, label: "Anlaşmazlık Bildirimi", onPress: () => Linking.openURL("https://ogret.io/anlasmazlik") },
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
                    else if (item.route) router.push(item.route as any);
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
                  {item.value ? (
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>{item.value}</Text>
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

      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }} activeOpacity={1} onPress={() => setShowPasswordModal(false)}>
            <TouchableOpacity activeOpacity={1} style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
              <View style={{ width: 40, height: 4, backgroundColor: colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg }} />
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: spacing.lg }}>Şifre Değiştir</Text>
              <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>Mevcut Şifre</Text>
                  <TextInput
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 48, color: colors.text, fontSize: 15 }}
                  />
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>Yeni Şifre</Text>
                  <TextInput
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="En az 12 karakter"
                    placeholderTextColor={colors.textMuted}
                    style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 48, color: colors.text, fontSize: 15 }}
                  />
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>Yeni Şifre (Tekrar)</Text>
                  <TextInput
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Yeni şifrenizi tekrar girin"
                    placeholderTextColor={colors.textMuted}
                    style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 48, color: colors.text, fontSize: 15 }}
                  />
                </View>
                <Button title="Şifreyi Değiştir" onPress={handleChangePassword} loading={changingPassword} size="lg" style={{ marginTop: spacing.sm }} />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

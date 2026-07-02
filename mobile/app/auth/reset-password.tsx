import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { DismissKeyboard } from "../../src/components/DismissKeyboard";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { authApi } from "../../src/api/services";
import { colors, spacing } from "../../src/constants/theme";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Hata", "Tüm alanları doldurun");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }
    if (!token) {
      Alert.alert("Hata", "Geçersiz bağlantı");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      Alert.alert("Hata", err?.response?.data?.message || "Şifre sıfırlanamadı");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl }}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.lg, textAlign: "center" }}>Şifren Sıfırlandı</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: spacing.sm }}>Yeni şifren ile giriş yapabilirsin.</Text>
        <Button title="Giriş Yap" onPress={() => router.replace("/auth/login")} size="lg" style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  return (
    <DismissKeyboard>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: spacing.xl }}>
          <LinearGradient colors={[colors.primary + "40", "transparent"]} style={{ position: "absolute", top: -100, left: -100, right: -100, height: 300, borderRadius: 200 }} />
          <View style={{ alignItems: "center", marginBottom: spacing.xxl }}>
            <Ionicons name="lock-open-outline" size={56} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", marginTop: spacing.md }}>Yeni Şifre Belirle</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.sm, textAlign: "center" }}>
              Yeni şifreni girerek hesabına tekrar erişebilirsin.
            </Text>
          </View>

          <Input
            label="Yeni Şifre"
            placeholder="En az 6 karakter"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
          />
          <Input
            label="Yeni Şifre (Tekrar)"
            placeholder="Şifreni tekrar gir"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
          />

          <Button title="Şifreyi Sıfırla" onPress={handleReset} loading={loading} size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}

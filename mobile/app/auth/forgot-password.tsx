import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { authApi } from "../../src/api/services";
import { colors, spacing } from "../../src/constants/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);

  const handleSubmit = async () => {
    if (!email) {
      toast.show("E-posta adresi gerekli", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      setDeliveryEnabled(data.deliveryEnabled);
      setSent(true);
      toast.show(data.message, "success");
    } catch {
      toast.show("Gönderilemedi, e-posta adresinizi kontrol edin", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl }}>
        <View style={{ alignItems: "center", marginBottom: spacing.xxl }}>
          <Ionicons name="lock-open-outline" size={64} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700", marginTop: spacing.md }}>Şifremi Unuttum</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: spacing.sm }}>
            {sent
              ? deliveryEnabled
                ? "Hesap mevcutsa e-posta adresine şifre sıfırlama bağlantısı gönderildi."
                : "Bu kurulumda e-posta gönderimi kapalı. Yöneticiniz hesabınız için geçici şifre belirleyebilir."
              : "E-posta adresinizi girin, şifre kurtarma seçeneklerini gösterelim."}
          </Text>
        </View>
        {!sent && (
          <>
            <Input label="E-posta" placeholder="ornek@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />} />
            <Button title="Gönder" onPress={handleSubmit} loading={loading} size="lg" />
          </>
        )}
        {sent && (
          <View style={{ gap: spacing.md }}>
            <Button title="Giriş Yap" onPress={() => router.push("/auth/login")} variant="outline" size="lg" />
            {deliveryEnabled && (
              <Button title="Şifre Sıfırlama Sayfasına Git" onPress={() => router.push("/auth/reset-password")} variant="outline" size="lg" />
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

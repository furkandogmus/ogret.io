import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "../../src/components/Button";
import { authApi } from "../../src/api/services";
import { colors, spacing } from "../../src/constants/theme";
import { useAuth } from "../../src/providers/AuthProvider";

export default function EmailVerifyScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Geçersiz doğrulama bağlantısı");
      return;
    }
    (async () => {
      try {
        await authApi.verifyEmail(token);
        if (user) await refreshUser();
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err?.response?.data?.message || "Doğrulama başarısız");
      }
    })();
  }, [token]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl }}>
      {status === "loading" && (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 18, marginTop: spacing.lg }}>E-posta doğrulanıyor...</Text>
        </>
      )}
      {status === "success" && (
        <>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.lg, textAlign: "center" }}>E-posta Doğrulandı</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: spacing.sm }}>Hesabın başarıyla doğrulandı.</Text>
          <Button title={user ? "Uygulamaya Dön" : "Giriş Yap"} onPress={() => router.replace(user ? "/(tabs)" : "/auth/login")} size="lg" style={{ marginTop: spacing.xl }} />
        </>
      )}
      {status === "error" && (
        <>
          <Ionicons name="close-circle" size={80} color={colors.error} />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.lg, textAlign: "center" }}>Doğrulama Başarısız</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: spacing.sm }}>{errorMessage}</Text>
          <Button title="Giriş Yap" onPress={() => router.replace("/auth/login")} size="lg" variant="outline" style={{ marginTop: spacing.xl }} />
        </>
      )}
    </View>
  );
}

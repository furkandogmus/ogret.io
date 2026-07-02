import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../src/providers/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { DismissKeyboard } from "../../src/components/DismissKeyboard";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const saved = await SecureStore.getItemAsync("biometricEmail");
      setBiometricAvailable(compatible && enrolled && !!saved);
    })();
  }, []);

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: "öğret.io'ya giriş" });
    if (result.success) {
      const savedEmail = await SecureStore.getItemAsync("biometricEmail");
      const savedPassword = await SecureStore.getItemAsync("biometricPassword");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setLoading(true);
        try {
          await login(savedEmail, savedPassword);
          router.replace("/(tabs)");
        } catch {
          Alert.alert("Hata", "Oturum açılamadı");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      if (email && password) {
        await SecureStore.setItemAsync("biometricEmail", email);
        await SecureStore.setItemAsync("biometricPassword", password);
      }
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Hata", err?.response?.data?.message || "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DismissKeyboard>
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl }}>
        <LinearGradient colors={[colors.primary + "40", "transparent"]} style={{ position: "absolute", top: -100, left: -100, right: -100, height: 300, borderRadius: 200 }} />
        <View style={{ alignItems: "center", marginBottom: spacing.xxl }}>
          <Text style={{ color: colors.text, fontSize: 36, fontWeight: "700" }}>öğret.io</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: spacing.sm }}>
            Online özel ders platformuna hoş geldin
          </Text>
        </View>

        <Input
          label="E-posta"
          placeholder="ornek@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
        />

        <Input
          label="Şifre"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          }
        />

        <Button title="Giriş Yap" onPress={handleLogin} loading={loading} size="lg" />

        {biometricAvailable && (
          <TouchableOpacity onPress={handleBiometric} style={{ marginTop: spacing.md, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: spacing.sm }}>
            <Ionicons name="finger-print" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "500" }}>Parmak İzi / Yüz ile Giriş</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/auth/forgot-password")} style={{ marginTop: spacing.sm, alignItems: "center" }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Şifremi Unuttum</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={{ marginTop: spacing.lg, alignItems: "center" }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Hesabın yok mu?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Kaydol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Switch } from "react-native";
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
  const [saveBiometric, setSaveBiometric] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const saved = await SecureStore.getItemAsync("biometricEmail");
      const hasSaved = !!(compatible && enrolled && !!saved);
      setBiometricAvailable(compatible && enrolled);
      if (hasSaved && !saved) setBiometricAvailable(false);
      const creds = await SecureStore.getItemAsync("biometricCredentials");
      setSaveBiometric(!!creds);
    })();
  }, []);

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: "öğret.io'ya giriş" });
    if (result.success) {
      const savedEmail = await SecureStore.getItemAsync("biometricEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        const savedCredentials = await SecureStore.getItemAsync("biometricCredentials");
        if (savedCredentials) {
          try {
            const { pwd } = JSON.parse(savedCredentials);
            setPassword(pwd);
            setLoading(true);
            await login(savedEmail, pwd);
            router.replace("/(tabs)");
          } catch {
            Alert.alert("Hata", "Oturum açılamadı. Şifrenizi tekrar girin.");
            setShowPassword(false);
          } finally {
            setLoading(false);
          }
        } else {
          setShowPassword(false);
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
      if (email) {
        await SecureStore.setItemAsync("biometricEmail", email);
      }
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Hata", err?.response?.data?.message || "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSaveCredentials = async (pwd: string) => {
    try {
      await SecureStore.setItemAsync("biometricCredentials", JSON.stringify({ pwd }));
    } catch { /* */ }
  };

  const handleLoginWithBiometricSave = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      if (email) {
        await SecureStore.setItemAsync("biometricEmail", email);
        await handleBiometricSaveCredentials(password);
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

        <Button title="Giriş Yap" onPress={saveBiometric ? handleLoginWithBiometricSave : handleLogin} loading={loading} size="lg" />

        {biometricAvailable && (
          <>
            <TouchableOpacity onPress={handleBiometric} style={{ marginTop: spacing.md, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: spacing.sm }}>
              <Ionicons name="finger-print" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "500" }}>Parmak İzi / Yüz ile Giriş</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Biyometrik girişi hatırla</Text>
              <Switch value={saveBiometric} onValueChange={setSaveBiometric} trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }} thumbColor={saveBiometric ? colors.primary : colors.textMuted} />
            </View>
          </>
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

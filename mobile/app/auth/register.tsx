import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/providers/AuthProvider";
import { DismissKeyboard } from "../../src/components/DismissKeyboard";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { colors, spacing } from "../../src/constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !phone) {
      Alert.alert("Hata", "Tüm alanları doldurun");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır");
      return;
    }
    setLoading(true);
    try {
      await register({ email, phone, password, fullName, role });
      Alert.alert("E-postanızı doğrulayın", "Hesabınız oluşturuldu. Giriş yapmadan önce e-postanıza gönderilen bağlantıyı açın.", [
        { text: "Girişe git", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (err: any) {
      Alert.alert("Hata", err?.response?.data?.message || "Kayıt yapılamadı");
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: spacing.xl }}>
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>Kaydol</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs }}>
            Aramıza katıl
          </Text>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 3, marginBottom: spacing.lg }}>
          {(["STUDENT", "TUTOR"] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: role === r ? colors.primary : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ color: role === r ? "#fff" : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                {r === "STUDENT" ? "Öğrenci" : "Öğretmen"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Ad Soyad"
          placeholder="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
        />
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
          label="Telefon"
          placeholder="05XX XXX XX XX"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={18} color={colors.textMuted} />}
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

        <Button title="Kaydol" onPress={handleRegister} loading={loading} size="lg" />

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: spacing.lg, alignItems: "center" }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Zaten hesabın var mı?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}

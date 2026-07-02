import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useAuth } from "../../src/providers/AuthProvider";
import { userApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";


function formatPhoneDisplay(digits: string) {
  if (digits.length < 4) return digits;
  const s = digits.slice(0, 3);
  const m = digits.slice(3, 6);
  const e = digits.slice(6, 8);
  const l = digits.slice(8, 10);
  let result = `${s} ${m}`;
  if (e) result += ` ${e}`;
  if (l) result += ` ${l}`;
  return result;
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const rawPhone = (user?.phone || "").replace("+90", "");
  const [phoneDigits, setPhoneDigits] = useState(rawPhone);

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 10);
    setPhoneDigits(digits);
  };
  const [bio, setBio] = useState(user?.bio || "");
  const [education, setEducation] = useState(user?.education || "");
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.show("Ad Soyad alanı boş bırakılamaz", "error");
      return;
    }

    setLoading(true);
    try {
      await userApi.updateProfile({
        fullName,
        phone: phoneDigits ? `+90${phoneDigits}` : "",
        bio,
        education,
      });

      await refreshUser();
      toast.show("Profiliniz başarıyla güncellendi", "success");
      router.back();
    } catch {
      toast.show("Profil güncellenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Profili Düzenle</Text>
        <Button title="Kaydet" onPress={handleSave} loading={loading} size="sm" haptic="medium" />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {/* Profile Info Section */}
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", textTransform: "uppercase", marginBottom: spacing.md, letterSpacing: 1 }}>
          Genel Bilgiler
        </Text>
        
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          <Input label="Ad Soyad" value={fullName} onChangeText={setFullName} placeholder="Adınız ve soyadınız" />
          <Input label="Telefon" value={formatPhoneDisplay(phoneDigits)} onChangeText={handlePhoneChange} placeholder="5xx xxx xx xx" keyboardType="phone-pad" />
          <Input label="Eğitim" value={education} onChangeText={setEducation} placeholder="Örn: Boğaziçi Üniversitesi Matematik mezunu" />
          <Input label="Biyografi" value={bio} onChangeText={setBio} multiline placeholder="Kendinizden bahsedin, öğrencilerin sizi tanımasını sağlayın..." />
        </View>
      </ScrollView>
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useAuth } from "../../src/providers/AuthProvider";
import { userApi } from "../../src/api/services";
import { colors, spacing } from "../../src/constants/theme";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [education, setEducation] = useState(user?.education || "");
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate?.toString() || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({
        fullName,
        bio,
        education,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      });
      await refreshUser();
      toast.show("Profil güncellendi", "success");
      router.back();
    } catch {
      toast.show("Profil güncellenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Profili Düzenle</Text>
        <Button title="Kaydet" onPress={handleSave} loading={loading} size="sm" />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input label="Ad Soyad" value={fullName} onChangeText={setFullName} />
        <Input label="Biyografi" value={bio} onChangeText={setBio} multiline numberOfLines={3} />
        <Input label="Eğitim" value={education} onChangeText={setEducation} />
        {user?.role === "TUTOR" && (
          <Input label="Saatlik Ücret (₺)" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
        )}
      </ScrollView>
    </View>
  );
}

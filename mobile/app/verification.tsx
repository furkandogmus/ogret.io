import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../src/components/Button";
import { useToast } from "../src/components/Toast";
import { fileApi, verificationApi } from "../src/api/services";
import { colors, spacing, radius } from "../src/constants/theme";

export default function VerificationScreen() {
  const router = useRouter();
  const toast = useToast();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.show("Galeri izni gerekli", "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast.show("Kamera izni gerekli", "error");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      toast.show("Lütfen bir kimlik belgesi fotoğrafı seçin", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await fileApi.upload(imageUri, "IDENTITY_DOCUMENT");
      await verificationApi.submit({ documentType: "IDENTITY", documentUrl: data.url });
      toast.show("Doğrulama başvurunuz alındı", "success");
      router.back();
    } catch {
      toast.show("Gönderilemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginLeft: spacing.md }}>Kimlik Doğrulama</Text>
      </View>
      <View style={{ padding: spacing.md }}>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
            <Ionicons name="shield-checkmark-outline" size={64} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginTop: spacing.md }}>
              Kimliğini Doğrula
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: "center", marginTop: spacing.xs }}>
              Kimlik belgeni yükle, admin onayından sonra doğrulanmış rozeti kazan
            </Text>
          </View>

          {imageUri ? (
            <View style={{ alignItems: "center", marginBottom: spacing.md }}>
              <Image source={{ uri: imageUri }} style={{ width: 200, height: 140, borderRadius: radius.md }} resizeMode="cover" />
              <TouchableOpacity onPress={() => setImageUri(null)} style={{ marginTop: spacing.sm }}>
                <Text style={{ color: colors.error, fontSize: 13 }}>Farklı bir fotoğraf seç</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
              <TouchableOpacity onPress={takePhoto} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="camera" size={32} color={colors.primary} />
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickImage} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="images" size={32} color={colors.primary} />
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Galeri</Text>
              </TouchableOpacity>
            </View>
          )}

          <Button title="Başvuruyu Gönder" onPress={handleSubmit} loading={loading} size="lg" disabled={!imageUri} />
        </View>
      </View>
    </View>
  );
}

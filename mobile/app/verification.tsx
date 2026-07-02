import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { useToast } from "../src/components/Toast";
import { verificationApi } from "../src/api/services";
import { colors, spacing, radius } from "../src/constants/theme";

export default function VerificationScreen() {
  const router = useRouter();
  const [documentUrl, setDocumentUrl] = useState("");
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!documentUrl) {
      toast.show("Belge URL'si gerekli", "error");
      return;
    }
    setLoading(true);
    try {
      await verificationApi.submit({ documentType: "IDENTITY", documentUrl });
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
          <Input label="Belge URL'si" value={documentUrl} onChangeText={setDocumentUrl} placeholder="https://..." />
          <Button title="Başvuruyu Gönder" onPress={handleSubmit} loading={loading} size="lg" />
        </View>
      </View>
    </View>
  );
}

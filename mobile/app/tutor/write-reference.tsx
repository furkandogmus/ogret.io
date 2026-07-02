import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { tutorApi, referenceApi } from "../../src/api/services";
import type { User } from "../../src/types";
import { Avatar } from "../../src/components/Avatar";
import { useToast } from "../../src/components/Toast";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function WriteReferenceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [tutor, setTutor] = useState<User | null>(null);
  const [loadingTutor, setLoadingTutor] = useState(true);
  const [recommenderName, setRecommenderName] = useState("");
  const [recommenderEmail, setRecommenderEmail] = useState("");
  const [recommenderTitle, setRecommenderTitle] = useState("Eski Öğrenci");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    tutorApi.getById(id)
      .then(({ data }) => setTutor(data))
      .catch(() => setError("Öğretmen bilgisi alınamadı"))
      .finally(() => setLoadingTutor(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    setError("");

    if (!recommenderName.trim()) { setError("Adınızı ve soyadınızı girin."); return; }
    if (!recommenderEmail.trim() || !recommenderEmail.includes("@")) { setError("Geçerli bir e-posta girin."); return; }
    if (!comment.trim() || comment.length < 10) { setError("En az 10 karakterlik bir tavsiye yazın."); return; }

    setSubmitting(true);
    try {
      await referenceApi.create(id, { recommenderName, recommenderEmail, recommenderTitle, comment });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gönderilirken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTutor) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!tutor) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Öğretmen bulunamadı</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>Ana sayfaya dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: spacing.md }}>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, width: "100%", alignItems: "center" }}>
          <View style={{ width: 64, height: 64, backgroundColor: colors.surfaceLight, borderRadius: radius.xl, justifyContent: "center", alignItems: "center", marginBottom: spacing.md }}>
            <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: spacing.sm }}>Tavsiyeniz Alındı!</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
            {tutor.fullName} için tavsiyeniz iletildi. Admin onayından sonra profilde yayınlanacaktır.
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/tutor/${tutor.id}`)}
            style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 12, width: "100%", alignItems: "center", marginTop: 24 }}
          >
            <Text style={{ color: colors.buttonText, fontSize: 14, fontWeight: "700" }}>Öğretmen Profiline Git</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.md, paddingTop: 56 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 24 }}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>Geri Dön</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          <View style={{ height: 56, backgroundColor: colors.primary }} />
          <View style={{ padding: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md, marginTop: -40, marginBottom: spacing.md }}>
              <Avatar uri={tutor.avatarUrl} name={tutor.fullName} size={64} />
              <View style={{ marginTop: 24 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>{tutor.fullName} için Tavsiye Yaz</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tutor.education || "Öğretmen"}</Text>
              </View>
            </View>

            {error ? (
              <View style={{ backgroundColor: "#FEE2E2", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md }}>
                <Text style={{ color: "#DC2626", fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>Adınız ve Soyadınız</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
                  placeholder="Ad Soyad"
                  placeholderTextColor={colors.textMuted}
                  value={recommenderName}
                  onChangeText={setRecommenderName}
                />
              </View>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>E-posta Adresiniz</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={recommenderEmail}
                  onChangeText={setRecommenderEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>Yakınlık Dereceniz</Text>
                <View style={{ flexDirection: "row", gap: spacing.xs }}>
                  {["Eski Öğrenci", "Öğrenci Velisi", "Meslektaş", "Diğer"].map((title) => (
                    <TouchableOpacity
                      key={title}
                      onPress={() => setRecommenderTitle(title)}
                      style={{
                        backgroundColor: recommenderTitle === title ? colors.primary : colors.background,
                        borderRadius: radius.full,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: recommenderTitle === title ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={{ color: recommenderTitle === title ? colors.buttonText : colors.textSecondary, fontSize: 12, fontWeight: "500" }}>{title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>Tavsiye Yazınız</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, minHeight: 100, textAlignVertical: "top" }}
                  placeholder="Öğretmeniniz hakkındaki olumlu deneyimlerinizi yazın..."
                  placeholderTextColor={colors.textMuted}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={5}
                />
              </View>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 12, alignItems: "center", opacity: submitting ? 0.5 : 1 }}
              >
                <Text style={{ color: colors.buttonText, fontSize: 14, fontWeight: "700" }}>
                  {submitting ? "Gönderiliyor..." : "Tavsiye Gönder"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

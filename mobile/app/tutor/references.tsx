import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { referenceApi } from "../../src/api/services";
import type { Reference } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function ReferencesScreen() {
  const router = useRouter();
  const toast = useToast();
  const haptics = useHaptics();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReferences = useCallback(async () => {
    try {
      const { data } = await referenceApi.getMyReferences();
      setReferences(data);
    } catch { /* */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useState(() => { fetchReferences(); });

  const handleSubmit = async () => {
    if (!name || !email || !comment) {
      toast.show("Ad, e-posta ve yorum zorunlu", "error");
      return;
    }
    setSubmitting(true);
    try {
      await referenceApi.create("me", {
        recommenderName: name,
        recommenderEmail: email,
        recommenderTitle: title,
        comment,
      });
      haptics.success();
      toast.show("Referans başvurusu gönderildi", "success");
      setShowForm(false);
      setName(""); setEmail(""); setTitle(""); setComment("");
      fetchReferences();
    } catch {
      toast.show("Gönderilemedi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.textMuted }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Referanslar</Text>
        <Button title="Ekle" onPress={() => setShowForm(!showForm)} size="sm" icon={<Ionicons name="add" size={16} color="#fff" />} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReferences(); }} tintColor={colors.primary} />}
      >
        {showForm && (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ color: colors.text, fontWeight: "600", marginBottom: spacing.md }}>Yeni Referans</Text>
            <Input label="Ad Soyad" value={name} onChangeText={setName} placeholder="Referans kişinin adı" />
            <Input label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@email.com" autoCapitalize="none" keyboardType="email-address" />
            <Input label="Ünvan" value={title} onChangeText={setTitle} placeholder="Örn: Proje Yöneticisi" />
            <Input label="Yorum" value={comment} onChangeText={setComment} multiline numberOfLines={3} placeholder="Referans hakkında yorum..." />
            <Button title="Gönder" onPress={handleSubmit} loading={submitting} size="lg" />
          </View>
        )}

        {references.length === 0 && !showForm ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: spacing.sm }}>Henüz referans eklenmemiş</Text>
            <Button title="Referans Ekle" onPress={() => setShowForm(true)} style={{ marginTop: spacing.md }} />
          </View>
        ) : (
          references.map((ref) => (
            <View key={ref.id} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>{ref.recommenderName}</Text>
                <View style={{
                  backgroundColor: ref.status === "APPROVED" ? colors.success + "20" : ref.status === "REJECTED" ? colors.error + "20" : colors.warning + "20",
                  borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3,
                }}>
                  <Text style={{
                    color: ref.status === "APPROVED" ? colors.success : ref.status === "REJECTED" ? colors.error : colors.warning,
                    fontSize: 11, fontWeight: "600",
                  }}>
                    {ref.status === "APPROVED" ? "Onaylı" : ref.status === "REJECTED" ? "Red" : "Bekliyor"}
                  </Text>
                </View>
              </View>
              {ref.recommenderTitle && (
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{ref.recommenderTitle}</Text>
              )}
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm }}>{ref.comment}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

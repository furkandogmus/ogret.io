import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LessonCard } from "../../src/components/LessonCard";
import { useAuth } from "../../src/providers/AuthProvider";
import { useToast } from "../../src/components/Toast";
import { lessonApi } from "../../src/api/services";
import type { Lesson } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function TutorPanel() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"pending" | "confirmed" | "past">("pending");

  const fetchLessons = useCallback(async () => {
    try {
      const { data } = await lessonApi.list("tutor");
      setLessons(data);
    } catch { /* */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const filtered = lessons.filter((l) => {
    if (filter === "pending") return l.status === "PENDING";
    if (filter === "confirmed") return ["CONFIRMED", "IN_PROGRESS"].includes(l.status);
    return ["COMPLETED", "CANCELLED"].includes(l.status);
  });

  const pending = lessons.filter((l) => l.status === "PENDING");
  const confirmed = lessons.filter((l) => l.status === "CONFIRMED");

  const handleConfirm = async (id: string) => {
    try {
      await lessonApi.confirm(id);
      toast.show("Ders onaylandı", "success");
      fetchLessons();
    } catch { toast.show("Onaylanamadı", "error"); }
  };

  const handleCancel = (id: string) => {
    Alert.alert("İptal Et", "Dersi iptal etmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "İptal Et", style: "destructive", onPress: async () => {
        try {
          await lessonApi.cancel(id);
          toast.show("Ders iptal edildi", "success");
          fetchLessons();
        } catch { toast.show("İptal edilemedi", "error"); }
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Öğretmen Paneli</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>Hoş geldin, {user?.fullName}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.warning, fontSize: 24, fontWeight: "700" }}>{pending.length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Talep</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.success, fontSize: 24, fontWeight: "700" }}>{confirmed.length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Onaylı</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        {(["pending", "confirmed", "past"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: filter === f ? colors.primary : colors.surface }}
          >
            <Text style={{ color: filter === f ? "#fff" : colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
              {f === "pending" ? "Talepler" : f === "confirmed" ? "Onaylı" : "Geçmiş"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <LessonCard lesson={item} userRole="TUTOR" onPress={() => router.push(`/lesson/${item.id}`)} onCancel={item.status === "PENDING" ? () => handleCancel(item.id) : undefined} onComplete={item.status === "CONFIRMED" ? () => handleConfirm(item.id) : undefined} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLessons(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          : <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: spacing.sm }}>Henüz ders talebi yok</Text>
            </View>
        }
      />
    </View>
  );
}

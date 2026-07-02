import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LessonCard } from "../../src/components/LessonCard";
import { EmptyState } from "../../src/components/EmptyState";
import { useAuth } from "../../src/providers/AuthProvider";
import { useToast } from "../../src/components/Toast";
import { lessonApi } from "../../src/api/services";
import type { Lesson } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function StudentDashboard() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const fetchLessons = useCallback(async () => {
    try {
      const { data } = await lessonApi.list("student");
      setLessons(data);
    } catch { toast.show("Dersler yüklenemedi", "error"); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const filtered = useMemo(() => lessons.filter((l) => {
    if (filter === "upcoming") return ["PENDING", "CONFIRMED"].includes(l.status);
    if (filter === "past") return ["COMPLETED", "CANCELLED"].includes(l.status);
    return true;
  }), [lessons, filter]);

  const upcoming = useMemo(() => lessons.filter((l) => ["PENDING", "CONFIRMED"].includes(l.status)), [lessons]);
  const pending = useMemo(() => lessons.filter((l) => l.status === "PENDING"), [lessons]);

  const handleCancel = (lessonId: string) => {
    Alert.alert("İptal Et", "Dersi iptal etmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "İptal Et", style: "destructive", onPress: async () => {
        try {
          await lessonApi.cancel(lessonId);
          toast.show("Ders iptal edildi", "success");
          fetchLessons();
        } catch { toast.show("İptal edilemedi", "error"); }
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Öğrenci Paneli</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>Hoş geldin, {user?.fullName}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.warning, fontSize: 24, fontWeight: "700" }}>{pending.length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Bekleyen</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "700" }}>{upcoming.length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Yaklaşan</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        {(["upcoming", "past", "all"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
              backgroundColor: filter === f ? colors.primary : colors.surface,
            }}
          >
            <Text style={{ color: filter === f ? "#fff" : colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
              {f === "upcoming" ? "Yaklaşan" : f === "past" ? "Geçmiş" : "Tümü"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => <LessonCard lesson={item} userRole="STUDENT" onPress={() => router.push(`/lesson/${item.id}`)} onCancel={() => handleCancel(item.id)} onMessage={() => router.push(`/messages/${item.tutor.id}`)} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLessons(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          : <EmptyState icon="calendar-outline" title="Henüz dersin yok" subtitle="Bir öğretmen bulup ders talebi gönder" />
        }
      />
    </View>
  );
}

import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../src/components/Avatar";
import { LessonCard } from "../../../src/components/LessonCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { useToast } from "../../../src/components/Toast";
import { lessonApi, userApi } from "../../../src/api/services";
import { colors, spacing } from "../../../src/constants/theme";
import type { Lesson, User } from "../../../src/types";

export default function StudentLessonsScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [lessonsRes, userRes] = await Promise.all([
          lessonApi.list("tutor", studentId),
          userApi.getById(studentId),
        ]);
        setLessons(lessonsRes.data);
        setStudent(userRes.data);
      } catch {
        toast.show("Dersler yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Avatar uri={student?.avatarUrl} name={student?.fullName || ""} size={36} />
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginLeft: spacing.sm, flex: 1 }}>
          {student?.fullName || "Öğrenci"}
        </Text>
        <Ionicons name="close" size={24} color={colors.text} onPress={() => router.back()} />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: spacing.sm, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>{lessons.length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Toplam Ders</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: spacing.sm, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.success, fontSize: 20, fontWeight: "700" }}>{lessons.filter(l => l.status === "COMPLETED").length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Tamamlanan</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: spacing.sm, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.warning, fontSize: 20, fontWeight: "700" }}>{lessons.filter(l => l.status === "PENDING" || l.status === "CONFIRMED" || l.status === "IN_PROGRESS").length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Aktif</Text>
        </View>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <LessonCard
            lesson={item}
            userRole="TUTOR"
            onPress={() => router.push(`/lesson/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="Henüz ders yok" subtitle="Bu öğrenciyle henüz bir ders geçmişiniz bulunmuyor." />
        }
      />
    </View>
  );
}

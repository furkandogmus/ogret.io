import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/providers/AuthProvider";
import { useToast } from "../../src/components/Toast";
import { lessonApi } from "../../src/api/services";
import type { Lesson } from "../../src/types";
import { colors, spacing, radius, statusColors, statusLabels } from "../../src/constants/theme";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const toast = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await lessonApi.list();
        const found = Array.isArray(data) ? data.find((l: Lesson) => l.id === id) : null;
        setLesson(found || null);
      } catch { /* */ }
    })();
  }, [id]);

  if (!lesson) return null;

  const otherUser = me?.id === lesson.tutor.id ? lesson.student : lesson.tutor;
  const isStudent = me?.id === lesson.student.id;
  const isTutor = me?.id === lesson.tutor.id;
  const canReview = lesson.status === "COMPLETED" && isStudent;
  const canReschedule = ["PENDING", "CONFIRMED"].includes(lesson.status);

  const handleCopyLink = async () => {
    if (lesson.meetingLink) {
      await Clipboard.setStringAsync(lesson.meetingLink);
      toast.show("Bağlantı kopyalandı", "success");
    }
  };

  const handleOpenLink = () => {
    if (lesson.meetingLink) Linking.openURL(lesson.meetingLink);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
        <Avatar uri={otherUser.avatarUrl} name={otherUser.fullName} size={80} online={otherUser.online} />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginTop: spacing.md }}>{otherUser.fullName}</Text>
        <View style={{ backgroundColor: statusColors[lesson.status] + "20", borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 4, marginTop: spacing.sm, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="ellipse" size={8} color={statusColors[lesson.status]} />
          <Text style={{ color: statusColors[lesson.status], fontSize: 13, fontWeight: "600" }}>{statusLabels[lesson.status]}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.md }}>Ders Bilgileri</Text>
          <Row icon="book-outline" label="Konu" value={lesson.subject.name} />
          <Row icon="calendar-outline" label="Tarih" value={new Date(lesson.lessonDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} />
          <Row icon="time-outline" label="Saat" value={`${lesson.startTime.slice(0, 5)} - ${lesson.endTime.slice(0, 5)} (${lesson.durationMinutes} dk)`} />
          <Row icon="cash-outline" label="Ücret" value={`₺${lesson.price}`} />
          {lesson.notes && <Row icon="document-text-outline" label="Notlar" value={lesson.notes} />}
          {lesson.cancellationReason && <Row icon="alert-circle-outline" label="İptal Nedeni" value={lesson.cancellationReason} color={colors.error} />}
        </View>

        {lesson.meetingLink && (["CONFIRMED", "IN_PROGRESS"].includes(lesson.status)) && (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm }}>Ders Bağlantısı</Text>
            <TouchableOpacity onPress={handleOpenLink} style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.md, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Ionicons name="videocam" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 14, flex: 1 }} numberOfLines={1}>{lesson.meetingLink}</Text>
              <TouchableOpacity onPress={handleCopyLink} hitSlop={8}>
                <Ionicons name="copy-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
              <Button title="Bağlantıyı Aç" onPress={handleOpenLink} size="sm" variant="primary" icon={<Ionicons name="open-outline" size={14} color="#fff" />} style={{ flex: 1 }} />
              <Button title="Kopyala" onPress={handleCopyLink} size="sm" variant="outline" icon={<Ionicons name="copy-outline" size={14} color={colors.primary} />} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {canReschedule && (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button title="Yeniden Planla" onPress={() => router.push(`/lesson/request?tutorId=${lesson.tutor.id}`)} variant="outline" size="md" icon={<Ionicons name="calendar" size={16} color={colors.primary} />} style={{ flex: 1 }} />
            <Button title={isStudent ? "İptal Et" : "Reddet"} onPress={() => {
              Alert.alert("İptal Et", "Emin misiniz?", [
                { text: "Vazgeç", style: "cancel" },
                { text: "İptal Et", style: "destructive", onPress: async () => {
                  try {
                    await lessonApi.cancel(id);
                    toast.show("Ders iptal edildi", "success");
                    router.back();
                  } catch { toast.show("İptal edilemedi", "error"); }
                }},
              ]);
            }} variant="outline" size="md" style={{ flex: 1 }} haptic="medium" />
          </View>
        )}

        {canReview && (
          <Button title="Değerlendir" onPress={() => router.push(`/lesson/review?lessonId=${id}`)} variant="primary" size="lg" icon={<Ionicons name="star" size={18} color="#fff" />} haptic="medium" />
        )}
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm }}>
      <Ionicons name={icon} size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: color || colors.text, fontSize: 14, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

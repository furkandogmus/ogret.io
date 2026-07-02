import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, RefreshControl, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "../../src/components/Avatar";
import { AvatarPicker } from "../../src/components/AvatarPicker";
import { LessonCard } from "../../src/components/LessonCard";
import { EmptyState } from "../../src/components/EmptyState";
import { useAuth } from "../../src/providers/AuthProvider";
import { useToast } from "../../src/components/Toast";
import { fileApi, userApi, lessonApi } from "../../src/api/services";
import type { Lesson } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const toast = useToast();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAvatarFull, setShowAvatarFull] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  const isTutor = user?.role === "TUTOR";

  const fetchLessons = useCallback(async () => {
    try {
      const { data } = await lessonApi.list(isTutor ? "tutor" : "student");
      setLessons(data);
    } catch { /* */ }
    setLessonsLoading(false);
  }, [isTutor]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refreshUser(); await fetchLessons(); } catch { /* */ }
    setRefreshing(false);
  }, [refreshUser, fetchLessons]);

  const handleAvatarPicked = async (uri: string) => {
    try {
      const { data } = await fileApi.upload(uri);
      if (data.url) {
        await userApi.updateAvatar(data.url);
      }
      await refreshUser();
      toast.show("Fotoğraf güncellendi", "success");
    } catch {
      toast.show("Yüklenemedi", "error");
    }
  };

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  };

  type MenuItem = { icon: keyof typeof Ionicons.glyphMap; label: string; route?: string; action?: () => void; danger?: boolean };
  const menuItems: MenuItem[] = useMemo(() => [
    ...(isTutor ? [
      { icon: "card-outline" as const, label: "Abonelik", route: "/subscription" },
      { icon: "id-card-outline" as const, label: "Kimlik Doğrulama", route: "/verification" },
      { icon: "calendar-outline" as const, label: "Müsaitlik", route: "/tutor/availability" },
      { icon: "list-outline" as const, label: "İlanlarım", route: "/tutor/listings" },
      { icon: "document-text-outline" as const, label: "Referanslar", route: "/tutor/references" },
    ] : []),
    { icon: "notifications-outline" as const, label: "Bildirimler", route: "/notifications" },
    { icon: "person-outline" as const, label: "Profili Düzenle", route: "/profile/edit" },
    { icon: "heart-outline" as const, label: "Favorilerim", route: "/favorites/index" },
    { icon: "wallet-outline" as const, label: "Ödeme Yöntemleri", route: "/payment/methods" },
    { icon: "newspaper-outline" as const, label: "Blog", route: "/blog/index" },
    { icon: "settings-outline" as const, label: "Ayarlar", route: "/settings" },
    { icon: "log-out-outline" as const, label: "Çıkış Yap", action: handleLogout, danger: true },
  ], [isTutor]);

  const roleLabels = { STUDENT: "Öğrenci", TUTOR: "Öğretmen", ADMIN: "Admin" };

  const pendingLessons = useMemo(() => lessons.filter((l) => l.status === "PENDING"), [lessons]);
  const upcomingLessons = useMemo(() => lessons.filter((l) => ["CONFIRMED", "IN_PROGRESS"].includes(l.status)), [lessons]);

  const handleConfirm = async (id: string) => {
    try {
      await lessonApi.confirm(id);
      toast.show("Ders onaylandı", "success");
      fetchLessons();
    } catch { toast.show("Onaylanamadı", "error"); }
  };

  const handleStart = async (id: string) => {
    try {
      await lessonApi.start(id);
      toast.show("Ders başlatıldı", "success");
      fetchLessons();
    } catch { toast.show("Ders başlatılamadı", "error"); }
  };

  const handleComplete = async (id: string) => {
    try {
      await lessonApi.complete(id);
      toast.show("Ders tamamlandı", "success");
      fetchLessons();
    } catch { toast.show("Ders tamamlanamadı", "error"); }
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
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Profil</Text>
      </View>

      <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
        <TouchableOpacity onPress={() => user?.avatarUrl ? setShowAvatarFull(true) : setShowAvatarPicker(true)} onLongPress={() => setShowAvatarPicker(true)}>
          <Avatar uri={user?.avatarUrl} name={user?.fullName || ""} size={80} />
          <View style={{ position: "absolute", bottom: 0, right: -4, backgroundColor: colors.primary, borderRadius: 14, width: 28, height: 28, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.background }}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginTop: spacing.md }}>{user?.fullName}</Text>
        <View style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{roleLabels[user?.role || "STUDENT"]}</Text>
        </View>
        {user?.email && (
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: spacing.sm }}>{user.email}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="star" size={22} color={colors.star} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18, marginTop: 4 }}>{user?.ratingAvg?.toFixed(1) || "-"}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Puan</Text>
          </View>
          {isTutor && (
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="cash" size={22} color={colors.success} />
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18, marginTop: 4 }}>₺{user?.hourlyRate || "-"}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>Saatlik</Text>
            </View>
          )}
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="school" size={22} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18, marginTop: 4 }}>{user?.ratingCount || 0}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Yorum</Text>
          </View>
        </View>
      </View>

      {/* Lesson stats */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: spacing.sm }}>Derslerim</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.warning, fontSize: 24, fontWeight: "700" }}>{pendingLessons.length}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{isTutor ? "Talep" : "Bekleyen"}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.success, fontSize: 24, fontWeight: "700" }}>{upcomingLessons.length}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Yaklaşan</Text>
          </View>
        </View>
      </View>

      {/* Lesson list */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
        {lessonsLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : lessons.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Henüz dersin yok" subtitle="Bir öğretmen bulup ders talebi gönder" />
        ) : (
          lessons.map((lesson) => (
            <View key={lesson.id} style={{ marginBottom: spacing.sm }}>
              <LessonCard
                lesson={lesson}
                userRole={isTutor ? "TUTOR" : "STUDENT"}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                onCancel={["PENDING", "CONFIRMED"].includes(lesson.status) ? () => handleCancel(lesson.id) : undefined}
                onComplete={
                  isTutor && lesson.status === "PENDING" ? () => handleConfirm(lesson.id)
                  : isTutor && lesson.status === "CONFIRMED" ? () => handleStart(lesson.id)
                  : isTutor && lesson.status === "IN_PROGRESS" ? () => handleComplete(lesson.id)
                  : undefined
                }
              />
            </View>
          ))
        )}
      </View>

      {/* Menu */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: 40 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => { if (item.action) item.action(); else if (item.route) router.push(item.route as any); }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing.md,
                paddingVertical: 14,
                borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Ionicons name={item.icon} size={20} color={item.danger ? colors.error : colors.textSecondary} />
                <Text style={{ color: item.danger ? colors.error : colors.text, fontSize: 14 }}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <AvatarPicker visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} onImagePicked={handleAvatarPicked} />
      <Modal visible={showAvatarFull} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }} activeOpacity={1} onPress={() => setShowAvatarFull(false)}>
          {user?.avatarUrl && (
            <Image source={{ uri: user.avatarUrl }} style={{ width: 300, height: 300, borderRadius: 150 }} contentFit="cover" />
          )}
          <Text style={{ color: "#fff", fontSize: 14, marginTop: 20 }}>Kapatmak için tıkla</Text>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

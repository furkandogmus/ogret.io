import { useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "../../src/components/Avatar";
import { AvatarPicker } from "../../src/components/AvatarPicker";
import { useAuth } from "../../src/providers/AuthProvider";
import { useToast } from "../../src/components/Toast";
import { fileApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const toast = useToast();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAvatarFull, setShowAvatarFull] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refreshUser(); } catch { /* */ }
    setRefreshing(false);
  }, [refreshUser]);

  const handleAvatarPicked = async (uri: string) => {
    try {
      const { data } = await fileApi.upload(uri);
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
    ...(user?.role === "TUTOR" ? [
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
    { icon: "settings-outline" as const, label: "Ayarlar", route: "/settings" },
    { icon: "log-out-outline" as const, label: "Çıkış Yap", action: handleLogout, danger: true },
  ], [user?.role]);

  const roleLabels = { STUDENT: "Öğrenci", TUTOR: "Öğretmen", ADMIN: "Admin" };

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

      <View style={{ paddingHorizontal: spacing.md }}>
        <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="star" size={22} color={colors.star} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18, marginTop: 4 }}>{user?.ratingAvg?.toFixed(1) || "-"}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Puan</Text>
          </View>
          {user?.role === "TUTOR" && (
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

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => item.action ? item.action() : item.route ? (router.push as any)(item.route) : {}}
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

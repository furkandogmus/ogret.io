import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../src/components/Avatar";
import { useToast } from "../../src/components/Toast";
import { adminApi, type AdminVerificationRecord } from "../../src/api/services";
import type { User, DashboardStats } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function AdminPanel() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<AdminVerificationRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"users" | "verifications">("users");

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, dashRes, verificationsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDashboard(),
        adminApi.getVerifications(),
      ]);
      setUsers(usersRes.data.content || []);
      setStats(dashRes.data);
      setVerifications(verificationsRes.data || []);
    } catch { toast.show("Veriler yüklenemedi", "error"); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReview = async (verificationId: string, approved: boolean) => {
    setReviewingId(verificationId);
    try {
      await adminApi.reviewVerification(verificationId, approved);
      setVerifications((current) => current.filter((item) => item.id !== verificationId));
      toast.show(approved ? "Belge onaylandı" : "Belge reddedildi", "success");
    } catch {
      toast.show("Doğrulama kararı kaydedilemedi", "error");
    } finally {
      setReviewingId(null);
    }
  };

  const openDocument = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      toast.show("Belge açılamadı", "error");
    }
  };

  const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Admin Paneli</Text>
      </View>

      {stats && (
        <View style={{ flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20, marginTop: 4 }}>{stats.totalUsers}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Kullanıcı</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Ionicons name="school" size={20} color={colors.success} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20, marginTop: 4 }}>{stats.totalTutors}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Öğretmen</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Ionicons name="calendar" size={20} color={colors.warning} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20, marginTop: 4 }}>{stats.totalLessons}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Ders</Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        {(["users", "verifications"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: tab === t ? colors.primary : colors.surface }}
          >
            <Text style={{ color: tab === t ? "#fff" : colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
              {t === "users" ? "Kullanıcılar" : `Doğrulama (${verifications.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "users" ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          windowSize={10}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: "center", marginTop: spacing.lg }}>Kullanıcı bulunmuyor.</Text>}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <Avatar uri={item.avatarUrl} name={item.fullName} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{item.fullName}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.email}</Text>
                <View style={{ flexDirection: "row", gap: spacing.xs, marginTop: 4 }}>
                  <View style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.role}</Text>
                  </View>
                  {item.identityVerified && (
                    <View style={{ backgroundColor: colors.success + "20", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: colors.success, fontSize: 11 }}>Kimliği doğrulanmış</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
        />
      ) : (
        <FlatList
          data={verifications}
          keyExtractor={(item) => item.id}
          windowSize={10}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: "center", marginTop: spacing.lg }}>Bekleyen doğrulama belgesi bulunmuyor.</Text>}
          renderItem={({ item }) => {
            const reviewing = reviewingId === item.id;
            return (
              <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <View style={{ width: 40, height: 40, borderRadius: radius.full, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary + "18" }}>
                    <Ionicons name="document-text" size={21} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>{item.tutorName}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.documentType} · {formatDate(item.createdAt)}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>Öğretmen no: {item.tutorId}</Text>
                  </View>
                  <View style={{ backgroundColor: colors.warning + "20", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: colors.warning, fontSize: 10, fontWeight: "600" }}>{item.status}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => void openDocument(item.documentUrl)}
                  style={{ marginTop: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.sm, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: spacing.xs }}
                >
                  <Ionicons name="open-outline" size={17} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Belgeyi aç</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
                  <TouchableOpacity
                    disabled={reviewing}
                    onPress={() => void handleReview(item.id, false)}
                    style={{ flex: 1, borderRadius: radius.sm, paddingVertical: spacing.sm, backgroundColor: colors.error + "18", alignItems: "center", opacity: reviewing ? 0.5 : 1 }}
                  >
                    <Text style={{ color: colors.error, fontWeight: "600", fontSize: 13 }}>Reddet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={reviewing}
                    onPress={() => void handleReview(item.id, true)}
                    style={{ flex: 1, borderRadius: radius.sm, paddingVertical: spacing.sm, backgroundColor: colors.success + "20", alignItems: "center", opacity: reviewing ? 0.5 : 1 }}
                  >
                    {reviewing ? <ActivityIndicator size="small" color={colors.success} /> : <Text style={{ color: colors.success, fontWeight: "600", fontSize: 13 }}>Onayla</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
        />
      )}
    </View>
  );
}

import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../src/components/Avatar";
import { useToast } from "../../src/components/Toast";
import { adminApi } from "../../src/api/services";
import type { User } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function AdminPanel() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; totalTutors: number; totalLessons: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"users" | "verifications">("users");

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, dashRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDashboard(),
      ]);
      setUsers(usersRes.data);
      setStats(dashRes.data);
    } catch { /* */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerify = async (userId: string) => {
    try {
      await adminApi.verifyUser(userId);
      toast.show("Kullanıcı doğrulandı", "success");
      fetchData();
    } catch { toast.show("Doğrulanamadı", "error"); }
  };

  const pendingVerifications = users.filter((u) => u.role === "TUTOR" && !u.identityVerified);

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
              {t === "users" ? "Kullanıcılar" : `Doğrulama (${pendingVerifications.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tab === "users" ? users : pendingVerifications}
        keyExtractor={(item) => item.id}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
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
                    <Text style={{ color: colors.success, fontSize: 11 }}>Doğrulanmış</Text>
                  </View>
                )}
              </View>
            </View>
            {tab === "verifications" && (
              <TouchableOpacity onPress={() => handleVerify(item.id)} style={{ backgroundColor: colors.success + "20", borderRadius: radius.sm, padding: spacing.sm }}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      />
    </View>
  );
}

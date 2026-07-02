import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWebSocket } from "../src/providers/WebSocketProvider";
import type { WsNotification } from "../src/types";
import { colors, spacing, radius } from "../src/constants/theme";

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  message: "chatbubble",
  lesson_request: "calendar",
  lesson_confirmed: "checkmark-circle",
  lesson_cancelled: "close-circle",
  lesson_completed: "checkmark-done-circle",
  review: "star",
  reference_approved: "shield-checkmark",
};

const typeColors: Record<string, string> = {
  message: colors.primary,
  lesson_request: colors.warning,
  lesson_confirmed: colors.success,
  lesson_cancelled: colors.error,
  lesson_completed: colors.success,
  review: colors.star,
  reference_approved: colors.verified,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { incomingNotifications } = useWebSocket();
  const [notifications, setNotifications] = useState<WsNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newOnes = incomingNotifications.filter((n) => !existingIds.has(n.id));
      return [...newOnes, ...prev].slice(0, 100);
    });
  }, [incomingNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Bildirimler</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: "row", gap: spacing.md }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: (typeColors[item.type] || colors.primary) + "20", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={typeIcons[item.type] || "notifications"} size={20} color={typeColors[item.type] || colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{item.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{item.body}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
                {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: spacing.sm }}>Henüz bildirim yok</Text>
          </View>
        }
      />
    </View>
  );
}

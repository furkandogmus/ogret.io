import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "../../src/components/Avatar";
import { useAuth } from "../../src/providers/AuthProvider";
import { messageApi, userApi } from "../../src/api/services";
import type { User, Message } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

interface Conversation {
  user: User;
  lastMessage: Message;
  unread: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user: me } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const { data: messages } = await messageApi.getUnread();
      const userIds = [...new Set(messages.map((m) => m.senderId === me?.id ? m.receiverId : m.senderId))];
      const users = await Promise.all(userIds.slice(0, 20).map((id) => userApi.search(id).catch(() => null)));
      const convos: Conversation[] = users
        .filter((u): u is { data: User } => u !== null)
        .map((u) => ({
          user: u.data,
          lastMessage: messages.find((m) => m.senderId === u.data.id || m.receiverId === u.data.id) || messages[0],
          unread: messages.filter((m) => m.receiverId === me?.id && !m.read && m.senderId === u.data.id).length,
        }));
      setConversations(convos);
    } catch { /* */ }
    setLoading(false);
    setRefreshing(false);
  }, [me?.id]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Mesajlar</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/messages/${item.user.id}`)}
            style={{
              flexDirection: "row",
              gap: spacing.md,
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Avatar uri={item.user.avatarUrl} name={item.user.fullName} size={52} online={item.user.online} />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }} numberOfLines={1}>
                  {item.user.fullName}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {new Date(item.lastMessage.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
                {item.lastMessage.content}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={{ backgroundColor: colors.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          : <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: spacing.sm }}>Henüz mesajın yok</Text>
            </View>
        }
      />
    </View>
  );
}

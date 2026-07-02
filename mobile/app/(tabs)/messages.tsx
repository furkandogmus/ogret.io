import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "../../src/components/Avatar";
import { EmptyState } from "../../src/components/EmptyState";
import { useAuth } from "../../src/providers/AuthProvider";
import { useWebSocket } from "../../src/providers/WebSocketProvider";
import { useToast } from "../../src/components/Toast";
import { messageApi } from "../../src/api/services";
import type { Message } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  userOnline: boolean;
  lastMessage: Message;
  unread: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user: me } = useAuth();
  const { incomingMessages } = useWebSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const buildConversations = useCallback(async () => {
    if (!me) { setLoading(false); return; }
    try {
      const [allRes, unreadRes] = await Promise.all([
        messageApi.getAll(),
        messageApi.getUnread(),
      ]);
      const allMessages = Array.isArray(allRes.data) ? allRes.data : [];
      const unreadSet = new Set((Array.isArray(unreadRes.data) ? unreadRes.data : []).map(m => m.id));
      const grouped = new Map<string, { messages: Message[]; lastMessage: Message }>();
      for (const msg of allMessages) {
        const otherId = msg.senderId === me?.id ? msg.receiverId : msg.senderId;
        const existing = grouped.get(otherId);
        if (existing) {
          existing.messages.push(msg);
          if (new Date(msg.createdAt).getTime() > new Date(existing.lastMessage.createdAt).getTime()) {
            existing.lastMessage = msg;
          }
        } else {
          grouped.set(otherId, { messages: [msg], lastMessage: msg });
        }
      }
      const convos: Conversation[] = [];
      for (const [userId, { messages: msgs, lastMessage }] of grouped) {
        convos.push({
          userId,
          userName: lastMessage.senderId === me?.id ? lastMessage.receiverName : lastMessage.senderName,
          userAvatar: lastMessage.senderId === me?.id ? lastMessage.receiverAvatar : lastMessage.senderAvatar,
          userOnline: false,
          lastMessage,
          unread: msgs.filter((m) => unreadSet.has(m.id)).length,
        });
      }
      convos.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
      setConversations(convos);
    } catch { toast.show("Mesajlar yüklenemedi", "error"); }
    setLoading(false);
    setRefreshing(false);
  }, [me?.id]);

  useEffect(() => { buildConversations(); }, [buildConversations]);

  useEffect(() => {
    if (incomingMessages.length === 0) return;
    buildConversations();
  }, [incomingMessages.length, buildConversations]);

  const renderItem = useCallback(({ item }: { item: Conversation }) => (
    <TouchableOpacity
      onPress={() => router.push(`/messages/${item.userId}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.userName} ile sohbet${item.unread > 0 ? `, ${item.unread} okunmamış mesaj` : ""}`}
      style={{ flexDirection: "row", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <Avatar uri={item.userAvatar} name={item.userName} size={52} online={item.userOnline} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }} numberOfLines={1}>{item.userName}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {new Date(item.lastMessage.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={1}>{item.lastMessage.content}</Text>
      </View>
      {item.unread > 0 && (
        <View style={{ backgroundColor: colors.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${item.unread} okunmamış mesaj`}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  ), [router]);

  const keyExtractor = useCallback((item: Conversation) => item.userId, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>ögret.io</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>Mesajların</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={15}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); buildConversations(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          : <EmptyState icon="chatbubbles-outline" title="Henüz mesajın yok" subtitle="Bir öğretmene ders talebi göndererek sohbet başlatabilirsin" />
        }
      />
    </View>
  );
}

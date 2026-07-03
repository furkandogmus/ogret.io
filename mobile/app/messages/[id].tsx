import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Avatar } from "../../src/components/Avatar";
import { useAuth } from "../../src/providers/AuthProvider";
import { useToast } from "../../src/components/Toast";
import { messageApi, userApi, lessonApi } from "../../src/api/services";
import type { Message, User } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";
import { formatMessageTime } from "../../src/utils/dateFormat";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const toast = useToast();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [hasActiveLesson, setHasActiveLesson] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const textRef = useRef(text);
  textRef.current = text;
  const flatListRef = useRef<FlatList>(null);
  const lastMsgIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const POLL_INTERVAL_ONLINE = 15000;
  const POLL_INTERVAL_OFFLINE = 0;

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await messageApi.getConversation(id);
      const msgs = data as Message[];
      if (msgs.length === 0) return;
      const latest = msgs[msgs.length - 1];
      if (latest.id === lastMsgIdRef.current) return;
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newOnes = msgs.filter((m) => !existingIds.has(m.id));
        if (newOnes.length === 0) return prev;
        return [...prev, ...newOnes];
      });
      lastMsgIdRef.current = latest.id;
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    lastMsgIdRef.current = null;
    let cancelled = false;

    (async () => {
      const [userRes, msgRes, lessonRes] = await Promise.all([
        userApi.getById(id).catch(() => null),
        messageApi.getConversation(id).catch(() => null),
        lessonApi.hasActiveLesson(id).catch(() => null),
      ]);
      if (cancelled) return;

      if (userRes) setOtherUser(userRes.data);
      if (lessonRes) setHasActiveLesson(lessonRes.data?.hasActiveLesson ?? false);

      if (msgRes) {
        const msgs = msgRes.data as Message[];
        setMessages(msgs);
        if (msgs.length > 0) lastMsgIdRef.current = msgs[msgs.length - 1].id;
        const unreadIds = msgs.filter((m) => m.senderId === id && !m.read).map((m) => m.id);
        for (const mid of unreadIds) {
          messageApi.markAsRead(mid).catch(() => {});
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!otherUser) return;
    if (!otherUser.online) return;
    pollIntervalRef.current = setInterval(fetchMessages, POLL_INTERVAL_ONLINE);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [otherUser?.online, fetchMessages]);

  const sendMessage = useCallback(async () => {
    const msg = textRef.current.trim();
    if (!msg) return;
    setText("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: me?.id ?? "",
      receiverId: id,
      content: msg,
      messageType: "TEXT" as any,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { data } = await messageApi.send({ receiverId: id, content: msg });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (data as unknown as Message) : m))
      );
      lastMsgIdRef.current = data.id;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  }, [id, me?.id]);

  const statusText = otherUser?.online ? "Çevrimiçi" : "Çevrimdışı";
  const statusColor = otherUser?.online ? colors.online : colors.textMuted;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.sm }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        {otherUser && (
          <>
            <Avatar uri={otherUser.avatarUrl} name={otherUser.fullName} size={36} online={otherUser.online} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>{otherUser.fullName}</Text>
              {hasActiveLesson && otherUser.phone ? (
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>+90 {otherUser.phone.replace("+90", "").replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")}</Text>
              ) : (
                <Text style={{ color: statusColor, fontSize: 11 }}>{statusText}</Text>
              )}
            </View>
          </>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={20}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={{ padding: spacing.md }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMine = item.senderId === me?.id;
          return (
            <View style={{ alignItems: isMine ? "flex-end" : "flex-start", marginBottom: spacing.sm }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onLongPress={async () => {
                  await Clipboard.setStringAsync(item.content);
                  toast.show("Mesaj kopyalandı", "success");
                }}
                style={{ maxWidth: "80%", backgroundColor: isMine ? colors.primary : "#ecfdf5", borderRadius: radius.lg, borderBottomRightRadius: isMine ? 4 : radius.lg, borderBottomLeftRadius: !isMine ? 4 : radius.lg, padding: spacing.md }}
              >
                {!isMine && (
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600", marginBottom: 2 }}>
                    {item.senderName || otherUser?.fullName}
                  </Text>
                )}
                <Text style={{ color: isMine ? "#fff" : colors.text, fontSize: 14 }}>{item.content}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 4 }}>
                  <Text style={{ color: isMine ? "#ffffffcc" : colors.textMuted, fontSize: 11, marginRight: 4 }}>
                    {formatMessageTime(item.createdAt)}
                  </Text>
                  {isMine && <Ionicons name={item.read ? "checkmark-done" : "checkmark"} size={12} color={isMine ? "#ffffffcc" : colors.textMuted} />}
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: spacing.sm }}>Mesaj gönderin</Text>
          </View>
        }
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mesaj yaz..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={{
            flex: 1, backgroundColor: colors.background, borderRadius: radius.full,
            paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text,
            fontSize: 14, maxHeight: 100,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim()}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: text.trim() ? colors.primary : colors.surfaceLight,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name="send" size={18} color={text.trim() ? "#fff" : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

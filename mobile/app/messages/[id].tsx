import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Linking, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Avatar } from "../../src/components/Avatar";
import { useAuth } from "../../src/providers/AuthProvider";
import { useWebSocket } from "../../src/providers/WebSocketProvider";
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
  const { connected, incomingMessages, typingUsers, sendMessage: wsSend, sendTyping } = useWebSocket();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [hasActiveLesson, setHasActiveLesson] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const textRef = useRef(text);
  textRef.current = text;
  const flatListRef = useRef<FlatList>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      let userRes, msgRes, lessonRes;
      try { userRes = await userApi.getById(id); } catch (e) { console.warn("getById failed:", e?.response?.status, e?.config?.url); }
      try { msgRes = await messageApi.getConversation(id); } catch (e) { console.warn("getConversation failed:", e?.response?.status, e?.config?.url); }
      try { lessonRes = await lessonApi.hasActiveLesson(id); } catch (e) { console.warn("hasActiveLesson failed:", e?.response?.status, e?.config?.url); }
      if (userRes) setOtherUser(userRes.data);
      if (msgRes) {
        setMessages(msgRes.data);
        const unreadIds = msgRes.data.filter((m: Message) => m.senderId === id && !m.read).map((m: Message) => m.id);
        for (const mid of unreadIds) {
          messageApi.markAsRead(mid).catch(() => {});
        }
      }
      setHasActiveLesson(lessonRes?.data?.hasActiveLesson ?? false);
    })();
  }, [id]);

  const incomingRef = useRef(incomingMessages);
  incomingRef.current = incomingMessages;

  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    console.log("ChatScreen: incomingMessages length =", incomingMessages.length);
    if (incomingMessages.length === 0) return;
    
    // Find all incoming messages belonging to this specific conversation
    const relevant = incomingMessages.filter(
      (m) => m.senderId?.toLowerCase() === id?.toLowerCase() || 
             (m.senderId?.toLowerCase() === me?.id?.toLowerCase() && m.receiverId?.toLowerCase() === id?.toLowerCase())
    );
    console.log("ChatScreen: relevant messages found =", relevant.length, "for partner ID =", id);
    if (relevant.length === 0) return;

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newMessages = relevant.filter((m) => !existingIds.has(m.id)) as unknown as Message[];
      console.log("ChatScreen: new messages to append =", newMessages.length);
      if (newMessages.length === 0) return prev;

      // Mark incoming unread messages as read
      newMessages.forEach((m) => {
        if (m.senderId?.toLowerCase() === id?.toLowerCase() && !m.read) {
          messageApi.markAsRead(m.id).catch(() => {});
        }
      });

      return [...prev, ...newMessages];
    });
  }, [incomingMessages, id, me?.id]);

  const sendMessage = useCallback(async () => {
    const msg = textRef.current.trim();
    if (!msg) return;
    try {
      const { data } = await messageApi.send({ receiverId: id, content: msg });
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setText("");
    } catch { /* */ }
  }, [id]);

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
                <Text style={{ color: connected && typingUsers.has(id) ? colors.primary : connected ? colors.online : colors.textMuted, fontSize: 11 }}>
                  {connected && typingUsers.has(id) ? "Yazıyor..." : connected ? "Çevrimiçi" : "WebSocket bağlanıyor..."}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={async () => {
              try {
                await Sharing.shareAsync(`https://ogret.io/tutor/${otherUser.id}`, { dialogTitle: `${otherUser.fullName} profilini paylaş` });
              } catch {}
            }} hitSlop={8} style={{ padding: 4 }}>
              <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
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
        ListFooterComponent={
          connected && typingUsers.has(id) ? (
            <View style={{ alignItems: "flex-start", marginTop: spacing.xs }}>
              <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 10 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>Yazıyor...</Text>
              </View>
            </View>
          ) : null
        }
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
        <TextInput
          value={text}
          onChangeText={(v) => {
            setText(v);
            if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
            typingDebounceRef.current = setTimeout(() => sendTyping(id), 500);
          }}
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

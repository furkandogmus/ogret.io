import { useState, useEffect, useRef } from "react";
import { Search, ArrowLeft, MessageCircle, Send, UserPlus } from "lucide-react";
import { useSearchParams } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import { messageApi, userApi } from "../api/services";
import type { MessageResponse, UserResponse } from "../api/services";
import { useWebSocket } from "../hooks/useWebSocket";
import { Avatar } from "../components/shared/Avatar";

interface Conversation {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
}

export function MessagesPage() {
  const { user } = useAuth();
  const { connected, incoming, sendMessage } = useWebSocket();
  const [searchParams] = useSearchParams();
  const selectUserId = searchParams.get("userId");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [userResults, setUserResults] = useState<UserResponse[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const chatEnd = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectUserId) {
      setActiveId(selectUserId);
    }
  }, [selectUserId]);

  useEffect(() => {
    if (!selectUserId || !user) return;
    const hasConversation = conversations.some((c) => c.userId === selectUserId);
    if (!hasConversation) {
      userApi.getById(selectUserId)
        .then(({ data }) => {
          const tempConv: Conversation = {
            userId: data.id,
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
            lastMessage: "Henüz mesaj yok",
            time: "",
            unread: 0,
          };
          setConversations((prev) => {
            if (prev.some((c) => c.userId === selectUserId)) return prev;
            return [tempConv, ...prev];
          });
        })
        .catch(() => console.error("Kullanici detaylari alinamadi"));
    }
  }, [selectUserId, conversations.length, user]);

  useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId);

    // Fetch user details to get actual online status
    userApi.getById(activeId)
      .then(({ data }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === activeId
              ? { ...c, online: data.online }
              : c
          )
        );
      })
      .catch(() => {});
  }, [activeId]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeId || incoming.length === 0) return;
    const filtered = incoming.filter(
      (m) => m.senderId === activeId || m.receiverId === activeId
    );
    if (filtered.length === 0) return;
    setMessages((prev) => {
      const existing = new Set(prev.map((m) => m.id));
      const newOnes = filtered.filter((m) => !existing.has(m.id));
      if (newOnes.length === 0) return prev;
      return [...prev, ...newOnes];
    });
  }, [incoming, activeId]);

  useEffect(() => {
    if (incoming.length === 0) return;
    setConversations((prev) => {
      const map = new Map(prev.map((c) => [c.userId, c]));
      for (const msg of incoming) {
        const isMe = msg.senderId === user?.id;
        const otherId = isMe ? msg.receiverId : msg.senderId;
        const otherName = isMe ? msg.receiverName : msg.senderName;
        const otherAvatar = isMe ? msg.receiverAvatar : msg.senderAvatar;
        if (!otherId) continue;
        map.set(otherId, {
          userId: otherId,
          fullName: otherName ?? otherId.substring(0, 8),
          avatarUrl: otherAvatar,
          lastMessage: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          unread: otherId !== activeId && !isMe ? (map.get(otherId)?.unread ?? 0) + 1 : 0,
        });
      }
      return Array.from(map.values());
    });
  }, [incoming, user?.id, activeId]);

  useEffect(() => {
    if (!showSearch) return;
    const timer = setTimeout(async () => {
      if (!search.trim()) { setUserResults([]); return; }
      try {
        const { data } = await userApi.search(search);
        setUserResults(data.filter((u) => u.id !== user?.id));
      } catch { setUserResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, showSearch]);

  const fetchConversations = async () => {
    try {
      const { data } = await messageApi.getUnread();
      const grouped: Record<string, Conversation> = {};
      data.forEach((msg) => {
        const isMe = msg.senderId === user?.id;
        const otherId = isMe ? msg.receiverId : msg.senderId;
        const otherName = isMe ? msg.receiverName : msg.senderName;
        const otherAvatar = isMe ? msg.receiverAvatar : msg.senderAvatar;
        if (!otherId) return;
        if (!grouped[otherId]) {
          grouped[otherId] = {
            userId: otherId,
            fullName: otherName ?? otherId.substring(0, 8),
            avatarUrl: otherAvatar,
            lastMessage: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
            unread: 0,
          };
        }
        if (!msg.read && msg.receiverId === user?.id && !isMe) grouped[otherId].unread++;
        if (new Date(msg.createdAt) > new Date(grouped[otherId].time)) {
          grouped[otherId].lastMessage = msg.content;
          grouped[otherId].time = new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        }
      });
      setConversations(Object.values(grouped));
    } catch { console.error("Konusmalar yuklenemedi"); } finally { setLoading(false); }
  };

  const fetchMessages = async (withUserId: string) => {
    try {
      const { data } = await messageApi.getConversation(withUserId);
      setMessages(data);
      setShowMobileList(false);
      data.forEach((msg) => {
        if (!msg.read && msg.receiverId === user?.id) {
          messageApi.markAsRead(msg.id).catch(() => {});
        }
      });
    } catch { console.error("Mesajlar yuklenemedi"); setMessages([]); }
  };

  const handleSend = () => {
    if (!text.trim() || !activeId) return;
    sendMessage(activeId, text);
    const optimistic: MessageResponse = {
      id: String(Date.now()),
      senderId: user?.id ?? "",
      senderName: user?.fullName ?? "",
      receiverId: activeId,
      receiverName: "",
      content: text,
      messageType: "TEXT",
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === activeId
          ? { ...c, lastMessage: text, time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }
          : c
      )
    );
    setText("");
  };

  const startConversation = (targetUser: UserResponse) => {
    const exists = conversations.find((c) => c.userId === targetUser.id);
    if (!exists) {
      setConversations((prev) => [
        { userId: targetUser.id, fullName: targetUser.fullName, avatarUrl: targetUser.avatarUrl, lastMessage: "", time: "", unread: 0 },
        ...prev,
      ]);
    }
    setActiveId(targetUser.id);
    setShowSearch(false);
    setSearch("");
  };

  const activeConv = conversations.find((c) => c.userId === activeId);
  const filteredConvs = conversations.filter((c) =>
    c.fullName.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className={`w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col ${!showMobileList ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-foreground text-lg">Mesajlar</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowSearch(!showSearch); setSearch(""); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <UserPlus className="w-4 h-4" />
              </button>
              {connected && <span className="w-2 h-2 rounded-full bg-green-500" title="Bağlı" />}
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={showSearch ? "Kullanıcı ara..." : "Konuşma ara..."}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {showSearch && userResults.length > 0 && (
            <div className="border-b border-border">
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startConversation(u)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{u.fullName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{u.role === "TUTOR" ? "Öğretmen" : "Öğrenci"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="space-y-1 px-4 py-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-full skeleton" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 skeleton" />
                    <div className="h-2.5 w-5/6 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 && !showSearch ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Henüz mesajınız yok</div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => { setActiveId(conv.userId); setShowMobileList(false); setShowSearch(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left ${
                  activeId === conv.userId ? "bg-muted" : ""
                }`}
              >
                <Avatar src={conv.avatarUrl} alt={conv.fullName} className="w-9 h-9" online={conv.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm truncate">{conv.fullName}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage || "Henüz mesaj yok"}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${showMobileList ? "hidden md:flex" : "flex"}`}>
        {activeConv ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              <button onClick={() => setShowMobileList(true)} className="md:hidden p-1 -ml-1">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <Avatar src={activeConv.avatarUrl} alt={activeConv.fullName} className="w-9 h-9" online={activeConv.online} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm truncate">{activeConv.fullName}</div>
                <div className="text-xs flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${activeConv.online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                  <span className={activeConv.online ? "text-green-600 font-medium" : "text-muted-foreground"}>
                    {activeConv.online ? "Çevrimiçi" : "Çevrimdışı"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Henüz mesaj yok. İlk mesajı gönderin!
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                const prev = i > 0 ? messages[i - 1] : null;
                const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center mb-4">
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {new Date(msg.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {!isMe && (
                          <div className="text-xs font-medium text-primary mb-0.5">{msg.senderName}</div>
                        )}
                        {msg.content}
                        <div className={`text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEnd} />
            </div>

            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Mesaj yazın..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="p-1.5 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <div>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">Mesajlarınız</p>
              <p className="text-sm text-muted-foreground mt-1">Bir konuşma seçin veya yeni bir mesaj başlatın</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

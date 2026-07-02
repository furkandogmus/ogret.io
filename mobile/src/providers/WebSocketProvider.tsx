import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "../api/client";

export interface WsMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

export interface WsNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  senderName?: string;
  senderAvatar?: string;
  read: boolean;
  createdAt: string;
}

interface WebSocketContextType {
  connected: boolean;
  incomingMessages: WsMessage[];
  incomingNotifications: WsNotification[];
  typingUsers: Set<string>;
  sendMessage: (receiverId: string, content: string) => void;
  sendTyping: (receiverId: string) => void;
  clearIncoming: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

function getWsUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080/api/v1";
  const baseUrl = apiUrl.replace("/api/v1", "").replace("http://", "ws://").replace("https://", "wss://");
  return `${baseUrl}/ws/chat`;
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<WsMessage[]>([]);
  const [incomingNotifications, setIncomingNotifications] = useState<WsNotification[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return;

    const url = getWsUrl();
    const ws = new WebSocket(url);

    ws.onopen = () => {
      const connectFrame = [
        "CONNECT",
        "accept-version:1.2",
        "host:localhost",
        `Authorization:Bearer ${token}`,
        "\u0000",
      ].join("\n");
      ws.send(connectFrame);
    };

    ws.onmessage = (event) => {
      const data = event.data as string;
      if (data.startsWith("CONNECTED")) {
        setConnected(true);
        const subs = [
          `SUBSCRIBE\nid:sub-0\ndestination:/user/queue/messages\n\u0000`,
          `SUBSCRIBE\nid:sub-1\ndestination:/user/queue/notifications\n\u0000`,
          `SUBSCRIBE\nid:sub-2\ndestination:/user/queue/typing\n\u0000`,
        ];
        subs.forEach((f) => ws.send(f));
        return;
      }

      if (data.startsWith("MESSAGE")) {
        const lines = data.split("\n");
        const bodyIndex = lines.findIndex((l) => l.trim() === "");
        if (bodyIndex >= 0 && bodyIndex + 1 < lines.length) {
          const body = lines.slice(bodyIndex + 1).join("\n").replace(/\u0000$/, "");
          try {
            const parsed = JSON.parse(body);
            if (parsed.id && parsed.content) {
              const userId = parsed.senderId;
              setIncomingMessages((prev) => [...prev, parsed]);
              if (userId) {
                const timer = typingTimersRef.current.get(userId);
                if (timer) clearTimeout(timer);
                setTypingUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
              }
            } else if (parsed.id && parsed.type) {
              setIncomingNotifications((prev) => {
                if (prev.some((n) => n.id === parsed.id)) return prev;
                return [...prev, parsed];
              });
            } else if (parsed.userId) {
              setTypingUsers((prev) => {
                if (prev.has(parsed.userId)) {
                  const timer = typingTimersRef.current.get(parsed.userId);
                  if (timer) clearTimeout(timer);
                  typingTimersRef.current.set(parsed.userId, setTimeout(() => {
                    setTypingUsers((u) => { const next = new Set(u); next.delete(parsed.userId); return next; });
                    typingTimersRef.current.delete(parsed.userId);
                  }, 3000));
                  return prev;
                }
                const next = new Set(prev);
                next.add(parsed.userId);
                typingTimersRef.current.set(parsed.userId, setTimeout(() => {
                  setTypingUsers((u) => { const next = new Set(u); next.delete(parsed.userId); return next; });
                  typingTimersRef.current.delete(parsed.userId);
                }, 3000));
                return next;
              });
            }
          } catch { /* ignore */ }
        }
        return;
      }

      if (data.startsWith("RECEIPT") || data.startsWith("ERROR")) return;
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => connect(), 5000);
    };

    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      typingTimersRef.current.forEach((t) => clearTimeout(t));
      wsRef.current?.close();
    };
  }, [connect]);

  const sendTyping = useCallback((receiverId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;
    const sendFrame = `SEND\ndestination:/app/chat.typing/${receiverId}\ncontent-length:0\n\n\u0000`;
    ws.send(sendFrame);
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;
    const body = JSON.stringify({ content });
    const sendFrame = `SEND\ndestination:/app/chat.send/${receiverId}\ncontent-type:application/json\n\n${body}\u0000`;
    ws.send(sendFrame);
  }, []);

  const clearIncoming = useCallback(() => {
    setIncomingMessages([]);
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, incomingMessages, incomingNotifications, typingUsers, sendMessage, sendTyping, clearIncoming }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
}

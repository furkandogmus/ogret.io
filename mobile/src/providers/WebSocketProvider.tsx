import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { TOKEN_KEY, REFRESH_KEY, getApiBaseUrl } from "../api/client";
import type { WsMessage, WsNotification } from "../types";

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
  const apiUrl = getApiBaseUrl();
  const baseUrl = apiUrl.replace("/api/v1", "").replace("http://", "ws://").replace("https://", "wss://");
  const url = `${baseUrl}/ws/chat`;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.port = "8080";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<WsMessage[]>([]);
  const [incomingNotifications, setIncomingNotifications] = useState<WsNotification[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      setConnected(false);
      return;
    }

    let token: string | null = null;

    (async () => {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;

      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${getApiBaseUrl()}/auth/refresh`,
            { refreshToken }
          );
          await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
          await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
          token = data.accessToken;
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
        }
      }

      if (!token || !mountedRef.current) return;

      const client = new Client({
        brokerURL: getWsUrl(),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          if (!mountedRef.current) { client.deactivate(); return; }
          setConnected(true);

          client.subscribe("/user/queue/messages", (msg) => {
            try {
              const parsed = JSON.parse(msg.body);
              if (parsed.id && parsed.content) {
                setIncomingMessages((prev) => [...prev, parsed]);
              } else if (parsed.id && parsed.type) {
                setIncomingNotifications((prev) => {
                  if (prev.some((n) => n.id === parsed.id)) return prev;
                  return [...prev, parsed];
                });
              }
            } catch { /* ignore */ }
          });

          client.subscribe("/user/queue/typing", (msg) => {
            try {
              const parsed = JSON.parse(msg.body);
              if (parsed.userId) {
                if (typingTimersRef.current.has(parsed.userId)) {
                  clearTimeout(typingTimersRef.current.get(parsed.userId));
                }
                setTypingUsers((prev) => new Set(prev).add(parsed.userId));
                typingTimersRef.current.set(parsed.userId, setTimeout(() => {
                  setTypingUsers((prev) => {
                    const next = new Set(prev);
                    next.delete(parsed.userId);
                    typingTimersRef.current.delete(parsed.userId);
                    return next;
                  });
                }, 3000));
              }
            } catch { /* ignore */ }
          });
        },
        onDisconnect: () => {
          if (mountedRef.current) setConnected(false);
        },
        onStompError: (frame) => {
          console.warn("[WS] STOMP error:", frame.headers.message);
        },
      });

      client.activate();
      clientRef.current = client;
    })();

    return () => {
      mountedRef.current = false;
      typingTimersRef.current.forEach((t) => clearTimeout(t));
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [isAuthenticated]);

  const sendTyping = useCallback((receiverId: string) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({
        destination: `/app/chat.typing/${receiverId}`,
        body: "",
      });
    }
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({
        destination: `/app/chat.send/${receiverId}`,
        body: JSON.stringify({ content }),
      });
    }
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

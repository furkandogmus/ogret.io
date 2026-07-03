import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./AuthProvider";
import { TOKEN_KEY, getApiBaseUrl } from "../api/client";
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
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

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
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<WsMessage[]>([]);
  const [incomingNotifications, setIncomingNotifications] = useState<WsNotification[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);
  const [reconnecting, setReconnecting] = useState(false);

  const connect = useCallback(async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token || !mountedRef.current) {
      console.log("WS connect cancelled: no token or not mounted");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WS already open, skipping connect");
      return;
    }

    const url = getWsUrl();
    console.log("WS connecting to url:", url);
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        console.log("WS socket connection opened");
        reconnectAttemptsRef.current = 0;
        setReconnecting(false);
        const connectFrame = [
          "CONNECT",
          "accept-version:1.2",
          "host:localhost",
          `Authorization:Bearer ${token}`,
          "",
          "\u0000\n",
        ].join("\n");
        ws.send(connectFrame);
      };

      ws.onmessage = (event) => {
        const rawData = event.data as string;
        console.log("WS onmessage rawData:", rawData);
        const data = rawData.trim();
        
        if (data.startsWith("CONNECTED")) {
          console.log("WS connected successfully!");
          setConnected(true);
          const subs = [
            `SUBSCRIBE\nid:sub-0\ndestination:/user/queue/messages\n\n\u0000\n`,
            `SUBSCRIBE\nid:sub-1\ndestination:/user/queue/notifications\n\n\u0000\n`,
            `SUBSCRIBE\nid:sub-2\ndestination:/user/queue/typing\n\n\u0000\n`,
          ];
          subs.forEach((f) => ws.send(f));
          return;
        }

        if (data.startsWith("MESSAGE")) {
          const lines = data.split("\n");
          const bodyIndex = lines.findIndex((l) => l.trim() === "");
          if (bodyIndex >= 0 && bodyIndex + 1 < lines.length) {
            const body = lines.slice(bodyIndex + 1).join("\n").replace(/\u0000$/, "").trim();
            console.log("WS parsed MESSAGE body:", body);
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
            } catch (err) {
              console.error("WS JSON parse failed:", err, "for body:", body);
            }
          }
          return;
        }

        if (data.startsWith("RECEIPT") || data.startsWith("ERROR")) return;
      };

      ws.onclose = (event) => {
        console.log("WS connection closed:", event?.code, event?.reason);
        setConnected(false);
        if (!mountedRef.current) return;
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
          MAX_RECONNECT_DELAY
        );
        reconnectAttemptsRef.current += 1;
        setReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
      };

      ws.onerror = (err) => {
        console.error("WS error occurred:", err);
        ws.close();
      };
      wsRef.current = ws;
    } catch (e) {
      console.error("WS init failed:", e);
      if (mountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => connect(), 5000);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (isAuthenticated) {
      console.log("User authenticated, calling WS connect()");
      connect();
    } else {
      console.log("User not authenticated, closing WS");
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
    }
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      typingTimersRef.current.forEach((t) => clearTimeout(t));
      wsRef.current?.close();
    };
  }, [connect, isAuthenticated]);

  const sendTyping = useCallback((receiverId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;
    const sendFrame = `SEND\ndestination:/app/chat.typing/${receiverId}\ncontent-length:0\n\n\u0000\n`;
    ws.send(sendFrame);
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;
    const body = JSON.stringify({ content });
    const sendFrame = `SEND\ndestination:/app/chat.send/${receiverId}\ncontent-type:application/json\n\n${body}\u0000\n`;
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

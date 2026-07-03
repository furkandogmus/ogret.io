import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
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
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;
const PING_INTERVAL = 15000;

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

function buildConnectFrame(token: string): string {
  const headers = [
    "CONNECT",
    "accept-version:1.2",
    "host:localhost",
    "heart-beat:15000,15000",
    `Authorization:Bearer ${token}`,
    "",
    "\u0000",
  ];
  return headers.join("\n");
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

  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPing = useCallback((ws: WebSocket) => {
    if (pingRef.current) clearInterval(pingRef.current);
    pingRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("\n");
      }
    }, PING_INTERVAL);
  }, []);

  const connect = useCallback(async () => {
    let token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token || !mountedRef.current) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    if (mountedRef.current) {
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
    }
    if (!token || !mountedRef.current) return;

    const url = getWsUrl();
    try {
      const ws = new WebSocket(url);
      let connectedTimeout: ReturnType<typeof setTimeout> | null = null;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        reconnectAttemptsRef.current = 0;
        setReconnecting(false);
        ws.send(buildConnectFrame(token));

        connectedTimeout = setTimeout(() => {
          if (!mountedRef.current) return;
          ws.close();
          const delay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            MAX_RECONNECT_DELAY
          );
          reconnectAttemptsRef.current += 1;
          setReconnecting(true);
          reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
        }, 10000);
      };

      ws.onmessage = (event) => {
        const rawData = event.data as string;
        const data = rawData.trim();
        if (!data) return;

        if (data.startsWith("CONNECTED")) {
          if (connectedTimeout) clearTimeout(connectedTimeout);
          setConnected(true);
          startPing(ws);
          const subs = [
            `SUBSCRIBE\nid:sub-0\ndestination:/user/queue/messages\n\n\u0000`,
            `SUBSCRIBE\nid:sub-1\ndestination:/user/queue/notifications\n\n\u0000`,
            `SUBSCRIBE\nid:sub-2\ndestination:/user/queue/typing\n\n\u0000`,
          ];
          subs.forEach((f) => ws.send(f));
          return;
        }

        if (data.startsWith("MESSAGE")) {
          const lines = data.split("\n");
          const bodyIndex = lines.findIndex((l) => l.trim() === "");
          if (bodyIndex >= 0 && bodyIndex + 1 < lines.length) {
            const body = lines.slice(bodyIndex + 1).join("\n").replace(/\u0000$/, "").trim();
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

      ws.onclose = (event) => {
        setConnected(false);
        if (pingRef.current) clearInterval(pingRef.current);
        if (!mountedRef.current) return;
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
          MAX_RECONNECT_DELAY
        );
        reconnectAttemptsRef.current += 1;
        setReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
      };

      ws.onerror = () => { ws.close(); };
      wsRef.current = ws;
    } catch {
      if (mountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => connect(), 5000);
      }
    }
  }, [startPing]);

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
      if (pingRef.current) clearInterval(pingRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      typingTimersRef.current.forEach((t) => clearTimeout(t));
      wsRef.current?.close();
    };
  }, [connect, isAuthenticated]);

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

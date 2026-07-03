import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./AuthProvider";
import { TOKEN_KEY, getApiBaseUrl } from "../api/client";
import type { WsMessage, WsNotification } from "../types";

// Polyfill TextEncoder and TextDecoder for Hermes/React Native compatibility with @stomp/stompjs
if (typeof TextEncoder === "undefined") {
  const encoderPolyfill = class TextEncoder {
    encode(str: string) {
      const arr = new Uint8Array(str.length * 3);
      let offset = 0;
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) arr[offset++] = charcode;
        else if (charcode < 0x800) {
          arr[offset++] = 0xc0 | (charcode >> 6);
          arr[offset++] = 0x80 | (charcode & 0x3f);
        } else {
          arr[offset++] = 0xe0 | (charcode >> 12);
          arr[offset++] = 0x80 | ((charcode >> 6) & 0x3f);
          arr[offset++] = 0x80 | (charcode & 0x3f);
        }
      }
      return arr.subarray(0, offset);
    }
  } as any;
  global.TextEncoder = encoderPolyfill;
  (globalThis as any).TextEncoder = encoderPolyfill;
}

if (typeof TextDecoder === "undefined") {
  const decoderPolyfill = class TextDecoder {
    decode(arr: Uint8Array) {
      let str = "";
      let i = 0;
      while (i < arr.length) {
        const value = arr[i++];
        if (value < 0x80) {
          str += String.fromCharCode(value);
        } else if (value > 0xbf && value < 0xe0) {
          str += String.fromCharCode(((value & 0x1f) << 6) | (arr[i++] & 0x3f));
        } else if (value > 0xdf && value < 0xf0) {
          str += String.fromCharCode(((value & 0x0f) << 12) | ((arr[i++] & 0x3f) << 6) | (arr[i++] & 0x3f));
        } else {
          i++; // skip surrogates
        }
      }
      return str;
    }
  } as any;
  global.TextDecoder = decoderPolyfill;
  (globalThis as any).TextDecoder = decoderPolyfill;
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

  useEffect(() => {
    let active = true;
    let client: Client | null = null;

    if (!isAuthenticated) {
      console.log("WS: User not authenticated, skipped connecting");
      setConnected(false);
      return;
    }

    const startClient = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token || !active) return;

      const wsUrl = getWsUrl();
      console.log("WS: Initializing Stomp Client, url:", wsUrl);

      client = new Client({
        brokerURL: wsUrl,
        webSocketFactory: () => {
          const ws = new WebSocket(wsUrl);
          const listeners = new Map<string, Set<any>>();
          
          ws.addEventListener = (type: string, listener: any) => {
            if (!listeners.has(type)) {
              listeners.set(type, new Set());
            }
            listeners.get(type)!.add(listener);
            
            if (type === "open") {
              ws.onopen = (event) => {
                listeners.get("open")?.forEach((cb) => cb(event));
              };
            } else if (type === "message") {
              ws.onmessage = (event) => {
                listeners.get("message")?.forEach((cb) => cb(event));
              };
            } else if (type === "error") {
              ws.onerror = (event) => {
                listeners.get("error")?.forEach((cb) => cb(event));
              };
            } else if (type === "close") {
              ws.onclose = (event) => {
                listeners.get("close")?.forEach((cb) => cb(event));
              };
            }
          };

          ws.removeEventListener = (type: string, listener: any) => {
            const list = listeners.get(type);
            if (list) {
              list.delete(listener);
            }
          };

          return ws;
        },
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        onConnect: () => {
          if (!active) {
            client?.deactivate();
            return;
          }
          console.log("WS: Stomp Client Connected successfully!");
          setConnected(true);

          client?.subscribe("/user/queue/messages", (msg) => {
            console.log("WS: Received message:", msg.body);
            try {
              const body = JSON.parse(msg.body);
              setIncomingMessages((prev) => [...prev, body]);
            } catch (err) {
              console.error("WS: Failed to parse message body:", err);
            }
          });

          client?.subscribe("/user/queue/notifications", (msg) => {
            console.log("WS: Received notification:", msg.body);
            try {
              const body = JSON.parse(msg.body);
              setIncomingNotifications((prev) => {
                if (prev.some((n) => n.id === body.id)) return prev;
                return [...prev, body];
              });
            } catch (err) {
              console.error("WS: Failed to parse notification body:", err);
            }
          });

          client?.subscribe("/user/queue/typing", (msg) => {
            console.log("WS: Received typing event:", msg.body);
            try {
              const body = JSON.parse(msg.body);
              if (body.userId) {
                setTypingUsers((prev) => {
                  if (prev.has(body.userId)) {
                    const timer = typingTimersRef.current.get(body.userId);
                    if (timer) clearTimeout(timer);
                    typingTimersRef.current.set(body.userId, setTimeout(() => {
                      setTypingUsers((u) => { const next = new Set(u); next.delete(body.userId); return next; });
                      typingTimersRef.current.delete(body.userId);
                    }, 3000));
                    return prev;
                  }
                  const next = new Set(prev);
                  next.add(body.userId);
                  typingTimersRef.current.set(body.userId, setTimeout(() => {
                    setTypingUsers((u) => { const next = new Set(u); next.delete(body.userId); return next; });
                    typingTimersRef.current.delete(body.userId);
                  }, 3000));
                  return next;
                });
              }
            } catch (err) {
              console.error("WS: Failed to parse typing event body:", err);
            }
          });
        },
        onDisconnect: () => {
          console.log("WS: Stomp Client Disconnected");
          setConnected(false);
        },
        onWebSocketError: (err) => {
          console.error("WS: WebSocket error:", err);
        },
        onStompError: (frame) => {
          console.error("WS: Stomp protocol error:", frame.headers['message']);
        }
      });

      client.activate();
      clientRef.current = client;
    };

    startClient();

    return () => {
      active = false;
      if (client) {
        console.log("WS: Deactivating Stomp Client on cleanup");
        client.deactivate();
      }
      setConnected(false);
      typingTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [isAuthenticated]);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({
        destination: `/app/chat.send/${receiverId}`,
        body: JSON.stringify({ content }),
      });
    } else {
      console.warn("WS: Cannot send message, client not connected");
    }
  }, []);

  const sendTyping = useCallback((receiverId: string) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({
        destination: `/app/chat.typing/${receiverId}`,
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

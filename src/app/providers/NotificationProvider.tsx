import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Client } from "@stomp/stompjs";

export interface AppNotification {
  id: string;
  type: "message" | "lesson_request" | "lesson_confirmed" | "lesson_cancelled" | "lesson_completed" | "review" | "reference_approved";
  title: string;
  body: string;
  senderName?: string;
  senderAvatar?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const clientRef = useRef<Client | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "read" | "createdAt">) => {
    setNotifications((prev) => [
      {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: `/ws/chat`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to direct chat messages (existing)
        client.subscribe("/user/queue/messages", (msg) => {
          try {
            const body = JSON.parse(msg.body);
            setNotifications((prev) => [
              {
                id: `msg-${body.id || Date.now()}`,
                type: "message",
                title: "Yeni Mesaj",
                body: body.content?.substring(0, 100) || "",
                senderName: body.senderName,
                senderAvatar: body.senderAvatar,
                link: `/mesajlar?userId=${body.senderId}`,
                read: false,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ]);
          } catch { /* ignore */ }
        });

        // Subscribe to the notifications channel (NEW)
        client.subscribe("/user/queue/notifications", (msg) => {
          try {
            const body = JSON.parse(msg.body);
            setNotifications((prev) => {
              // Deduplicate: skip if we already have this notification id
              if (prev.some((n) => n.id === body.id)) return prev;
              // Also deduplicate message notifications that came via /queue/messages
              if (body.type === "message" && prev.some((n) => n.type === "message" && n.link === body.link && Date.now() - new Date(n.createdAt).getTime() < 3000)) {
                return prev;
              }
              return [
                {
                  id: body.id || `notif-${Date.now()}`,
                  type: body.type || "message",
                  title: body.title || "Bildirim",
                  body: body.body || "",
                  senderName: body.senderName,
                  senderAvatar: body.senderAvatar,
                  link: body.link || "",
                  read: false,
                  createdAt: body.createdAt || new Date().toISOString(),
                },
                ...prev,
              ];
            });
          } catch { /* ignore */ }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

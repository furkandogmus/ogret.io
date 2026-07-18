import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthProvider";
import api from "../api/client";

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
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
    clearNotifications: async () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const clientRef = useRef<Client | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    api.get<AppNotification[]>("/notifications")
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, [isAuthenticated]);

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
    if (!isAuthenticated) return;

    const client = new Client({
      brokerURL: `/ws/chat`,
      reconnectDelay: 5000,
      onConnect: () => {
        // Chat messages are represented by the server-persisted notification below.
        client.subscribe("/user/queue/notifications", (msg) => {
          try {
            const body = JSON.parse(msg.body);
            setNotifications((prev) => {
              // Deduplicate: skip if we already have this notification id
              if (prev.some((n) => n.id === body.id)) return prev;
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
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    api.put(`/notifications/${id}/read`).catch(() => undefined);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api.put("/notifications/read-all").catch(() => undefined);
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
    } catch {
      // Keep the visible list when persistence fails so reload behavior stays honest.
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

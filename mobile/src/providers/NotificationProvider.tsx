import { useEffect, useRef, createContext, useContext, type ReactNode } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthProvider";
import { useWebSocket } from "./WebSocketProvider";
import { api } from "../api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
}

const NotificationContext = createContext<NotificationContextType>({ expoPushToken: null });

export function useNotifications() {
  return useContext(NotificationContext);
}

function mapLink(link?: string) {
  if (!link) return "/(tabs)";
  if (link.includes("/mesajlar")) return "/(tabs)/messages";
  if (link.includes("/ogrenci-panel")) return "/(tabs)/student";
  if (link.includes("/ogretmen-panel")) return "/(tabs)/tutor-panel";
  return "/(tabs)";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { incomingNotifications } = useWebSocket();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const expoPushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    Notifications.requestPermissionsAsync().then(({ status }) => {
      if (status !== "granted") return;
      Notifications.getExpoPushTokenAsync().then(({ data: token }) => {
        expoPushTokenRef.current = token;
        api.post("/notifications/register", { token, platform: Platform.OS }).catch(() => {});
      }).catch(() => {});
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const link = response.notification.request.content.data?.link as string | undefined;
      router.push(mapLink(link) as any);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (incomingNotifications.length === 0) return;
    const last = incomingNotifications[incomingNotifications.length - 1];
    Notifications.scheduleNotificationAsync({
      content: {
        title: last.title,
        body: last.body,
        data: { link: last.link },
        sound: true,
      },
      trigger: null,
    }).catch(() => {});
  }, [incomingNotifications]);

  return (
    <NotificationContext.Provider value={{ expoPushToken: expoPushTokenRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
}

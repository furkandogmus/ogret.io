import { useEffect, useRef, createContext, useContext, type ReactNode } from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthProvider";

const isExpoGo = Constants.appOwnership === "expo";
let Notifications: any = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn("Failed to load expo-notifications:", e);
  }
}

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
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const expoPushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !Notifications) return;

    Notifications.requestPermissionsAsync().then(({ status }: any) => {
      if (status !== "granted") return;
      Notifications.getExpoPushTokenAsync().then(({ data: token }: any) => {
        expoPushTokenRef.current = token;
      }).catch(() => {});
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const link = response.notification.request.content.data?.link as string | undefined;
      router.push(mapLink(link) as any);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ expoPushToken: expoPushTokenRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
}

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/providers/AuthProvider";
import { useUnreadCount } from "../../src/hooks/useUnreadCount";
import { colors } from "../../src/constants/theme";

export default function TabLayout() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const isTutor = user?.role === "TUTOR";
  const isStudent = user?.role === "STUDENT";
  const isAdmin = user?.role === "ADMIN";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="student"
        options={{
          title: "Paneli",
          tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} />,
          href: isStudent ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="tutor-panel"
        options={{
          title: "Paneli",
          tabBarIcon: ({ color, size }) => <Ionicons name="easel" size={size} color={color} />,
          href: isTutor ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mesajlar",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          tabBarBadge: unread > 0 ? unread : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

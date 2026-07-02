import { useRef, useEffect, useCallback } from "react";
import { View, Animated, PanResponder, Dimensions, TouchableOpacity, Text } from "react-native";
import { Slot, router, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/providers/AuthProvider";
import { useUnreadCount } from "../../src/hooks/useUnreadCount";
import { colors } from "../../src/constants/theme";
import IndexPage from "./index";
import MessagesPage from "./messages";
import ProfilePage from "./profile";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_INFO = [
  { route: "/", icon: "home", label: "Ana Sayfa" },
  { route: "/messages", icon: "chatbubbles", label: "Mesajlar" },
  { route: "/profile", icon: "person", label: "Profil" },
] as const;
const TAB_ROUTES = TAB_INFO.map((t) => t.route);

function TabPager({ currentIndex }: { currentIndex: number }) {
  const scrollX = useRef(new Animated.Value(currentIndex * SCREEN_WIDTH)).current;
  const indexRef = useRef(currentIndex);
  indexRef.current = currentIndex;

  useEffect(() => {
    Animated.spring(scrollX, { toValue: currentIndex * SCREEN_WIDTH, useNativeDriver: true }).start();
  }, [currentIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        scrollX.setValue(indexRef.current * SCREEN_WIDTH - gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        const offset = indexRef.current * SCREEN_WIDTH - gs.dx;
        const idx = Math.max(0, Math.min(TAB_ROUTES.length - 1, Math.round(offset / SCREEN_WIDTH)));
        Animated.spring(scrollX, { toValue: idx * SCREEN_WIDTH, useNativeDriver: true }).start();
        if (idx !== indexRef.current) {
          router.replace(TAB_ROUTES[idx]);
        }
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1, overflow: "hidden" }} {...panResponder.panHandlers}>
      <Animated.View
        style={{
          flexDirection: "row",
          width: SCREEN_WIDTH * 3,
          height: "100%",
          transform: [{ translateX: Animated.multiply(scrollX, -1) }],
        }}
      >
        <View style={{ width: SCREEN_WIDTH }}><IndexPage /></View>
        <View style={{ width: SCREEN_WIDTH }}><MessagesPage /></View>
        <View style={{ width: SCREEN_WIDTH }}><ProfilePage /></View>
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const segments = useSegments();
  const currentPath = "/" + (segments.slice(1).join("/") || "");
  const currentIndex = TAB_ROUTES.indexOf(currentPath);
  const isTab = currentIndex >= 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Slot renders non-tab routes (admin, student, tutor-panel) */}
      <View style={{ flex: 1, display: isTab ? "none" : "flex" }}>
        <Slot />
      </View>

      {/* Pager for main tab pages */}
      {isTab && (
        <View style={{ flex: 1, marginBottom: 56 }}>
          <TabPager currentIndex={currentIndex} />
        </View>
      )}

      {/* Custom tab bar */}
      {isTab && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: 4,
            paddingTop: 4,
            height: 56,
          }}
        >
          {TAB_INFO.map((tab, i) => (
            <TouchableOpacity
              key={tab.route}
              onPress={() => {
                if (i !== currentIndex) router.replace(tab.route);
              }}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={i === currentIndex ? colors.primary : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: i === currentIndex ? colors.primary : colors.textMuted,
                  marginTop: 2,
                }}
              >
                {tab.label}
              </Text>
              {i === 1 && unread > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 2,
                    right: "28%",
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

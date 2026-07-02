import { useRef, type ReactNode } from "react";
import { View, PanResponder } from "react-native";
import { router, useSegments } from "expo-router";

const TAB_ORDER = ["index", "messages", "profile"];

export function SwipeableTabContent({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const currentTab = segments[segments.length - 1] || "index";
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && Math.abs(gs.dx) > 15,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 50 && currentIndex > 0) {
          router.replace(`/(tabs)/${TAB_ORDER[currentIndex - 1]}`);
        } else if (gs.dx < -50 && currentIndex < TAB_ORDER.length - 1) {
          router.replace(`/(tabs)/${TAB_ORDER[currentIndex + 1]}`);
        }
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

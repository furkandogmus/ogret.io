import { useRef, type ReactNode } from "react";
import { View, PanResponder } from "react-native";
import { router, useSegments } from "expo-router";

const TAB_ROUTES = ["/", "/messages", "/profile"];

export function SwipeableTabContent({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const currentPath = "/" + (segments.slice(1).join("/") || "");
  const currentIndex = TAB_ROUTES.indexOf(currentPath);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && Math.abs(gs.dx) > 15,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 50 && currentIndex > 0) {
          router.replace(TAB_ROUTES[currentIndex - 1]);
        } else if (gs.dx < -50 && currentIndex < TAB_ROUTES.length - 1) {
          router.replace(TAB_ROUTES[currentIndex + 1]);
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

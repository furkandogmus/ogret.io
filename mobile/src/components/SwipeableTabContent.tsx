import { type ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router, useSegments } from "expo-router";

const TAB_ORDER = ["index", "messages", "profile"];

export function SwipeableTabContent({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const currentTab = segments[segments.length - 1] || "index";
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const pan = Gesture.Pan()
    .minDistance(10)
    .onEnd((event) => {
      if (Math.abs(event.translationX) > Math.abs(event.translationY) * 1.5 && Math.abs(event.translationX) > 50) {
        if (event.translationX < 0 && currentIndex < TAB_ORDER.length - 1) {
          router.replace(`/(tabs)/${TAB_ORDER[currentIndex + 1]}`);
        } else if (event.translationX > 0 && currentIndex > 0) {
          router.replace(`/(tabs)/${TAB_ORDER[currentIndex - 1]}`);
        }
      }
    });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}

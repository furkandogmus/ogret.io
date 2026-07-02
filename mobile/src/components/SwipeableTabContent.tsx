import { useRef, type ReactNode } from "react";
import { Animated, PanResponder, Dimensions } from "react-native";
import { router, useSegments } from "expo-router";

const TAB_ROUTES = ["/", "/messages", "/profile"];
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function SwipeableTabContent({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const currentPath = "/" + (segments.slice(1).join("/") || "");
  const currentIndex = TAB_ROUTES.indexOf(currentPath);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && Math.abs(gs.dx) > 15,
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 50 && currentIndex > 0) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            router.replace(TAB_ROUTES[currentIndex - 1]);
          });
        } else if (gs.dx < -50 && currentIndex < TAB_ROUTES.length - 1) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            router.replace(TAB_ROUTES[currentIndex + 1]);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      style={{ flex: 1, transform: [{ translateX }] }}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

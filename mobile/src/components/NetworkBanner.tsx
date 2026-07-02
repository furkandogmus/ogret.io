import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { colors } from "../constants/theme";

import { colors } from "../constants/theme";

export function NetworkBanner() {
  const isConnected = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -40 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, translateY]);

  if (isConnected) return null;

  return (
    <Animated.View
      style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 9999,
        backgroundColor: colors.error, paddingVertical: 8, alignItems: "center",
        transform: [{ translateY }],
      }}
    >
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>İnternet bağlantısı yok</Text>
    </Animated.View>
  );
}

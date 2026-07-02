import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { colors, radius } from "../constants/theme";

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = "100%", height = 16, borderRadius: br = radius.sm, style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius: br, backgroundColor: colors.surfaceLight, opacity }, style]}
    />
  );
}

export function TutorCardSkeleton() {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Skeleton width={56} height={56} borderRadius={28} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
          <Skeleton width="50%" height={12} />
        </View>
        <Skeleton width={50} height={20} />
      </View>
    </View>
  );
}

export function LessonCardSkeleton() {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="50%" height={14} />
          <Skeleton width="30%" height={12} />
        </View>
        <Skeleton width={60} height={22} borderRadius={11} />
      </View>
      <View style={{ flexDirection: "row", gap: 24, marginTop: 12 }}>
        <Skeleton width={80} height={12} />
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}

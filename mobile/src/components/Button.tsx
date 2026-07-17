import { TouchableOpacity, Text, ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, radius } from "../constants/theme";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  haptic?: "light" | "medium" | "heavy" | "success" | "error" | "selection" | null;
  style?: StyleProp<ViewStyle>;
}

const hapticMap = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};

export function Button({ title, onPress, variant = "primary", size = "md", loading, disabled, icon, haptic = "light", style }: Props) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const height = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  const handlePress = () => {
    if (haptic && hapticMap[haptic]) {
      hapticMap[haptic]().catch(() => {});
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityHint={loading ? "Yükleniyor" : undefined}
      style={[{
        height, borderRadius: radius.md,
        backgroundColor: isPrimary ? colors.primary : isOutline ? "transparent" : colors.surfaceLight,
        borderWidth: isOutline ? 1.5 : 0, borderColor: isOutline ? colors.primary : undefined,
        opacity: disabled ? 0.5 : 1,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        paddingHorizontal: size === "sm" ? 14 : 20,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={{ color: isPrimary ? "#fff" : colors.primary, fontSize, fontWeight: "600" }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

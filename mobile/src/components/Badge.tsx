import { View, Text } from "react-native";
import { colors, radius } from "../constants/theme";

interface Props {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "premium";
  size?: "sm" | "md";
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  default: { bg: colors.surfaceLight, text: colors.textSecondary },
  success: { bg: colors.success + "20", text: colors.success },
  warning: { bg: colors.warning + "20", text: colors.warning },
  error: { bg: colors.error + "20", text: colors.error },
  premium: { bg: colors.premium + "30", text: colors.premium },
};

export function Badge({ label, variant = "default", size = "sm" }: Props) {
  const styles = variantStyles[variant];
  const paddingV = size === "sm" ? 2 : 4;
  const fontSize = size === "sm" ? 11 : 12;

  return (
    <View
      style={{
        backgroundColor: styles.bg,
        borderRadius: radius.full,
        paddingHorizontal: 8,
        paddingVertical: paddingV,
        alignSelf: "flex-start",
      }}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={{ color: styles.text, fontSize, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

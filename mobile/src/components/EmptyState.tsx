import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../constants/theme";

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = "search-outline", title, subtitle }: Props) {
  return (
    <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: spacing.xl }} accessibilityLiveRegion="polite" accessibilityLabel={title}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: spacing.sm, textAlign: "center" }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: spacing.xs, textAlign: "center" }}>{subtitle}</Text>}
    </View>
  );
}

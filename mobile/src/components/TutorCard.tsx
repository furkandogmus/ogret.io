import { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import { StarRating } from "./StarRating";
import { colors, spacing, radius } from "../constants/theme";
import type { TutorSummary } from "../types";

interface Props {
  tutor: TutorSummary;
  onPress: () => void;
  favorited?: boolean;
  onFavoriteToggle?: () => void;
}

function TutorCardComponent({ tutor, onPress, favorited, onFavoriteToggle }: Props) {
  const premiumLabel = (tutor as any).premiumPlan
    ? (tutor as any).premiumPlan === "VIP" ? "VIP" : (tutor as any).premiumPlan === "PREMIUM" ? "Premium" : "Basic"
    : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <Avatar uri={tutor.avatarUrl} name={tutor.fullName} size={56} online={tutor.online} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
              {tutor.fullName}
            </Text>
            {tutor.identityVerified && <Ionicons name="checkmark-circle" size={16} color={colors.verified} />}
            {premiumLabel && (
              <View style={{ backgroundColor: colors.premium + "30", borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={{ color: colors.premium, fontSize: 9, fontWeight: "700" }}>{premiumLabel}</Text>
              </View>
            )}
          </View>
          {tutor.title && (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {tutor.title}
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 }}>
            <StarRating rating={tutor.ratingAvg} />
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>({tutor.ratingCount})</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tutor.experienceYears} yıl</Text>
          </View>
        </View>
        <View style={{ justifyContent: "center", alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>₺{tutor.hourlyRate}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>/saat</Text>
          {onFavoriteToggle && (
            <TouchableOpacity onPress={onFavoriteToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={favorited ? "heart" : "heart-outline"} size={18} color={favorited ? colors.error : colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {tutor.subjects.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm }}>
          {tutor.subjects.slice(0, 3).map((subject, i) => (
            <View key={i} style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{subject}</Text>
            </View>
          ))}
          {tutor.subjects.length > 3 && (
            <Text style={{ color: colors.textMuted, fontSize: 12, paddingVertical: 4 }}>+{tutor.subjects.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export const TutorCard = memo(TutorCardComponent, (prev, next) =>
  prev.tutor.id === next.tutor.id &&
  prev.favorited === next.favorited &&
  prev.tutor.online === next.tutor.online
);

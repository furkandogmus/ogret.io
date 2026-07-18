import { Text, View } from "react-native";
import type { ProfileCompletion } from "../types";
import { colors, radius, spacing } from "../constants/theme";

interface Props {
  completion?: ProfileCompletion;
  score?: number;
  complete: boolean;
}

export function ProfileCompletionCard({ completion, score, complete }: Props) {
  const currentScore = completion?.score ?? score ?? (complete ? 100 : 0);
  const missingItems = completion?.items.filter((item) => !item.completed) ?? [];

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>Profil tamamlanma durumu</Text>
        <Text testID="profile-completion-score" style={{ color: colors.primary, fontSize: 14, fontWeight: "800" }}>%{currentScore}</Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Profil tamamlanma yüzdesi"
        accessibilityValue={{ min: 0, max: 100, now: currentScore }}
        style={{ height: 8, backgroundColor: colors.surfaceLight, borderRadius: radius.full, overflow: "hidden", marginTop: spacing.sm }}
      >
        <View style={{ width: `${currentScore}%`, height: "100%", backgroundColor: colors.primary, borderRadius: radius.full }} />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: spacing.sm }}>
        {currentScore === 100
          ? "Profiliniz kullanıma hazır."
          : `Eksikler: ${missingItems.slice(0, 3).map((item) => item.label).join(", ") || "profil bilgileri"}`}
      </Text>
    </View>
  );
}

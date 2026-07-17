import { memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

function StarRatingComponent({ rating, size = 16, interactive = false, onRate }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {stars.map((star) => {
        const filled = star <= Math.floor(rating);
        const half = !filled && star - 0.5 <= rating;

        return (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={interactive ? () => onRate?.(star) : undefined}
          >
            <Ionicons
              name={filled ? "star" : half ? "star-half" : "star-outline"}
              size={size}
              color={colors.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const StarRating = memo(StarRatingComponent);

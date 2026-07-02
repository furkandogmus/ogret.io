import { memo, useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { colors } from "../constants/theme";

interface Props {
  uri?: string | null;
  name: string;
  size?: number;
  online?: boolean;
}

function AvatarComponent({ uri, name, size = 48, online }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={{ position: "relative" }} accessibilityLabel={name} accessibilityRole="image">
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceLight }}
          contentFit="cover"
          transition={300}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: size * 0.4, fontWeight: "600" }}>{initials}</Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={{
            position: "absolute", bottom: 0, right: 0,
            width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15,
            backgroundColor: online ? colors.online : colors.textMuted,
            borderWidth: 2, borderColor: colors.background,
          }}
        />
      )}
    </View>
  );
}

export const Avatar = memo(AvatarComponent);

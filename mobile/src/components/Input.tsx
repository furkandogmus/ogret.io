import { View, TextInput, Text, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, style, ...props }: Props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          paddingHorizontal: spacing.md,
          height: 48,
        }}
      >
        {leftIcon && <View style={{ marginRight: 10 }}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            {
              flex: 1,
              color: colors.text,
              fontSize: 15,
              height: "100%",
            },
            style,
          ]}
          {...props}
        />
      </View>
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}

import { View, TextInput, Text, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, style, ...props }: Props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text nativeID={`input-label-${label}`} style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>
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
          accessibilityLabel={label || props.placeholder || "Giriş alanı"}
          accessibilityState={{ disabled: props.editable === false }}
          {...(label ? { accessibilityLabelledBy: `input-label-${label}` } : {})}
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
        {rightIcon && <View style={{ marginLeft: 10 }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }} accessibilityRole="alert">{error}</Text>
      )}
    </View>
  );
}

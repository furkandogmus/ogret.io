import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/theme";

interface Props {
  children: ReactNode;
  style?: any;
}

export function SafeScreen({ children, style }: Props) {
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, ...style }}>{children}</View>;
}

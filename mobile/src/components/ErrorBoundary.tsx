import { Component, type ReactNode, type ErrorInfo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl }}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginTop: spacing.lg, textAlign: "center" }}>
            Bir şeyler yanlış gitti
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.sm, textAlign: "center" }}>
            {this.state.error?.message || "Beklenmeyen bir hata oluştu"}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

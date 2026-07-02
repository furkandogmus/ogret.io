import { useEffect, type ReactNode } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { colors } from "../constants/theme";

interface Props {
  children: ReactNode;
  requiredRole?: "STUDENT" | "TUTOR" | "ADMIN";
  requireAuth?: boolean;
}

export function AuthGuard({ children, requiredRole, requireAuth = true }: Props) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (requireAuth && !isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.back();
    }
  }, [loading, isAuthenticated, user, requiredRole, requireAuth, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (requireAuth && !isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}

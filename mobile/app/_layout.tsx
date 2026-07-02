import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/providers/AuthProvider";
import { WebSocketProvider } from "../src/providers/WebSocketProvider";
import { NotificationProvider } from "../src/providers/NotificationProvider";
import { ToastProvider } from "../src/components/Toast";
import { NetworkBanner } from "../src/components/NetworkBanner";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { colors } from "../src/constants/theme";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { loading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const isSharedScreen = segments[0] === "tutor";

    if (!isAuthenticated && !inAuthGroup && !isSharedScreen) {
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  SplashScreen.hideAsync();

  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="tutor/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="messages/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="subscription" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="verification" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="lesson/request" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="favorites/index" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="lesson/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="lesson/review" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="tutor/availability" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="tutor/listings" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="tutor/references" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="payment/methods" options={{ headerShown: false, animation: "slide_from_right" }} />
      </Stack>
    </NotificationProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <WebSocketProvider>
              <StatusBar style="dark" />
              <NetworkBanner />
              <RootLayoutInner />
            </WebSocketProvider>
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

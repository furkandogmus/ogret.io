import { useState, useEffect, useRef, useCallback, createContext, useContext, type ReactNode } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

type ToastType = "success" | "error" | "info";

interface ToastData {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = "info") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = nextId++;
    setToast({ message, type, id });
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const iconMap = { success: "checkmark-circle" as const, error: "alert-circle" as const, info: "information-circle" as const };
  const colorMap = { success: colors.success, error: colors.error, info: colors.primary };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[styles.container, { opacity, backgroundColor: colorMap[toast.type] }]}
          accessibilityRole="alert"
          accessibilityLabel={toast.message}
          accessibilityLiveRegion="assertive"
        >
          <Ionicons name={iconMap[toast.type]} size={18} color="#fff" />
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", top: 60, left: spacing.md, right: spacing.md,
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    borderRadius: radius.md, zIndex: 9999, elevation: 10,
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "500", flex: 1 },
});

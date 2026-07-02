export const colors = {
  primary: "#6C63FF",
  primaryLight: "#8B85FF",
  primaryDark: "#4A42E0",
  background: "#ffffff",
  surface: "#f5f5f7",
  surfaceLight: "#e8e8ed",
  card: "#ffffff",
  border: "#e0e0e6",
  text: "#1c1c1e",
  textSecondary: "#636366",
  textMuted: "#aeaeb2",
  success: "#34c759",
  warning: "#ff9f0a",
  error: "#ff3b30",
  star: "#ff9f0a",
  online: "#34c759",
  verified: "#007aff",
  premium: "#ff9f0a",
  vip: "#ff3b30",
};

export const statusColors: Record<string, string> = {
  PENDING: colors.warning,
  CONFIRMED: colors.primary,
  IN_PROGRESS: colors.success,
  COMPLETED: colors.textMuted,
  CANCELLED: colors.error,
};

export const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  bodySmall: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 11, lineHeight: 16 },
};

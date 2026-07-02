export const colors = {
  primary: "#059669",
  primaryLight: "#34d399",
  primaryDark: "#047857",
  background: "#fefcf9",
  surface: "#ecfdf5",
  surfaceLight: "#f5ede0",
  card: "#ffffff",
  border: "#e8dcc8",
  text: "#292524",
  textSecondary: "#78716c",
  textMuted: "#a8a090",
  success: "#16a34a",
  warning: "#ff9f0a",
  error: "#d4183d",
  star: "#ff9f0a",
  online: "#16a34a",
  verified: "#059669",
  premium: "#ff9f0a",
  vip: "#d4183d",
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
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
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

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
};

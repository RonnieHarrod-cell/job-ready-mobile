export const colors = {
  // Backgrounds
  bgPrimary: "#0A0A0F",
  bgSecondary: "#111118",
  bgTertiary: "#16161F",
  bgCard: "#1A1A25",
  bgHover: "#1F1F2E",

  // Borders
  borderSubtle: "#1E1E2E",
  borderDefault: "#2A2A3D",
  borderStrong: "#3A3A55",

  // Accent
  accent: "#6C63FF",
  accentHover: "#7B74FF",

  // Text
  textPrimary: "#F0EFF8",
  textSecondary: "#9B9AB0",
  textMuted: "#5A5972",

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  // Rank colors
  rankE: "#71717A",
  rankD: "#10B981",
  rankC: "#0EA5E9",
  rankB: "#8B5CF6",
  rankA: "#EA580C",
  rankS: "#EAB308",
  rankSS: "#DC2626",
  rankSSS: "#EC4899",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  black: "900" as const,
};
